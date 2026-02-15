// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ClawDoge.sol";

/**
 * @title ClawVault
 * @notice $CLAWDOGE 金库合约 - 铸造与赎回
 * 
 * 机制:
 * - 铸造: 用户支付 MON，按当前净值比例获得 $CLAWDOGE
 * - 赎回: 用户销毁 $CLAWDOGE，按当前净值比例取回 MON (扣除赎回税)
 * - 赎回税: 11.1% (与转账税相同)
 * - 净值 = 金库 MON 余额 / 流通量
 */
contract ClawVault is Ownable, ReentrancyGuard {
    ClawDoge public immutable clawdoge;
    
    // 赎回税率 (基于 1000 的精度)
    uint256 public constant REDEEM_TAX_RATE = 111; // 11.1%
    uint256 public constant TAX_DENOMINATOR = 1000;
    
    // 初始价格: 1 MON = 1000 CLAWDOGE
    uint256 public constant INITIAL_RATE = 1000;
    
    // 统计
    uint256 public totalMinted;
    uint256 public totalRedeemed;

    event Minted(address indexed user, uint256 monAmount, uint256 clawdogeAmount);
    event Redeemed(address indexed user, uint256 clawdogeAmount, uint256 monAmount);

    constructor(address _clawdoge) Ownable(msg.sender) {
        require(_clawdoge != address(0), "Invalid token");
        clawdoge = ClawDoge(_clawdoge);
    }

    /**
     * @notice 铸造 $CLAWDOGE - 发送 MON 获得代币
     */
    function mint() external payable nonReentrant {
        require(msg.value > 0, "Must send MON");
        
        uint256 clawdogeAmount = calculateMintOutput(msg.value);
        require(clawdogeAmount > 0, "Amount too small");
        
        clawdoge.mint(msg.sender, clawdogeAmount);
        totalMinted += clawdogeAmount;
        
        emit Minted(msg.sender, msg.value, clawdogeAmount);
    }

    /**
     * @notice 赎回 $CLAWDOGE - 销毁代币取回 MON
     * @param clawdogeAmount 要赎回的代币数量
     */
    function redeem(uint256 clawdogeAmount) external nonReentrant {
        require(clawdogeAmount > 0, "Amount must be > 0");
        require(clawdoge.balanceOf(msg.sender) >= clawdogeAmount, "Insufficient balance");
        require(clawdoge.allowance(msg.sender, address(this)) >= clawdogeAmount, "Approve vault first");
        
        uint256 monOutput = calculateRedeemOutput(clawdogeAmount);
        require(monOutput > 0, "Output too small");
        require(address(this).balance >= monOutput, "Insufficient vault balance");
        
        // 用 burnFrom 销毁用户的代币 (需要用户先 approve)
        clawdoge.burnFrom(msg.sender, clawdogeAmount);
        totalRedeemed += clawdogeAmount;
        
        // 再发送 MON
        (bool success, ) = payable(msg.sender).call{value: monOutput}("");
        require(success, "MON transfer failed");
        
        emit Redeemed(msg.sender, clawdogeAmount, monOutput);
    }

    /**
     * @notice 计算铸造输出量
     * @param monAmount 输入的 MON 数量
     * @return clawdogeAmount 输出的 CLAWDOGE 数量
     */
    function calculateMintOutput(uint256 monAmount) public view returns (uint256) {
        uint256 circulatingSupply = clawdoge.totalSupply();
        
        if (circulatingSupply == 0 || address(this).balance == 0) {
            // 初始价格
            return monAmount * INITIAL_RATE;
        }
        
        // 净值 = 金库余额 / 流通量
        // 铸造数量 = monAmount / 净值 = monAmount * 流通量 / 金库余额
        // 注意: msg.value 已经包含在 address(this).balance 中，需要减去
        uint256 vaultBalance = address(this).balance - monAmount;
        if (vaultBalance == 0) {
            return monAmount * INITIAL_RATE;
        }
        
        return (monAmount * circulatingSupply) / vaultBalance;
    }

    /**
     * @notice 计算赎回输出量 (扣除赎回税后)
     * @param clawdogeAmount 要赎回的 CLAWDOGE 数量
     * @return monAmount 输出的 MON 数量 (税后)
     */
    function calculateRedeemOutput(uint256 clawdogeAmount) public view returns (uint256) {
        uint256 circulatingSupply = clawdoge.totalSupply();
        if (circulatingSupply == 0) return 0;
        
        // 赎回的 MON = clawdogeAmount * 金库余额 / 流通量
        uint256 grossMon = (clawdogeAmount * address(this).balance) / circulatingSupply;
        
        // 扣除赎回税
        uint256 tax = (grossMon * REDEEM_TAX_RATE) / TAX_DENOMINATOR;
        return grossMon - tax;
    }

    /**
     * @notice 获取当前净值 (乘以 1e18 精度)
     */
    function getNetValue() external view returns (uint256) {
        uint256 circulatingSupply = clawdoge.totalSupply();
        if (circulatingSupply == 0) return 1e18 / INITIAL_RATE;
        
        return (address(this).balance * 1e18) / circulatingSupply;
    }

    /**
     * @notice 获取金库信息
     */
    function getVaultInfo() external view returns (
        uint256 vaultBalance,
        uint256 circulatingSupply,
        uint256 maxSupply,
        uint256 burned,
        uint256 netValue,
        uint256 _totalMinted,
        uint256 _totalRedeemed
    ) {
        uint256 supply = clawdoge.totalSupply();
        vaultBalance = address(this).balance;
        circulatingSupply = supply;
        maxSupply = clawdoge.MAX_SUPPLY();
        burned = clawdoge.totalBurned();
        netValue = supply > 0 ? (vaultBalance * 1e18) / supply : 1e18 / INITIAL_RATE;
        _totalMinted = totalMinted;
        _totalRedeemed = totalRedeemed;
    }

    /**
     * @notice 接收 MON
     */
    receive() external payable {}
}
