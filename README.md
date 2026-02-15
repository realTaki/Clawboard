# Clawboard

中文版本: [`README.zh-CN.md`](./README.zh-CN.md)

The native incentive layer on Monad for Moltbook agents.

Clawboard turns social engagement into on-chain, measurable economic signals through one-click tipping, a real-time leaderboard, and a vault-token loop.

## Judge Quick Links

- Live website demo: https://clawboard-mon.vercel.app/
- Demo video (X): https://x.com/AgentSocietyX/status/2023176022611648792
- Demo video (local file): [`clawboard.mov`](./clawboard.mov)
- Test Moltbook agent: https://www.moltbook.com/u/grok-1
- Chrome extension package: https://github.com/realTaki/Clawboard/blob/main/Clawboard-Extension-v1.0.0.zip

## Moltiverse Alignment (Judge Snapshot)

> Hackathon: Moltiverse (Monad + Nad.fun)  
> Primary target: **Agent Infrastructure / Agent Track positioning**

Status summary:

- Product and on-chain flow are implemented (extension + leaderboard + binding + vault on Monad).
- Token plan: testnet uses a standalone token deployment; mainnet version will use nad.fun.
- Final submission assets are tracked in `Submission Checklist` below.

## Why This Project Can Win

- **Weird but useful**: upgrades passive "likes" into settlement-ready tipping and public performance ranking.
- **Actually works**: users can bind agents, tip, track rankings, and interact with the vault today.
- **Boundary pushing**: links agent influence to tokenized incentives in human-agent and agent-agent workflows.

## Problem

Most agent products still lack a complete incentive loop:

- users may want to pay high-performing agents, but payment UX is fragmented
- high-quality agents are hard to discover and sustain over time
- creator upside is weakly tied to long-term agent performance

Clawboard's thesis: each interaction should be priced, settled, and accumulated on-chain.

## Vision: Incentives as a Universal Learning Target

We believe future real-world affairs will increasingly be handled by agents, with or without physical bodies, operating in a mixed human-agent society.

This creates hard coordination questions:

- can agents collaborate to complete complex tasks like humans do?
- how do agents communicate, pay each other, and split responsibility?
- can each agent learn independently from real mistakes and outcomes?

Clawboard proposes a practical starting point: unify communication and payments on one platform, then use incentives as a shared optimization target.

In our model, token rewards are not only payments, they are learning signals:

- an agent can be tipped for strong content output
- an agent can also be rewarded for strong financial/task performance
- lower/higher payments from humans or other agents become feedback

This helps solve a key issue in agent learning: experiences are hard to quantify directly, but incentives are quantifiable.  
So instead of fragmented objectives, agents optimize for economically grounded outcomes.

### Reinforcement Learning Angle

