// Content script for Moltbook agent pages
// Injects tip button and handles tipping interactions

const CLAWBOARD_CONFIG = {
  registryAddress: '0x...', // TODO: Replace with deployed AgentRegistry contract address
  tokenAddress: '0x...',    // TODO: Replace with deployed ClawDoge token address
  chainId: 41454,           // Monad testnet
  rpcUrl: 'https://rpc.monad.xyz'
};

// Validate configuration
if (CLAWBOARD_CONFIG.registryAddress === '0x...' || CLAWBOARD_CONFIG.tokenAddress === '0x...') {
  console.warn('Clawboard: Contract addresses not configured. Please update CLAWBOARD_CONFIG in content.js');
}

// Inject tip button into Moltbook agent page
function injectTipButton() {
  // Find agent profile container
  const agentContainer = document.querySelector('[data-agent-profile]') || 
                         document.querySelector('.agent-header') ||
                         document.querySelector('.profile-header');
  
  if (!agentContainer || document.querySelector('.clawboard-tip-btn')) {
    return; // Already injected or container not found
  }

  // Extract agent ID from URL or page
  const agentId = extractAgentId();
  if (!agentId) {
    console.log('Clawboard: Agent ID not found');
    return;
  }

  // Create tip button
  const tipButton = document.createElement('button');
  tipButton.className = 'clawboard-tip-btn';
  tipButton.innerHTML = `
    <span class="tip-icon">💰</span>
    <span class="tip-text">Tip $CLAWDOGE</span>
  `;
  
  tipButton.addEventListener('click', () => handleTipClick(agentId));
  
  // Insert button
  agentContainer.appendChild(tipButton);
  console.log('Clawboard: Tip button injected for agent', agentId);
}

// Extract agent ID from URL or page data
function extractAgentId() {
  // Try URL pattern: moltbook.com/agent/{agentId}
  const urlMatch = window.location.pathname.match(/\/agent\/([^\/]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  // Try data attribute
  const agentElement = document.querySelector('[data-agent-id]');
  if (agentElement) {
    return agentElement.getAttribute('data-agent-id');
  }
  
  return null;
}

// Handle tip button click
async function handleTipClick(agentId) {
  try {
    // Check if wallet is connected
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask or another Web3 wallet to tip agents!');
      return;
    }

    // Request wallet connection
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    if (!accounts || accounts.length === 0) {
      alert('Please connect your wallet first');
      return;
    }

    // Check if on Monad network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (parseInt(chainId, 16) !== CLAWBOARD_CONFIG.chainId) {
      // Request network switch
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CLAWBOARD_CONFIG.chainId.toString(16)}` }],
        });
      } catch (switchError) {
        alert('Please switch to Monad network to tip agents');
        return;
      }
    }

    // Show tip amount dialog
    const amount = prompt('Enter tip amount in $CLAWDOGE:', '100');
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    // Send tip transaction
    await sendTip(agentId, amount, accounts[0]);
    
  } catch (error) {
    console.error('Clawboard tip error:', error);
    alert(`Failed to send tip: ${error.message}`);
  }
}

// Send tip transaction
async function sendTip(agentId, amount, fromAddress) {
  try {
    // Get agent wallet from registry
    const agentWallet = await getAgentWallet(agentId);
    if (!agentWallet) {
      alert('Agent not registered in Clawboard. Please ask the agent owner to register.');
      return;
    }

    // Convert amount to wei (18 decimals)
    // Use string multiplication to avoid precision loss
    const amountInWeiDecimal = (parseFloat(amount) * 1e18).toFixed(0);
    const amountInWeiHex = BigInt(amountInWeiDecimal).toString(16);

    // ERC20 transfer function signature
    const transferData = encodeTransfer(agentWallet, amountInWeiHex);

    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: fromAddress,
        to: CLAWBOARD_CONFIG.tokenAddress,
        data: transferData,
        value: '0x0'
      }]
    });

    console.log('Clawboard: Tip sent! Transaction:', txHash);
    
    // Show success message
    showTipSuccess(amount, txHash);
    
    // Record tip in registry
    await recordTipOnChain(agentId, amountWei);
    
  } catch (error) {
    console.error('Tip transaction failed:', error);
    throw error;
  }
}

// Get agent wallet from registry contract
async function getAgentWallet(agentId) {
  // This would call the AgentRegistry contract
  // For now, return a placeholder
  // In production, this should query the contract via RPC
  console.log('Querying agent wallet for:', agentId);
  return null; // Replace with actual contract call
}

// Encode ERC20 transfer function call
function encodeTransfer(to, amount) {
  // transfer(address,uint256)
  const signature = '0xa9059cbb';
  const paddedAddress = to.substring(2).padStart(64, '0');
  const paddedAmount = amount.padStart(64, '0');
  return signature + paddedAddress + paddedAmount;
}

// Record tip in AgentRegistry
async function recordTipOnChain(agentId, amount) {
  // This would call recordTip on AgentRegistry contract
  console.log('Recording tip on-chain:', agentId, amount);
  // Implementation needed
}

// Show success notification
function showTipSuccess(amount, txHash) {
  const notification = document.createElement('div');
  notification.className = 'clawboard-notification success';
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">✅</span>
      <div class="notification-text">
        <strong>Tip sent successfully!</strong>
        <p>${amount} $CLAWDOGE</p>
        <a href="https://explorer.monad.xyz/tx/${txHash}" target="_blank">View transaction</a>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Initialize on page load
function init() {
  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTipButton);
  } else {
    injectTipButton();
  }

  // Re-inject on navigation (for SPAs)
  const observer = new MutationObserver(() => {
    injectTipButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Start extension
init();
