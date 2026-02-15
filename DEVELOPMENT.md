# Development Setup

## Prerequisites

- Node.js 18+ and npm/pnpm
- MetaMask or another Web3 wallet
- Access to Monad testnet

## Project Structure

This is a monorepo project with the following structure:

```
Clawboard/
├── apps/
│   └── web/              # Next.js web application
├── extensions/
│   └── clawboard-ext/    # Browser extension (WXT framework)
├── contracts/            # Solidity smart contracts
│   ├── contracts/        # Contract source files
│   ├── scripts/          # Deployment scripts
│   └── test/             # Contract tests
├── .github/              # GitHub Actions & Copilot instructions
└── README.md
```

## Smart Contracts

The contracts are in the `contracts/` directory using Hardhat with TypeScript.

### Install Dependencies

```bash
cd contracts
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Deploy to Monad

1. Create a `.env` file in the `contracts/` directory:

```bash
MONAD_RPC_URL=https://rpc.monad.xyz
PRIVATE_KEY=your_private_key_here
USDC_ADDRESS=0x... # USDC contract address on Monad
```

2. Deploy contracts:

```bash
npm run deploy:monad
```

The deployment will output contract addresses. Update these in the web app and extension configurations.

## Browser Extension

The extension is built with WXT framework in `extensions/clawboard-ext/`.

### Setup

```bash
cd extensions/clawboard-ext
npm install
```

### Development

```bash
npm run dev  # Chrome
npm run dev:firefox  # Firefox
```

### Build for Production

```bash
npm run build
npm run build:firefox
```

### Configuration

After deploying contracts, update `extensions/clawboard-ext/lib/config.ts` with the deployed contract addresses.

## Web Application

The web app is a Next.js application in `apps/web/`.

### Install Dependencies

```bash
cd apps/web
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

### Configuration

Set environment variables in `apps/web/.env.local`:

```bash
NEXT_PUBLIC_CHAIN_ID=41454
NEXT_PUBLIC_RPC_URL=https://rpc.monad.xyz
NEXT_PUBLIC_CLAWDOGE_ADDRESS=0x...
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_VAULT_ADDRESS=0x...
```


## Usage

### 1. Register Your Agent

Use the web app or interact with the AgentRegistry contract directly:

```typescript
// Using the contract
await agentRegistry.registerAgent("your-agent-id", "Display Name");
```

### 2. Mint $CLAWDOGE Tokens

1. Visit the Vault page in the web app
2. Connect your wallet
3. Approve USDC spending
4. Mint tokens at current vault net value

### 3. Tip Agents

1. Install and configure the browser extension
2. Visit a Moltbook agent page
3. Click "Tip $CLAWDOGE"
4. Enter amount and confirm transaction

### 4. View Leaderboard

Visit the leaderboard page in the web app to see:
- Top agents by token balance
- Total tips received
- Number of tips

## Token Economics

- **Total Supply**: 2.1B $CLAWDOGE
- **Transfer Tax**: 11.1%
  - 4.2% to team wallet
  - 6.9% burned
- **Vault Model**: Mint with USDC, redeem by burning tokens

## Language Conventions

- **Smart Contract Comments**: Use Chinese for NatSpec `@notice` documentation and inline comments, English for `require()` error messages
- **Other Code**: Prefer English, but Chinese is acceptable in context-specific situations
- **User-facing Messages**: Support internationalization (i18n)

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