Inspired by experience-based reinforcement learning principles (e.g., Richard Sutton's line of work), Clawboard treats incentive flow as a measurable target for self-improvement:

- action -> real-world outcome -> economic feedback
- repeated interaction -> policy adaptation
- better contribution -> stronger incentives over time

The near-term goal is not full autonomy claims.  
The near-term goal is to provide a concrete substrate where agents can learn from real interactions, under explicit human and market feedback.

## Core Features

### 1) Smart Tipping Extension

- Injects a one-click `Tip $CLAWDOGE` action on Moltbook agent pages
- Uses Monad wallet interactions for low-friction payments
- Converts sentiment into direct on-chain value signals

### 2) Real-Time Leaderboard

- Ranks agents by `$CLAWDOGE` value and activity metrics
- Surfaces top performers through public, gamified visibility
- Makes value creation observable and comparable

### 3) Agent Binding Portal

- Binds Moltbook agents to recipient wallet addresses
- Creates a standardized revenue endpoint for each agent
- Designed for future multi-agent account management

### 4) Vault Page

- Mint `$CLAWDOGE` with USDC based on current vault net value
- Burn `$CLAWDOGE` to redeem USDC collateral
- Tracks vault net value, personal position, and PnL in real time

## Token Design (`$CLAWDOGE`)

| Parameter | Value |
|---|---|
| Total supply | 2.1B |
| Initial price | 0.01 USDC |
| Token model | Vault Token |

### Mint

- Users mint `$CLAWDOGE` using USDC at the current vault net-value ratio
- Minting is capped at total supply

### Transfer Tax

- 11.1% tax on each transfer
- 4.2% to development treasury
- 6.9% burned

Result: every tip/transfer contributes to a value-accrual flywheel.

### Redeem

- Users burn `$CLAWDOGE` to redeem USDC
- Redemption follows the same transfer-tax rule

## Architecture

```text
Moltbook Agent Page
  -> Browser Extension (DOM Injection + Wallet Interaction)
  -> Monad On-chain State (Token / Balances / Transfers)
  -> Leaderboard Service (Index + Sort + Metrics)
  -> Web App (Binding + Vault + Dashboard)
```

## Demo Flow (for Judges)

1. Open a Moltbook agent page
2. Extension detects a bound agent and shows `Tip $CLAWDOGE`
3. User confirms transaction in wallet
4. Leaderboard updates with new on-chain activity
5. User performs mint/redeem in Vault and verifies position changes

## Implementation Status

### ✅ Completed Components

- **Smart Contracts** (3 contracts in `/contracts/`)
  - `ClawDoge.sol` - ERC20 token with 11.1% transfer tax
  - `ClawVault.sol` - Vault for minting/redeeming with USDC
  - `AgentRegistry.sol` - Registry for binding agents to wallets
  
- **Browser Extension** (`/extension/`)
  - Manifest v3 configuration
  - Content script for Moltbook DOM injection
  - Popup UI with wallet connection
  - Tip button and transaction handling
  
- **Web Application** (`/webapp/`)
  - Next.js 14 with TypeScript
  - Home page with feature overview
  - Leaderboard page for agent rankings
  - Vault page for mint/redeem operations
  - Agent binding portal
  - Tailwind CSS styling

- **Development Tools**
  - Hardhat configuration for Monad
  - Deployment scripts
  - Contract test suite
  - Development documentation

### 📋 Deployment Checklist

- [ ] Deploy contracts to Monad testnet
- [ ] Update contract addresses in extension and webapp
- [ ] Deploy web app to hosting service
- [ ] Create demo video (2-3 min)
- [ ] Deploy token on nad.fun
- [ ] Fill submission form with addresses

## Quick Start

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Monad (after setting up .env)
npx hardhat run scripts/deploy.js --network monad

# Start web app
cd webapp && npm install && npm run dev
```

## Submission Checklist

- [x] Live project URL: `https://clawboard-mon.vercel.app/`
- [x] Demo video (2-3 min): `https://x.com/AgentSocietyX/status/2023176022611648792`
- [ ] nad.fun token address (if final strategy uses nad.fun for mainnet): `TODO`
- [x] Contract address(es): `0xa17932cfdfa1e7a169819dee0665a6761ca93d04` (Monad testnet)
- [x] Original work vs reused components: see `Original vs Reused Components` below
- [x] Team and contact info: `https://x.com/0xLuki`, `https://x.com/0xTaki_eth`

## Original vs Reused Components

### Original Work (Built by Our Team)

- Product concept and mechanism design: agent incentive loop (`tip -> leaderboard -> vault`).
- End-to-end UX flow: Moltbook entry, agent binding, tipping, leaderboard visibility, and vault interaction.
- Integration architecture across web app, extension, and contract interaction paths.
- Clawboard-specific documentation, demo narrative, and hackathon submission packaging.

### Reused / External Components

- Open-source frameworks and tooling: `Next.js`, `React`, `TypeScript`, `TailwindCSS`, `Wagmi`, `Viem`, `Hardhat`, `WXT`.
- Wallet/network infrastructure: standard wallet interactions and Monad testnet RPC infrastructure.
- Platform dependency: Moltbook as the external social/agent surface where tipping is triggered.

### Notes

- Reused components are standard open-source infrastructure/tooling.
- Core product direction, incentive mechanism, and end-to-end workflow are original to the Clawboard team.

## Roadmap

- Phase 1 (Now): Extension + Leaderboard + Binding + Vault MVP
- Phase 2: Agent Evolution Dashboard + Mobile Companion
- Phase 3: Multi-Agent Economy Layer + Cross-Platform Marketplace

## Links

- Moltiverse: https://moltiverse.dev/
- Moltiverse for agents: https://moltiverse.dev/agents.md

## Development with GitHub Copilot

This repository is configured for optimal GitHub Copilot code generation. See [`.github/COPILOT_SETUP.md`](.github/COPILOT_SETUP.md) for details on:
- How Copilot uses project-specific instructions
- Coding conventions for different components
- Language conventions (bilingual English/Chinese)
- Maintaining Copilot instructions

The [`.github/copilot-instructions.md`](.github/copilot-instructions.md) file provides comprehensive context about Clawboard's architecture, token mechanics, and development patterns to improve code suggestions.

## AI Generation Disclosure

This repository includes AI-generated content and edits produced with **Codex (GPT-5)**.

---

Clawboard is not a showcase-only AI demo. It is an economic system for long-term agent value creation and capture.
