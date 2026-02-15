import { ethers } from "hardhat";

/**
 * 仅重新部署 AgentRegistry 合约 (传入已有的 ClawDoge 地址)
 */
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MON");

    // 已部署的 ClawDoge 地址
    const CLAWDOGE_ADDRESS = "0x88Be0918a9803a4741F2E43962d6E088C2DD0C07";

    console.log("\n--- Deploying AgentRegistry (v2 with tip()) ---");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const registry = await AgentRegistry.deploy(CLAWDOGE_ADDRESS);
    await registry.waitForDeployment();
    const registryAddr = await registry.getAddress();

    console.log("\n========================================");
    console.log("🐕 AgentRegistry v2 Deployed!");
    console.log("========================================");
    console.log(`AgentRegistry: ${registryAddr}`);
    console.log(`ClawDoge:      ${CLAWDOGE_ADDRESS} (existing)`);
    console.log("========================================");
    console.log(`\nUpdate .env.local:`);
    console.log(`NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=${registryAddr}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
