// $CLAWDOGE Token ABI (精简版)
export const CLAWDOGE_ABI = [
    // Read functions
    {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalSupply",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalBurned",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "MAX_SUPPLY",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "name",
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
    // Write functions
    {
        inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }],
        name: "transfer",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "amount", type: "uint256" }],
        name: "burn",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    // Events
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "value", type: "uint256" },
        ],
        name: "Transfer",
        type: "event",
    },
] as const;

// ClawVault ABI (精简版)
export const VAULT_ABI = [
    // Read functions
    {
        inputs: [{ name: "monAmount", type: "uint256" }],
        name: "calculateMintOutput",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "clawdogeAmount", type: "uint256" }],
        name: "calculateRedeemOutput",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getNetValue",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getVaultInfo",
        outputs: [
            { name: "vaultBalance", type: "uint256" },
            { name: "circulatingSupply", type: "uint256" },
            { name: "maxSupply", type: "uint256" },
            { name: "burned", type: "uint256" },
            { name: "netValue", type: "uint256" },
            { name: "_totalMinted", type: "uint256" },
            { name: "_totalRedeemed", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalMinted",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalRedeemed",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    // Write functions
    {
        inputs: [],
        name: "mint",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [{ name: "clawdogeAmount", type: "uint256" }],
        name: "redeem",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    // Events
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "user", type: "address" },
            { indexed: false, name: "monAmount", type: "uint256" },
            { indexed: false, name: "clawdogeAmount", type: "uint256" },
        ],
        name: "Minted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "user", type: "address" },
            { indexed: false, name: "clawdogeAmount", type: "uint256" },
            { indexed: false, name: "monAmount", type: "uint256" },
        ],
        name: "Redeemed",
        type: "event",
    },
] as const;

// AgentRegistry ABI (精简版)
export const AGENT_REGISTRY_ABI = [
    // Read functions
    {
        inputs: [{ name: "agentId", type: "string" }],
        name: "getAgent",
        outputs: [
            {
                components: [
                    { name: "agentId", type: "string" },
                    { name: "displayName", type: "string" },
                    { name: "wallet", type: "address" },
                    { name: "tipCount", type: "uint256" },
                    { name: "registeredAt", type: "uint256" },
                    { name: "isActive", type: "bool" },
                ],
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "agentId", type: "string" }],
        name: "getAgentBalance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "agentId", type: "string" }],
        name: "getAgentWallet",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "agentId", type: "string" }],
        name: "getAgentBalance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "offset", type: "uint256" }, { name: "limit", type: "uint256" }],
        name: "getLeaderboard",
        outputs: [
            {
                components: [
                    { name: "agentId", type: "string" },
                    { name: "displayName", type: "string" },
                    { name: "wallet", type: "address" },
                    { name: "tipCount", type: "uint256" },
                    { name: "registeredAt", type: "uint256" },
                    { name: "isActive", type: "bool" },
                ],
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "agentCount",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "", type: "address" }],
        name: "walletToAgent",
        outputs: [{ name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    // Write functions
    {
        inputs: [{ name: "agentId", type: "string" }, { name: "displayName", type: "string" }],
        name: "registerAgent",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "agentId", type: "string" }, { name: "newWallet", type: "address" }],
        name: "updateAgentWallet",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "agentId", type: "string" }, { name: "amount", type: "uint256" }],
        name: "tip",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "agentId", type: "string" }, { name: "tipper", type: "address" }, { name: "amount", type: "uint256" }],
        name: "recordTip",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    // Events
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "agentHash", type: "bytes32" },
            { indexed: false, name: "agentId", type: "string" },
            { indexed: false, name: "displayName", type: "string" },
            { indexed: false, name: "wallet", type: "address" },
        ],
        name: "AgentRegistered",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "agentHash", type: "bytes32" },
            { indexed: true, name: "tipper", type: "address" },
            { indexed: false, name: "amount", type: "uint256" },
        ],
        name: "TipRecorded",
        type: "event",
    },
] as const;
