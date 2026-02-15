// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ClawDoge
 * @notice $CLAWDOGE - Agent Economy Token on Monad
 * 
 * 代币机制:
 * - 最大供应量: 2,100,000,000 (21 亿)
 * - 转账税: 11.1% (4.2% 团队 + 6.9% 销毁)
 * - 铸造: 需要 Vault 合约权限
 * - 赎回: 通过 Vault 合约销毁代币
 */
contract ClawDoge is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 2_100_000_000 * 1e18;
    
    // 税率 (基于 1000 的精度, 即 42 = 4.2%, 69 = 6.9%)
    uint256 public constant TEAM_TAX_RATE = 42;   // 4.2%
    uint256 public constant BURN_TAX_RATE = 69;    // 6.9%
    uint256 public constant TAX_DENOMINATOR = 1000;
    
    address public teamWallet;
    address public vault;
    
    // 免税地址 (合约本身, Vault, 团队钱包)
    mapping(address => bool) public isExcludedFromTax;
    
    // 总销毁量
    uint256 public totalBurned;

    event TeamWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event VaultUpdated(address indexed oldVault, address indexed newVault);
    event TaxExclusionUpdated(address indexed account, bool excluded);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(address _teamWallet) ERC20("ClawDoge", "CLAWDOGE") Ownable(msg.sender) {
        require(_teamWallet != address(0), "Invalid team wallet");
        teamWallet = _teamWallet;
        
        // 免税列表
        isExcludedFromTax[msg.sender] = true;
        isExcludedFromTax[_teamWallet] = true;
        isExcludedFromTax[address(this)] = true;
    }

    /**
     * @notice 设置 Vault 合约地址
     */
    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid vault");
        address oldVault = vault;
        
        // 移除旧 Vault 的免税
        if (oldVault != address(0)) {
            isExcludedFromTax[oldVault] = false;
        }
        
        vault = _vault;
        isExcludedFromTax[_vault] = true;
        emit VaultUpdated(oldVault, _vault);
    }

    /**
     * @notice 更新团队钱包
     */
    function setTeamWallet(address _teamWallet) external onlyOwner {
        require(_teamWallet != address(0), "Invalid wallet");
        address old = teamWallet;
        isExcludedFromTax[old] = false;
        teamWallet = _teamWallet;
        isExcludedFromTax[_teamWallet] = true;
        emit TeamWalletUpdated(old, _teamWallet);
    }

    /**
     * @notice 设置免税状态
     */
    function setTaxExclusion(address account, bool excluded) external onlyOwner {
        isExcludedFromTax[account] = excluded;
        emit TaxExclusionUpdated(account, excluded);
    }

    /**
     * @notice 铸造代币 (仅 Vault 可调用)
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == vault, "Only vault can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @notice 销毁代币
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        totalBurned += amount;
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @notice 授权销毁代币 (供 Vault 合约赎回时使用)
     * @param from 代币持有者
     * @param amount 销毁数量
     */
    function burnFrom(address from, uint256 amount) external {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        totalBurned += amount;
        emit TokensBurned(from, amount);
    }

    /**
     * @notice 覆写 _update 实现转账税
     */
    function _update(address from, address to, uint256 value) internal override {
        // 铸造和销毁不收税
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }
        
        // 免税地址不收税
        if (isExcludedFromTax[from] || isExcludedFromTax[to]) {
            super._update(from, to, value);
            return;
        }
        
        // 计算税额
        uint256 teamTax = (value * TEAM_TAX_RATE) / TAX_DENOMINATOR;
        uint256 burnTax = (value * BURN_TAX_RATE) / TAX_DENOMINATOR;
        uint256 afterTax = value - teamTax - burnTax;
        
        // 团队税转给团队钱包
        super._update(from, teamWallet, teamTax);
        
        // 销毁税
        super._update(from, address(0), burnTax);
        totalBurned += burnTax;
        
        // 剩余转给接收方
        super._update(from, to, afterTax);
    }
}
