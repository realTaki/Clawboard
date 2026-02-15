// Background service worker for extension
console.log('Clawboard extension loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Clawboard extension installed');
    // Open welcome page or settings
  } else if (details.reason === 'update') {
    console.log('Clawboard extension updated');
  }
});

// Message handler for communication with content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_AGENT_WALLET') {
    // Query contract for agent wallet
    getAgentWalletFromContract(request.agentId)
      .then(wallet => sendResponse({ wallet }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.type === 'RECORD_TIP') {
    // Record tip on-chain
    recordTipTransaction(request.agentId, request.amount)
      .then(txHash => sendResponse({ txHash }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

// Query agent wallet from AgentRegistry contract
async function getAgentWalletFromContract(agentId) {
  // Implementation would use ethers.js or web3.js to query contract
  // This is a placeholder
  console.log('Querying agent wallet for:', agentId);
  return null;
}

// Record tip in AgentRegistry contract
async function recordTipTransaction(agentId, amount) {
  // Implementation would send transaction to recordTip function
  console.log('Recording tip:', agentId, amount);
  return null;
}
