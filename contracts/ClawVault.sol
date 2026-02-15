// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ClawDoge.sol";

/**
 * @title ClawVault
 * @notice Vault for minting and redeeming ClawDoge tokens with USDC collateral
 * @dev Manages the vault net value and token supply ratio
 */
contract ClawVault is Ownable, ReentrancyGuard {
    ClawDoge public immutable clawDoge;
    IERC20 public immutable usdc;
    
    uint256 public constant INITIAL_PRICE = 0.01 ether; // 0.01 USDC per token (assuming 18 decimals)
    uint256 public vaultNetValue; // Total USDC value in vault
    
    event Minted(address indexed user, uint256 usdcAmount, uint256 tokenAmount);
    event Redeemed(address indexed user, uint256 tokenAmount, uint256 usdcAmount);
    event VaultValueUpdated(uint256 newValue);

    constructor(
        address _clawDoge,
        address _usdc
    ) Ownable(msg.sender) {
        require(_clawDoge != address(0), "Invalid ClawDoge address");
        require(_usdc != address(0), "Invalid USDC address");
        
        clawDoge = ClawDoge(_clawDoge);
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Mint ClawDoge tokens by depositing USDC
     * @param usdcAmount Amount of USDC to deposit
     * @return tokenAmount Amount of ClawDoge tokens minted
     */
    function mint(uint256 usdcAmount) external nonReentrant returns (uint256 tokenAmount) {
        require(usdcAmount > 0, "Amount must be greater than 0");
        
        // Calculate tokens to mint based on current vault net value ratio
        if (clawDoge.totalSupply() == 0) {
            // Initial mint at fixed price
            tokenAmount = (usdcAmount * 1e18) / INITIAL_PRICE;
        } else {
            // Mint based on current ratio
            tokenAmount = (usdcAmount * clawDoge.totalSupply()) / vaultNetValue;
        }
        
        require(tokenAmount > 0, "Token amount too small");
        require(clawDoge.totalSupply() + tokenAmount <= clawDoge.MAX_SUPPLY(), "Exceeds max supply");
        
        // Transfer USDC from user
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");
        
        // Update vault value
        vaultNetValue += usdcAmount;
        
        // Mint tokens to user
        clawDoge.mint(msg.sender, tokenAmount);
        
        emit Minted(msg.sender, usdcAmount, tokenAmount);
        emit VaultValueUpdated(vaultNetValue);
    }

    /**
     * @notice Redeem ClawDoge tokens for USDC
     * @param tokenAmount Amount of ClawDoge tokens to burn
     * @return usdcAmount Amount of USDC returned
     */
    function redeem(uint256 tokenAmount) external nonReentrant returns (uint256 usdcAmount) {
        require(tokenAmount > 0, "Amount must be greater than 0");
        require(clawDoge.balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");
        
        // Calculate USDC to return based on current ratio
        usdcAmount = (tokenAmount * vaultNetValue) / clawDoge.totalSupply();
        require(usdcAmount > 0, "USDC amount too small");
        require(usdc.balanceOf(address(this)) >= usdcAmount, "Insufficient vault balance");
        
        // Burn tokens
        clawDoge.burn(msg.sender, tokenAmount);
        
        // Update vault value
        vaultNetValue -= usdcAmount;
        
        // Transfer USDC to user
        require(usdc.transfer(msg.sender, usdcAmount), "USDC transfer failed");
        
        emit Redeemed(msg.sender, tokenAmount, usdcAmount);
        emit VaultValueUpdated(vaultNetValue);
    }

    /**
     * @notice Get current token price in USDC
     * @return price Current price per token
     */
    function getCurrentPrice() external view returns (uint256 price) {
        if (clawDoge.totalSupply() == 0) {
            return INITIAL_PRICE;
        }
        return (vaultNetValue * 1e18) / clawDoge.totalSupply();
    }

    /**
     * @notice Emergency withdraw (only owner, for migrations)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Transfer failed");
    }
}
