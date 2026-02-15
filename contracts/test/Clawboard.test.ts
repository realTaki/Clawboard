import { expect } from "chai";
import { ethers } from "hardhat";
import { ClawDoge, AgentRegistry, ClawVault } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// Tax rate constants: 11.1% total tax (4.2% team + 6.9% burn)
const TAX_RATE_PERCENT = 11.1;
const POST_TAX_MULTIPLIER = 889n; // 1000 - 111 = 889 (88.9% remains after 11.1% tax)
const TAX_DENOMINATOR = 1000n;

describe("Clawboard Contracts", function () {
    let clawdoge: ClawDoge;
    let registry: AgentRegistry;
    let vault: ClawVault;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;
    let teamWallet: HardhatEthersSigner;

    beforeEach(async function () {
        [owner, user1, user2, teamWallet] = await ethers.getSigners();

        // Deploy ClawDoge
        const ClawDogeFactory = await ethers.getContractFactory("ClawDoge");
        clawdoge = await ClawDogeFactory.deploy(teamWallet.address);
        await clawdoge.waitForDeployment();

        // Deploy AgentRegistry
        const RegistryFactory = await ethers.getContractFactory("AgentRegistry");
        registry = await RegistryFactory.deploy(await clawdoge.getAddress());
        await registry.waitForDeployment();

        // Deploy ClawVault
        const VaultFactory = await ethers.getContractFactory("ClawVault");
        vault = await VaultFactory.deploy(await clawdoge.getAddress());
        await vault.waitForDeployment();

        // Configure vault permission
        await clawdoge.setVault(await vault.getAddress());
    });

    describe("ClawDoge Token", function () {
        it("should have correct name and symbol", async function () {
            expect(await clawdoge.name()).to.equal("ClawDoge");
            expect(await clawdoge.symbol()).to.equal("CLAWDOGE");
        });

        it("should have correct max supply", async function () {
            const maxSupply = await clawdoge.MAX_SUPPLY();
            expect(maxSupply).to.equal(ethers.parseEther("2100000000"));
        });

        it("should have correct tax rates", async function () {
            expect(await clawdoge.TEAM_TAX_RATE()).to.equal(42);
            expect(await clawdoge.BURN_TAX_RATE()).to.equal(69);
        });

        it("should only allow vault to mint", async function () {
            await expect(
                clawdoge.mint(user1.address, ethers.parseEther("100"))
            ).to.be.revertedWith("Only vault can mint");
        });

        it("should apply transfer tax on normal transfers", async function () {
            // Mint tokens via vault
            const mintAmount = ethers.parseEther("1");
            await vault.connect(user1).mint({ value: mintAmount });

            const user1Balance = await clawdoge.balanceOf(user1.address);
            expect(user1Balance).to.be.gt(0);

            // Transfer from user1 to user2
            const transferAmount = ethers.parseEther("100");
            if (user1Balance >= transferAmount) {
                await clawdoge.connect(user1).transfer(user2.address, transferAmount);

                // user2 should receive less than transferAmount (after tax)
                const user2Balance = await clawdoge.balanceOf(user2.address);
                const expectedAfterTax = transferAmount * POST_TAX_MULTIPLIER / TAX_DENOMINATOR;
                expect(user2Balance).to.equal(expectedAfterTax);

                // team wallet should receive 4.2%
                const teamBalance = await clawdoge.balanceOf(teamWallet.address);
                const expectedTeamTax = transferAmount * 42n / TAX_DENOMINATOR;
                expect(teamBalance).to.equal(expectedTeamTax);
            }
        });

        it("should not tax excluded addresses", async function () {
            // Mint via vault (vault is excluded)
            await vault.connect(user1).mint({ value: ethers.parseEther("1") });
            const balance = await clawdoge.balanceOf(user1.address);
            // Initial rate: 1 MON = 1000 CLAWDOGE
            expect(balance).to.equal(ethers.parseEther("1000"));
        });

        it("should allow burning tokens", async function () {
            await vault.connect(user1).mint({ value: ethers.parseEther("1") });
            const balance = await clawdoge.balanceOf(user1.address);

            await clawdoge.connect(user1).burn(balance);
            expect(await clawdoge.balanceOf(user1.address)).to.equal(0);
            expect(await clawdoge.totalBurned()).to.equal(balance);
        });
    });

    describe("AgentRegistry", function () {
        it("should register an agent", async function () {
            await registry.connect(user1).registerAgent("grok-1", "Grok");

            const agent = await registry.getAgent("grok-1");
            expect(agent.agentId).to.equal("grok-1");
            expect(agent.displayName).to.equal("Grok");
            expect(agent.wallet).to.equal(user1.address);
            expect(agent.isActive).to.be.true;
        });

        it("should prevent duplicate registration", async function () {
            await registry.connect(user1).registerAgent("grok-1", "Grok");
            await expect(
                registry.connect(user2).registerAgent("grok-1", "Grok2")
            ).to.be.revertedWith("Agent already registered");
        });

        it("should update agent wallet", async function () {
            await registry.connect(user1).registerAgent("grok-1", "Grok");
            await registry.connect(user1).updateAgentWallet("grok-1", user2.address);

            const agent = await registry.getAgent("grok-1");
            expect(agent.wallet).to.equal(user2.address);
        });

        it("should reject wallet update from non-owner", async function () {
            await registry.connect(user1).registerAgent("grok-1", "Grok");
            await expect(
                registry.connect(user2).updateAgentWallet("grok-1", user2.address)
            ).to.be.revertedWith("Not agent owner");
        });

        it("should tip agent via tip() with approval", async function () {
            // Register agent
            await registry.connect(user1).registerAgent("grok-1", "Grok");

            // Mint tokens to user2 (the tipper)
            await vault.connect(user2).mint({ value: ethers.parseEther("1") });
            const tipperBalance = await clawdoge.balanceOf(user2.address);
            expect(tipperBalance).to.equal(ethers.parseEther("1000"));

            // Approve AgentRegistry to spend tipper's CLAWDOGE
            const registryAddr = await registry.getAddress();
            const tipAmount = ethers.parseEther("100");
            await clawdoge.connect(user2).approve(registryAddr, tipAmount);

            // Tip the agent
            await registry.connect(user2).tip("grok-1", tipAmount);

            // Check stats updated - tipCount should increment
            const agent = await registry.getAgent("grok-1");
            expect(agent.tipCount).to.equal(1);

            // Agent wallet should have received tokens (minus 11.1% tax)
            const agentBalance = await clawdoge.balanceOf(user1.address);
            const expectedAfterTax = tipAmount * POST_TAX_MULTIPLIER / TAX_DENOMINATOR;
            expect(agentBalance).to.equal(expectedAfterTax);

            // getAgentBalance should return the same as direct balanceOf
            const agentBalanceFromContract = await registry.getAgentBalance("grok-1");
            expect(agentBalanceFromContract).to.equal(expectedAfterTax);
        });

        it("should fail tip() without approval", async function () {
            await registry.connect(user1).registerAgent("grok-1", "Grok");
            await vault.connect(user2).mint({ value: ethers.parseEther("1") });

            await expect(
                registry.connect(user2).tip("grok-1", ethers.parseEther("100"))
            ).to.be.reverted;
        });

        it("should get agent wallet address", async function () {
            await registry.connect(user1).registerAgent("grok-1", "Grok");
            const wallet = await registry.getAgentWallet("grok-1");
            expect(wallet).to.equal(user1.address);
        });

        it("should get agent balance via getAgentBalance", async function () {
            await registry.connect(user1).registerAgent("grok-1", "Grok");
            
            // Initially should be 0
            let balance = await registry.getAgentBalance("grok-1");
            expect(balance).to.equal(0);

            // After minting some tokens to agent wallet
            await vault.connect(user1).mint({ value: ethers.parseEther("1") });
            balance = await registry.getAgentBalance("grok-1");
            expect(balance).to.equal(ethers.parseEther("1000"));

            // Should return 0 for non-existent agent
            const nonExistentBalance = await registry.getAgentBalance("non-existent");
            expect(nonExistentBalance).to.equal(0);
        });
    });

    describe("ClawVault", function () {
        it("should mint tokens for MON", async function () {
            const mintMon = ethers.parseEther("1");
            await vault.connect(user1).mint({ value: mintMon });

            const balance = await clawdoge.balanceOf(user1.address);
            // Initial rate: 1 MON = 1000 CLAWDOGE
            expect(balance).to.equal(ethers.parseEther("1000"));
        });

        it("should reject mint with zero MON", async function () {
            await expect(
                vault.connect(user1).mint({ value: 0 })
            ).to.be.revertedWith("Must send MON");
        });

        it("should redeem tokens for MON", async function () {
            // First mint
            const mintMon = ethers.parseEther("10");
            await vault.connect(user1).mint({ value: mintMon });

            const clawdogeBalance = await clawdoge.balanceOf(user1.address);
            expect(clawdogeBalance).to.equal(ethers.parseEther("10000"));

            const monBefore = await ethers.provider.getBalance(user1.address);

            // Approve vault to burnFrom
            const vaultAddr = await vault.getAddress();
            await clawdoge.connect(user1).approve(vaultAddr, clawdogeBalance);

            // Redeem half
            const redeemAmount = ethers.parseEther("5000");
            await vault.connect(user1).redeem(redeemAmount);

            // User should have less CLAWDOGE
            const balanceAfter = await clawdoge.balanceOf(user1.address);
            expect(balanceAfter).to.equal(ethers.parseEther("5000"));

            // User should have received MON (minus 11.1% redeem tax)
            const monAfter = await ethers.provider.getBalance(user1.address);
            expect(monAfter).to.be.gt(monBefore);
        });

        it("should calculate mint output correctly for initial rate", async function () {
            const output = await vault.calculateMintOutput(ethers.parseEther("5"));
            expect(output).to.equal(ethers.parseEther("5000"));
        });

        it("should return vault info", async function () {
            await vault.connect(user1).mint({ value: ethers.parseEther("10") });

            const info = await vault.getVaultInfo();
            expect(info.circulatingSupply).to.be.gt(0);
            expect(info.vaultBalance).to.be.gt(0);
        });

        it("should calculate net value", async function () {
            await vault.connect(user1).mint({ value: ethers.parseEther("10") });
            const netValue = await vault.getNetValue();
            expect(netValue).to.be.gt(0);
        });
    });
});
