const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Clawboard Contracts", function () {
  let clawDoge, clawVault, agentRegistry;
  let owner, treasury, user1, user2;

  beforeEach(async function () {
    [owner, treasury, user1, user2] = await ethers.getSigners();

    // Deploy AgentRegistry
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();

    // Deploy ClawDoge with placeholder vault
    const ClawDoge = await ethers.getContractFactory("ClawDoge");
    clawDoge = await ClawDoge.deploy(treasury.address, owner.address);

    // Deploy ClawVault (using a mock USDC address for testing)
    const mockUSDC = ethers.ZeroAddress;
    const ClawVault = await ethers.getContractFactory("ClawVault");
    clawVault = await ClawVault.deploy(
      await clawDoge.getAddress(),
      mockUSDC
    );

    // Update ClawDoge with actual vault address
    await clawDoge.updateVault(await clawVault.getAddress());
    await clawDoge.setTaxExemption(await clawVault.getAddress(), true);
  });

  describe("ClawDoge Token", function () {
    it("Should have correct name and symbol", async function () {
      expect(await clawDoge.name()).to.equal("ClawDoge");
      expect(await clawDoge.symbol()).to.equal("CLAWDOGE");
    });

    it("Should have correct max supply", async function () {
      const maxSupply = await clawDoge.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.parseEther("2100000000"));
    });

    it("Should set correct treasury and vault addresses", async function () {
      expect(await clawDoge.treasury()).to.equal(treasury.address);
      expect(await clawDoge.vault()).to.equal(await clawVault.getAddress());
    });

    it("Should allow vault to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await clawDoge.connect(owner).updateVault(owner.address);
      await clawDoge.mint(user1.address, mintAmount);
      expect(await clawDoge.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-vault to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        clawDoge.connect(user1).mint(user1.address, mintAmount)
      ).to.be.revertedWith("Only vault can mint");
    });

    it("Should apply transfer tax correctly", async function () {
      // Mint tokens to user1 (as vault)
      const mintAmount = ethers.parseEther("10000");
      await clawDoge.connect(owner).updateVault(owner.address);
      await clawDoge.mint(user1.address, mintAmount);

      // Transfer from user1 to user2 (tax applies)
      const transferAmount = ethers.parseEther("1000");
      await clawDoge.connect(user1).transfer(user2.address, transferAmount);

      // Calculate expected amounts
      const treasuryAmount = (transferAmount * 420n) / 10000n; // 4.2%
      const burnAmount = (transferAmount * 690n) / 10000n; // 6.9%
      const receivedAmount = transferAmount - treasuryAmount - burnAmount;

      expect(await clawDoge.balanceOf(user2.address)).to.equal(receivedAmount);
      expect(await clawDoge.balanceOf(treasury.address)).to.equal(treasuryAmount);
    });
  });

  describe("AgentRegistry", function () {
    it("Should allow agent registration", async function () {
      const agentId = "test-agent-1";
      await agentRegistry.connect(user1).registerAgent(agentId, user1.address);

      const agent = await agentRegistry.getAgent(agentId);
      expect(agent.moltbookId).to.equal(agentId);
      expect(agent.wallet).to.equal(user1.address);
      expect(agent.owner).to.equal(user1.address);
      expect(agent.isActive).to.be.true;
    });

    it("Should not allow duplicate agent registration", async function () {
      const agentId = "test-agent-1";
      await agentRegistry.connect(user1).registerAgent(agentId, user1.address);

      await expect(
        agentRegistry.connect(user2).registerAgent(agentId, user2.address)
      ).to.be.revertedWith("Agent already registered");
    });

    it("Should allow agent owner to update wallet", async function () {
      const agentId = "test-agent-1";
      await agentRegistry.connect(user1).registerAgent(agentId, user1.address);

      await agentRegistry.connect(user1).updateAgentWallet(agentId, user2.address);

      const agent = await agentRegistry.getAgent(agentId);
      expect(agent.wallet).to.equal(user2.address);
    });

    it("Should record tips correctly", async function () {
      const agentId = "test-agent-1";
      await agentRegistry.connect(user1).registerAgent(agentId, user1.address);

      const tipAmount = ethers.parseEther("100");
      await agentRegistry.recordTip(agentId, tipAmount);

      const agent = await agentRegistry.getAgent(agentId);
      expect(agent.totalTips).to.equal(tipAmount);
      expect(agent.tipCount).to.equal(1);
    });

    it("Should return all agent IDs", async function () {
      await agentRegistry.connect(user1).registerAgent("agent-1", user1.address);
      await agentRegistry.connect(user2).registerAgent("agent-2", user2.address);

      const agentIds = await agentRegistry.getAllAgentIds();
      expect(agentIds.length).to.equal(2);
      expect(agentIds[0]).to.equal("agent-1");
      expect(agentIds[1]).to.equal("agent-2");
    });
  });

  describe("ClawVault", function () {
    it("Should be initialized with correct addresses", async function () {
      expect(await clawVault.clawDoge()).to.equal(await clawDoge.getAddress());
    });

    it("Should calculate initial price correctly", async function () {
      const initialPrice = await clawVault.INITIAL_PRICE();
      expect(initialPrice).to.equal(ethers.parseEther("0.01"));
    });

    it("Should return current price", async function () {
      const currentPrice = await clawVault.getCurrentPrice();
      expect(currentPrice).to.equal(ethers.parseEther("0.01"));
    });
  });
});
