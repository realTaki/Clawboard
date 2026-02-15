// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentRegistry
 * @notice Registry for binding Moltbook agents to wallet addresses
 * @dev Allows agent creators to register their agents and receive tips
 */
contract AgentRegistry is Ownable {
    struct Agent {
        string moltbookId;      // Moltbook agent identifier
        address payable wallet; // Wallet to receive tips
        address owner;          // Agent owner
        bool isActive;          // Active status
        uint256 totalTips;      // Total tips received (for leaderboard)
        uint256 tipCount;       // Number of tips received
    }
    
    // Mapping from Moltbook agent ID to Agent data
    mapping(string => Agent) public agents;
    
    // Mapping from wallet to agent IDs (one wallet can have multiple agents)
    mapping(address => string[]) public walletToAgents;
    
    // Array of all registered agent IDs
    string[] public agentIds;
    
    event AgentRegistered(string indexed moltbookId, address indexed wallet, address indexed owner);
    event AgentUpdated(string indexed moltbookId, address indexed newWallet);
    event AgentDeactivated(string indexed moltbookId);
    event TipRecorded(string indexed moltbookId, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a new agent
     * @param moltbookId Moltbook agent identifier
     * @param wallet Wallet address to receive tips
     */
    function registerAgent(string memory moltbookId, address payable wallet) external {
        require(bytes(moltbookId).length > 0, "Invalid Moltbook ID");
        require(wallet != address(0), "Invalid wallet address");
        require(agents[moltbookId].wallet == address(0), "Agent already registered");
        
        agents[moltbookId] = Agent({
            moltbookId: moltbookId,
            wallet: wallet,
            owner: msg.sender,
            isActive: true,
            totalTips: 0,
            tipCount: 0
        });
        
        walletToAgents[wallet].push(moltbookId);
        agentIds.push(moltbookId);
        
        emit AgentRegistered(moltbookId, wallet, msg.sender);
    }

    /**
     * @notice Update agent wallet (only owner)
     * @param moltbookId Moltbook agent identifier
     * @param newWallet New wallet address
     */
    function updateAgentWallet(string memory moltbookId, address payable newWallet) external {
        require(agents[moltbookId].owner == msg.sender, "Not agent owner");
        require(newWallet != address(0), "Invalid wallet address");
        
        agents[moltbookId].wallet = newWallet;
        walletToAgents[newWallet].push(moltbookId);
        
        emit AgentUpdated(moltbookId, newWallet);
    }

    /**
     * @notice Deactivate agent (only owner)
     * @param moltbookId Moltbook agent identifier
     */
    function deactivateAgent(string memory moltbookId) external {
        require(agents[moltbookId].owner == msg.sender, "Not agent owner");
        
        agents[moltbookId].isActive = false;
        
        emit AgentDeactivated(moltbookId);
    }

    /**
     * @notice Record a tip (callable by anyone, for tracking purposes)
     * @param moltbookId Moltbook agent identifier
     * @param amount Tip amount
     */
    function recordTip(string memory moltbookId, uint256 amount) external {
        require(agents[moltbookId].isActive, "Agent not active");
        
        agents[moltbookId].totalTips += amount;
        agents[moltbookId].tipCount += 1;
        
        emit TipRecorded(moltbookId, amount);
    }

    /**
     * @notice Get agent details
     * @param moltbookId Moltbook agent identifier
     */
    function getAgent(string memory moltbookId) external view returns (Agent memory) {
        return agents[moltbookId];
    }

    /**
     * @notice Get all agent IDs
     */
    function getAllAgentIds() external view returns (string[] memory) {
        return agentIds;
    }

    /**
     * @notice Get agents by wallet
     * @param wallet Wallet address
     */
    function getAgentsByWallet(address wallet) external view returns (string[] memory) {
        return walletToAgents[wallet];
    }

    /**
     * @notice Get total number of registered agents
     */
    function getAgentCount() external view returns (uint256) {
        return agentIds.length;
    }
}
