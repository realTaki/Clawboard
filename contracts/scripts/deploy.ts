import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MON");

    // 1. 部署 ClawDoge 代币
    console.log("\n--- Deploying ClawDoge Token ---");
    const ClawDoge = await ethers.getContractFactory("ClawDoge");
    const clawdoge = await ClawDoge.deploy(deployer.address); // 团队钱包 = 部署者
    await clawdoge.waitForDeployment();
    const clawdogeAddr = await clawdoge.getAddress();
    console.log("ClawDoge deployed to:", clawdogeAddr);

    // 2. 部署 AgentRegistry
    console.log("\n--- Deploying AgentRegistry ---");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const registry = await AgentRegistry.deploy(clawdogeAddr);
    await registry.waitForDeployment();
    const registryAddr = await registry.getAddress();
    console.log("AgentRegistry deployed to:", registryAddr);

    // 3. 部署 ClawVault
    console.log("\n--- Deploying ClawVault ---");
    const ClawVault = await ethers.getContractFactory("ClawVault");
    const vault = await ClawVault.deploy(clawdogeAddr);
    await vault.waitForDeployment();
    const vaultAddr = await vault.getAddress();
    console.log("ClawVault deployed to:", vaultAddr);

    // 4. 设置 Vault 权限
    console.log("\n--- Configuring Permissions ---");
    const tx = await clawdoge.setVault(vaultAddr);
    await tx.wait();
    console.log("ClawDoge.setVault() -> done");

    // 5. 打印部署结果
    console.log("\n========================================");
    console.log("🐕 Clawboard Contracts Deployed!");
    console.log("========================================");
    console.log(`ClawDoge:      ${clawdogeAddr}`);
    console.log(`AgentRegistry: ${registryAddr}`);
    console.log(`ClawVault:     ${vaultAddr}`);
    console.log("========================================");
    console.log("\nUpdate your .env.local:");
    console.log(`NEXT_PUBLIC_CLAWDOGE_ADDRESS=${clawdogeAddr}`);
    console.log(`NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=${registryAddr}`);
    console.log(`NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddr}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
