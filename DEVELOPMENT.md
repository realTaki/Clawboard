# Development Setup

## Security Notice

**IMPORTANT:** This project uses Next.js 15.2.9 to address critical security vulnerabilities:
- DoS via HTTP request deserialization in React Server Components
- RCE in React flight protocol
- Authorization bypass in middleware
- Cache poisoning
- Server-Side Request Forgery

Always ensure you're using the latest patched versions of dependencies. Run `npm audit` regularly.

## Prerequisites

- Node.js 18+ and npm
- MetaMask or another Web3 wallet
- Access to Monad testnet

## Project Structure

```
Clawboard/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment scripts
├── test/              # Contract tests
├── extension/         # Browser extension
├── webapp/            # Next.js web application
└── README.md
```

## Smart Contracts

### Install Dependencies

```bash
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy to Monad

1. Create a `.env` file:

```bash
MONAD_RPC_URL=https://rpc.monad.xyz
PRIVATE_KEY=your_private_key_here
```

2. Deploy contracts:

```bash
npx hardhat run scripts/deploy.js --network monad
```

The deployment will output contract addresses. Update these in:
- `extension/content.js` (CLAWBOARD_CONFIG)
- `webapp/src/config.ts` (if created)

## Browser Extension

### Setup

```bash
cd extension
```

### Install in Browser

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` directory

### Update Configuration

After deploying contracts, update `content.js`:

```javascript
const CLAWBOARD_CONFIG = {
  registryAddress: 'YOUR_AGENT_REGISTRY_ADDRESS',
  tokenAddress: 'YOUR_CLAWDOGE_TOKEN_ADDRESS',
  chainId: 41454,
  rpcUrl: 'https://rpc.monad.xyz'
};
```

## Web Application

### Install Dependencies

```bash
cd webapp
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

### 1. Register Your Agent

Use the AgentRegistry contract to bind your Moltbook agent:

```solidity
agentRegistry.registerAgent("your-moltbook-agent-id", walletAddress);
```

### 2. Mint $CLAWDOGE Tokens

1. Visit the Vault page
2. Connect your wallet
3. Approve USDC spending
4. Mint tokens at current vault net value

### 3. Tip Agents

1. Install the browser extension
2. Visit a Moltbook agent page
3. Click "Tip $CLAWDOGE"
4. Enter amount and confirm transaction

### 4. View Leaderboard

Visit the leaderboard page to see:
- Top agents by tips received
- Total tip amounts
- Number of tips

## Token Economics

- **Total Supply**: 2.1B $CLAWDOGE
- **Initial Price**: 0.01 USDC
- **Transfer Tax**: 11.1%
  - 4.2% to treasury
  - 6.9% burned

## Contract Addresses

After deployment, update this section with actual addresses:

- **AgentRegistry**: TBD
- **ClawDoge Token**: TBD
- **ClawVault**: TBD
- **Treasury**: TBD

## Security

- All contracts use OpenZeppelin libraries
- Reentrancy protection on vault operations
- Owner-only admin functions
- Tax exemption for vault and treasury

## Testing

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

## Troubleshooting

### Extension not detecting agent page

- Check if URL matches pattern in manifest.json
- Verify agent ID extraction logic in content.js

### Transaction fails

- Ensure you're on Monad network (chain ID 41454)
- Check you have sufficient $CLAWDOGE balance
- Verify contract addresses are correct

### Vault operations fail

- Ensure USDC approval is set
- Check vault has sufficient liquidity for redemptions
- Verify you're not exceeding max supply on mints

## Contributing

This is a hackathon project for Moltiverse (Monad + Nad.fun). Contributions welcome!

## License

MIT
