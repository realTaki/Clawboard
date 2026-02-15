// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AgentRegistry
 * @notice Agent 注册合约 - 管理 AI Agent 与钱包地址的绑定关系
 * 
 * 功能:
 * - Agent 拥有者通过签名绑定钱包地址
 * - 查询 Agent 绑定信息
 * - 一站式打赏: transferFrom + 统计更新
 */
contract AgentRegistry is Ownable {
    struct AgentInfo {
        string agentId;       // Moltbook Agent ID
        string displayName;   // 显示名称
        address wallet;       // 接收打赏的钱包地址
        uint256 totalReceived;// 累计实际收到的打赏金额 (CLAWDOGE, 扣除转账税后)
        uint256 tipCount;     // 累计被打赏次数
        uint256 registeredAt; // 注册时间
        bool isActive;        // 是否激活
    }

    IERC20 public immutable clawdoge;

    // agentId hash => AgentInfo
    mapping(bytes32 => AgentInfo) public agents;
    
    // wallet => agentId hash (反向映射)
    mapping(address => bytes32) public walletToAgent;
    
    // 已注册的 Agent ID 列表
    bytes32[] public agentIds;
    
    // 已注册 Agent 数量
    uint256 public agentCount;

    event AgentRegistered(bytes32 indexed agentHash, string agentId, string displayName, address wallet);
    event AgentUpdated(bytes32 indexed agentHash, address newWallet);
    event TipRecorded(bytes32 indexed agentHash, address indexed tipper, uint256 amount);

    constructor(address _clawdoge) Ownable(msg.sender) {
        require(_clawdoge != address(0), "Invalid token address");
        clawdoge = IERC20(_clawdoge);
    }

    /**
     * @notice 注册 Agent
     * @param agentId Moltbook Agent ID
     * @param displayName 显示名称
     */
    function registerAgent(string calldata agentId, string calldata displayName) external {
        bytes32 agentHash = keccak256(abi.encodePacked(agentId));
        
        require(!agents[agentHash].isActive, "Agent already registered");
        require(bytes(agentId).length > 0, "Empty agent ID");
        require(bytes(displayName).length > 0, "Empty display name");
        
        agents[agentHash] = AgentInfo({
            agentId: agentId,
            displayName: displayName,
            wallet: msg.sender,
            totalReceived: 0,
            tipCount: 0,
            registeredAt: block.timestamp,
            isActive: true
        });
        
        walletToAgent[msg.sender] = agentHash;
        agentIds.push(agentHash);
        agentCount++;
        
        emit AgentRegistered(agentHash, agentId, displayName, msg.sender);
    }

    /**
     * @notice 更新 Agent 的钱包地址
     * @param agentId Moltbook Agent ID
     * @param newWallet 新钱包地址
     */
    function updateAgentWallet(string calldata agentId, address newWallet) external {
        bytes32 agentHash = keccak256(abi.encodePacked(agentId));
        AgentInfo storage agent = agents[agentHash];
        
        require(agent.isActive, "Agent not found");
        require(agent.wallet == msg.sender, "Not agent owner");
        require(newWallet != address(0), "Invalid wallet");
        
        // 清除旧的反向映射
        delete walletToAgent[agent.wallet];
        
        agent.wallet = newWallet;
        walletToAgent[newWallet] = agentHash;
        
        emit AgentUpdated(agentHash, newWallet);
    }

    /**
     * @notice 打赏 Agent (一站式: transferFrom + 更新统计)
     * @dev 用户需先 approve 本合约足够的 CLAWDOGE 额度
     * @param agentId Agent ID
     * @param amount 打赏金额 (CLAWDOGE, 18 decimals)
     */
    function tip(string calldata agentId, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        bytes32 agentHash = keccak256(abi.encodePacked(agentId));
        AgentInfo storage agent = agents[agentHash];
        
        require(agent.isActive, "Agent not found");
        require(agent.wallet != address(0), "Agent has no wallet");

        // 记录转账前的余额
        uint256 balanceBefore = clawdoge.balanceOf(agent.wallet);

        // transferFrom: 从打赏者转到 Agent 钱包
        bool success = clawdoge.transferFrom(msg.sender, agent.wallet, amount);
        require(success, "Transfer failed");

        // 记录转账后的余额，计算实际收到的金额（扣除转账税后）
        uint256 balanceAfter = clawdoge.balanceOf(agent.wallet);
        uint256 actualReceived = balanceAfter - balanceBefore;

        // 更新统计（记录实际收到的金额）
        agent.totalReceived += actualReceived;
        agent.tipCount++;
        
        emit TipRecorded(agentHash, msg.sender, amount);
    }

    /**
     * @notice 记录一次打赏 (仅 owner 可调用，用于历史数据补录)
     * @dev 此函数直接添加 amount 到 totalReceived，用于补录历史数据时应传入实际收到的金额
     * @param agentId Agent ID
     * @param tipper 打赏者地址
     * @param amount 实际收到的金额（应为扣除转账税后的金额）
     */
    function recordTip(string calldata agentId, address tipper, uint256 amount) external onlyOwner {
        bytes32 agentHash = keccak256(abi.encodePacked(agentId));
        AgentInfo storage agent = agents[agentHash];
        
        require(agent.isActive, "Agent not found");
        
        agent.totalReceived += amount;
        agent.tipCount++;
        
        emit TipRecorded(agentHash, tipper, amount);
    }

    /**
     * @notice 查询 Agent 信息
     */
    function getAgent(string calldata agentId) external view returns (AgentInfo memory) {
        bytes32 agentHash = keccak256(abi.encodePacked(agentId));
        return agents[agentHash];
    }

    /**
     * @notice 查询 Agent 的钱包地址
     */
    function getAgentWallet(string calldata agentId) external view returns (address) {
        bytes32 agentHash = keccak256(abi.encodePacked(agentId));
        return agents[agentHash].wallet;
    }

    /**
     * @notice 批量获取排行榜数据
     * @param offset 起始位置
     * @param limit 数量
     */
    function getLeaderboard(uint256 offset, uint256 limit) 
        external view returns (AgentInfo[] memory) 
    {
        uint256 end = offset + limit;
        if (end > agentIds.length) {
            end = agentIds.length;
        }
        
        uint256 length = end > offset ? end - offset : 0;
        AgentInfo[] memory result = new AgentInfo[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = agents[agentIds[offset + i]];
        }
        
        return result;
    }
}
