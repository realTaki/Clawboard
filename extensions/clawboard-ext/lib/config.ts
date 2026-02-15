// Clawboard Configuration
export const CONFIG = {
    // Clawboard Main Site
    MAIN_SITE_URL: 'https://clawboard-mon.vercel.app',

    // Monad Testnet
    CHAIN_ID: 10143,
    RPC_URL: 'https://testnet-rpc.monad.xyz',

    // Contract Addresses (Monad Testnet)
    CLAWDOGE_ADDRESS: '0x88Be0918a9803a4741F2E43962d6E088C2DD0C07',
    AGENT_REGISTRY_ADDRESS: '0x6dbb08Ff10C5256b55e36f67fA7E1ad83Af7cB1F',
    CLAWDOGE_DECIMALS: 18,

    // Default tip amount
    DEFAULT_TIP_AMOUNT: 100,
    PREDEFINED_TIP_AMOUNTS: [10, 50, 100, 500, 1000],
};

// Agent data from chain
export interface Agent {
    agentId: string;
    displayName: string;
    wallet: string;
    balance: string; // formatted balance from getAgentBalance()
    tipCount: number;
    isActive: boolean;
}

// AgentRegistry ABI (read-only subset)
export const AGENT_REGISTRY_ABI = [
    {
        name: 'getAgent',
        type: 'function',
        inputs: [{ name: 'agentId', type: 'string' }],
        outputs: [{
            name: '',
            type: 'tuple',
            components: [
                { name: 'agentId', type: 'string' },
                { name: 'displayName', type: 'string' },
                { name: 'wallet', type: 'address' },
                { name: 'tipCount', type: 'uint256' },
                { name: 'registeredAt', type: 'uint256' },
                { name: 'isActive', type: 'bool' },
            ],
        }],
        stateMutability: 'view',
    },
    {
        name: 'getAgentBalance',
        type: 'function',
        inputs: [{ name: 'agentId', type: 'string' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;
