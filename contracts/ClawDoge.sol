// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ClawDoge Token
 * @notice Vault-backed token with transfer tax for Clawboard agent economy
 * @dev 11.1% transfer tax: 4.2% to treasury, 6.9% burned
 */
contract ClawDoge is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 2_100_000_000 * 10**18; // 2.1B tokens
    uint256 public constant TRANSFER_TAX_RATE = 1110; // 11.1% (basis points: 11.1 * 100)
    uint256 public constant TREASURY_RATE = 420; // 4.2%
    uint256 public constant BURN_RATE = 690; // 6.9%
    uint256 public constant RATE_DENOMINATOR = 10000; // 100%

    address public treasury;
    address public vault;
    
    mapping(address => bool) public isExemptFromTax;

    event TreasuryUpdated(address indexed newTreasury);
    event VaultUpdated(address indexed newVault);
    event TaxExemptionUpdated(address indexed account, bool isExempt);

    constructor(
        address _treasury,
        address _vault
    ) ERC20("ClawDoge", "CLAWDOGE") Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        require(_vault != address(0), "Invalid vault address");
        
        treasury = _treasury;
        vault = _vault;
        
        // Exempt vault and treasury from tax
        isExemptFromTax[_vault] = true;
        isExemptFromTax[_treasury] = true;
        isExemptFromTax[msg.sender] = true;
    }

    /**
     * @notice Mint new tokens (only callable by vault)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == vault, "Only vault can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens (only callable by vault)
     * @param from Address to burn from
     * @param amount Amount to burn
     */
    function burn(address from, uint256 amount) external {
        require(msg.sender == vault, "Only vault can burn");
        _burn(from, amount);
    }

    /**
     * @notice Transfer tokens with tax applied
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        _transferWithTax(owner, to, amount);
        return true;
    }

    /**
     * @notice Transfer tokens from sender with tax applied
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transferWithTax(from, to, amount);
        return true;
    }

    /**
     * @dev Internal transfer with tax logic
     */
    function _transferWithTax(address from, address to, uint256 amount) internal {
        if (isExemptFromTax[from] || isExemptFromTax[to]) {
            // No tax for exempt addresses
            _transfer(from, to, amount);
        } else {
            // Calculate tax amounts
            uint256 treasuryAmount = (amount * TREASURY_RATE) / RATE_DENOMINATOR;
            uint256 burnAmount = (amount * BURN_RATE) / RATE_DENOMINATOR;
            uint256 transferAmount = amount - treasuryAmount - burnAmount;
            
            // Execute transfers
            _transfer(from, treasury, treasuryAmount);
            _burn(from, burnAmount);
            _transfer(from, to, transferAmount);
        }
    }

    /**
     * @notice Update treasury address (only owner)
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    /**
     * @notice Update vault address (only owner)
     */
    function updateVault(address newVault) external onlyOwner {
        require(newVault != address(0), "Invalid vault address");
        vault = newVault;
        emit VaultUpdated(newVault);
    }

    /**
     * @notice Set tax exemption for an address (only owner)
     */
    function setTaxExemption(address account, bool exempt) external onlyOwner {
        isExemptFromTax[account] = exempt;
        emit TaxExemptionUpdated(account, exempt);
    }
}
