const hre = require("hardhat");

async function main() {
  console.log("Deploying Clawboard contracts to Monad...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy AgentRegistry first
  console.log("\n1. Deploying AgentRegistry...");
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("AgentRegistry deployed to:", agentRegistryAddress);

  // Set treasury address (can be changed later)
  const treasuryAddress = deployer.address;
  console.log("Treasury address:", treasuryAddress);

  // Deploy ClawVault placeholder (will be replaced with actual vault)
  const vaultPlaceholder = deployer.address;

  // Deploy ClawDoge token
  console.log("\n2. Deploying ClawDoge token...");
  const ClawDoge = await hre.ethers.getContractFactory("ClawDoge");
  const clawDoge = await ClawDoge.deploy(treasuryAddress, vaultPlaceholder);
  await clawDoge.waitForDeployment();
  const clawDogeAddress = await clawDoge.getAddress();
  console.log("ClawDoge token deployed to:", clawDogeAddress);

  // For demonstration, we'll use the deployer address as a placeholder for USDC
  // In production, replace with actual USDC contract address on Monad
  // Note: Using zero address will cause contract deployment to fail
  const usdcAddress = deployer.address; // Placeholder - replace with actual USDC address
  console.log("WARNING: Using placeholder for USDC address. Replace with actual USDC contract before production use.");

  // Deploy ClawVault
  console.log("\n3. Deploying ClawVault...");
  const ClawVault = await hre.ethers.getContractFactory("ClawVault");
  const clawVault = await ClawVault.deploy(clawDogeAddress, usdcAddress);
  await clawVault.waitForDeployment();
  const clawVaultAddress = await clawVault.getAddress();
  console.log("ClawVault deployed to:", clawVaultAddress);

  // Update ClawDoge with actual vault address
  console.log("\n4. Updating ClawDoge vault address...");
  await clawDoge.updateVault(clawVaultAddress);
  console.log("Vault address updated in ClawDoge token");

  // Set vault as tax-exempt
  await clawDoge.setTaxExemption(clawVaultAddress, true);
  console.log("Vault set as tax-exempt");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("AgentRegistry:", agentRegistryAddress);
  console.log("ClawDoge Token:", clawDogeAddress);
  console.log("ClawVault:", clawVaultAddress);
  console.log("Treasury:", treasuryAddress);
  console.log("=".repeat(60));

  // Save addresses to file
  const fs = require('fs');
  const addresses = {
    network: hre.network.name,
    agentRegistry: agentRegistryAddress,
    clawDoge: clawDogeAddress,
    clawVault: clawVaultAddress,
    treasury: treasuryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    'deployed-addresses.json',
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nAddresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
