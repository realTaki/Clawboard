// Popup script for extension

// Constants for address display
const ADDRESS_PREFIX_LENGTH = 6;
const ADDRESS_SUFFIX_START = 38;

document.addEventListener('DOMContentLoaded', async () => {
  const connectBtn = document.getElementById('connect-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const walletStatus = document.getElementById('wallet-status');
  const networkStatus = document.getElementById('network-status');

  // Check wallet connection on load
  await checkWalletConnection();

  // Connect wallet button
  connectBtn.addEventListener('click', async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask or another Web3 wallet');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        walletStatus.textContent = `${accounts[0].substring(0, ADDRESS_PREFIX_LENGTH)}...${accounts[0].substring(ADDRESS_SUFFIX_START)}`;
        connectBtn.textContent = 'Connected';
        connectBtn.disabled = true;
        
        // Check network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        updateNetworkStatus(parseInt(chainId, 16));
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect wallet');
    }
  });

  // Settings button
  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://clawboard.xyz/settings' });
  });

  // Check if wallet is already connected
  async function checkWalletConnection() {
    if (typeof window.ethereum === 'undefined') {
      walletStatus.textContent = 'No wallet detected';
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (accounts && accounts.length > 0) {
        walletStatus.textContent = `${accounts[0].substring(0, ADDRESS_PREFIX_LENGTH)}...${accounts[0].substring(ADDRESS_SUFFIX_START)}`;
        connectBtn.textContent = 'Connected';
        connectBtn.disabled = true;
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        updateNetworkStatus(parseInt(chainId, 16));
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
    }
  }

  // Update network status
  function updateNetworkStatus(chainId) {
    const networks = {
      1: 'Ethereum Mainnet',
      41454: 'Monad Testnet',
      1337: 'Localhost'
    };

    networkStatus.textContent = networks[chainId] || `Chain ID: ${chainId}`;
    
    if (chainId !== 41454) {
      networkStatus.style.color = '#ef4444';
    } else {
      networkStatus.style.color = '#10b981';
    }
  }
});
