import { defineChain } from 'viem';

export const monadTestnet = defineChain({
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Monad',
        symbol: 'MON',
    },
    rpcUrls: {
        default: {
            http: ['https://testnet-rpc.monad.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Monad Explorer',
            url: 'https://explorer.monad.xyz',
        },
    },
    testnet: true,
});

// 合约地址 (已部署到 Monad Testnet)
export const CONTRACT_ADDRESSES = {
    CLAWDOGE: process.env.NEXT_PUBLIC_CLAWDOGE_ADDRESS || '0x88Be0918a9803a4741F2E43962d6E088C2DD0C07',
    AGENT_REGISTRY: process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || '0x6dbb08Ff10C5256b55e36f67fA7E1ad83Af7cB1F',
    VAULT: process.env.NEXT_PUBLIC_VAULT_ADDRESS || '0xA17932cfDfA1e7A169819DeE0665A6761Ca93d04',
};

// $CLAWDOGE 代币信息
export const CLAWDOGE_TOKEN = {
    symbol: 'CLAWDOGE',
    name: 'ClawDoge',
    decimals: 18,
    maxSupply: '2100000000000000000000000000', // 2.1B * 10^18
    transferTax: 0.111, // 11.1%
    teamTax: 0.042,     // 4.2%
    burnTax: 0.069,     // 6.9%
};

