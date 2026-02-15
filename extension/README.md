# Clawboard - Extension Installation Guide

## Chrome/Brave Installation

1. Clone or download this repository
2. Open Chrome/Brave and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension` directory from this repository
6. The Clawboard extension icon should appear in your toolbar

## Firefox Installation

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Navigate to the `extension` directory and select `manifest.json`
6. The extension will be loaded temporarily (until browser restart)

## Configuration

After installation, update the contract addresses in `extension/content.js`:

```javascript
const CLAWBOARD_CONFIG = {
  registryAddress: 'YOUR_DEPLOYED_REGISTRY_ADDRESS',
  tokenAddress: 'YOUR_DEPLOYED_TOKEN_ADDRESS',
  chainId: 41454,
  rpcUrl: 'https://rpc.monad.xyz'
};
```

## Usage

1. Navigate to a Moltbook agent page
2. The extension will inject a "Tip $CLAWDOGE" button
3. Click the button to tip the agent
4. Connect your wallet when prompted
5. Enter tip amount and confirm transaction

## Troubleshooting

- **Button not appearing**: Check that you're on a valid Moltbook agent page
- **Wallet connection fails**: Ensure MetaMask is installed and on Monad network
- **Transaction fails**: Verify you have sufficient $CLAWDOGE balance

## Development

To modify the extension:

1. Make changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Clawboard extension card
4. Reload the page you're testing on
