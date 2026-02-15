# GitHub Copilot Custom Instructions for Clawboard

## Project Overview

Clawboard is the native incentive layer on Monad for Moltbook agents, built for the Moltiverse hackathon (Agent + Token Track). The project transforms social engagement into on-chain, measurable economic signals through one-click tipping, real-time leaderboards, and a vault-token loop.

## Core Technologies

- **Blockchain**: Monad (EVM-compatible)
- **Primary Token**: $CLAWDOGE (vault token model)
- **Stablecoin**: USDC
- **Target Platform**: Moltbook (agent interaction platform)
- **Token Launch**: nad.fun

## Architecture Components

1. **Browser Extension**: DOM injection + wallet interaction for one-click tipping
2. **Smart Contracts**: Token contract with transfer tax (11.1% - split 4.2% treasury, 6.9% burn)
3. **Leaderboard Service**: Indexing and ranking agents by $CLAWDOGE value and activity
4. **Agent Binding Portal**: Links Moltbook agents to recipient wallet addresses
5. **Vault System**: Mint/burn $CLAWDOGE with USDC based on vault net value

## Token Design ($CLAWDOGE)

- Total Supply: 2.1B
- Initial Price: 0.01 USDC
- Model: Vault Token
- Transfer Tax: 11.1% (4.2% to treasury, 6.9% burned)
- Mint: Users mint with USDC at current vault net-value ratio
- Burn: Users burn to redeem USDC following transfer-tax rules

## Coding Conventions

### General Principles

- Write clean, maintainable code that aligns with Web3 best practices
- Follow security-first principles, especially for smart contract code
- Use clear variable names that reflect the economic nature of operations (e.g., `vaultNetValue`, `transferTaxRate`)
- Document complex token mechanics and economic flows thoroughly

### Smart Contract Development

- Always validate input parameters and enforce bounds checking
- Use SafeMath or Solidity 0.8+ overflow protection
- Implement proper access controls (e.g., Ownable pattern)
- Add events for all state-changing operations
- Follow checks-effects-interactions pattern to prevent reentrancy
- Test edge cases: zero amounts, maximum amounts, boundary conditions

### Web3 Integration

- Handle wallet connection states gracefully (connected, disconnected, wrong network)
- Provide clear transaction feedback to users
- Implement proper error handling for failed transactions
- Use appropriate gas estimation
- Validate addresses before transactions

### Browser Extension

- Keep background scripts lightweight
- Use content scripts for DOM manipulation
- Implement proper message passing between extension components
- Handle page navigation and SPA routing
- Cache data appropriately to minimize blockchain queries

### Leaderboard & Backend

- Optimize database queries for real-time ranking updates
- Implement pagination for large datasets
- Cache frequently accessed data (rankings, agent stats)
- Use efficient indexing strategies for on-chain event processing
- Handle blockchain reorganizations gracefully

## Key Concepts to Understand

### Incentive-as-Learning-Signal Philosophy

The project treats token rewards not just as payments but as learning signals for agents. When generating code:
- Consider how economic feedback can inform agent behavior
- Design systems that make value creation observable and comparable
- Think about long-term sustainability of incentive loops

### Vault Token Mechanics

Unlike standard tokens, $CLAWDOGE operates as a vault token:
- Minting increases supply but also increases vault collateral
- Burning decreases supply and releases collateral
- Transfer tax creates deflationary pressure while funding development
- Net value per token can fluctuate based on vault performance

### Agent-Centric Design

All features should enhance agent monetization and discovery:
- Make tipping frictionless and visible
- Surface high-performing agents through rankings
- Create clear revenue flows for agent creators
- Enable future multi-agent coordination

## Hackathon Requirements Checklist

When adding features, consider alignment with Moltiverse requirements:
- Ensure on-chain flows use Monad
- Maintain compatibility with nad.fun token standards
- Keep demo-ability in mind (judges need to test quickly)
- Document original work vs. reused components
- Prepare for 2-3 minute demo video requirements

## Testing Priorities

1. **Smart Contract Security**: Transfer tax calculation, vault mint/burn logic, access controls
2. **Transaction Flows**: End-to-end tipping, minting, burning operations
3. **Edge Cases**: Zero amounts, overflow/underflow, reentrancy attacks
4. **User Experience**: Wallet connection, transaction feedback, error states
5. **Indexing Accuracy**: Leaderboard rankings match on-chain state

## Code Review Focus Areas

When reviewing code, pay special attention to:
- Economic logic correctness (especially tax calculations and vault ratios)
- Security vulnerabilities in token transfers and vault operations
- Gas optimization opportunities
- User experience during blockchain operations
- Proper event emission for off-chain indexing

## Common Pitfalls to Avoid

1. **Transfer Tax**: Forgetting to apply 11.1% tax on all transfers
2. **Vault Ratio**: Miscalculating net value per token during mint/burn
3. **Front-Running**: Not considering MEV attacks on vault operations
4. **Gas Costs**: Creating unnecessarily expensive operations
5. **Error Messages**: Providing unclear feedback when transactions fail
6. **Agent Binding**: Not validating agent-to-wallet mappings properly

## Useful Context

- The project is inspired by reinforcement learning principles (action → outcome → economic feedback)
- Target users include both human tippers and future autonomous agents
- The system is designed for eventual multi-agent coordination and communication
- Current phase is MVP focused on core tipping, ranking, binding, and vault flows
- Future phases will include agent evolution dashboards and cross-platform marketplace

## Documentation Standards

- Add inline comments for complex economic calculations
- Document all public smart contract functions with NatSpec
- Include examples in README for key user flows
- Maintain up-to-date architecture diagrams
- Document API endpoints with request/response examples

## AI Generation Disclosure

This project includes AI-generated content using Codex (GPT-5). When contributing:
- Maintain consistency with AI-assisted coding style
- Review AI-generated code carefully for correctness
- Ensure security-critical code is manually verified
- Document significant AI-generated components

## Language Considerations

- Primary documentation is bilingual (English + Chinese)
- Code comments should be in English
- User-facing messages should support internationalization
- Consider Chinese-speaking users in error messages and UI text
