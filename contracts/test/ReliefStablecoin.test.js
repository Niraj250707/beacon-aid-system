const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReliefStablecoin", function () {
  let stablecoin;
  let owner, user1, user2, programManager;
  
  beforeEach(async function () {
    [owner, user1, user2, programManager] = await ethers.getSigners();
    
    const ReliefStablecoin = await ethers.getContractFactory("ReliefStablecoin");
    stablecoin = await ReliefStablecoin.deploy();
    await stablecoin.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await stablecoin.name()).to.equal("ReliefCoin INR");
      expect(await stablecoin.symbol()).to.equal("RINR");
    });
    
    it("Should set deployer as owner", async function () {
      expect(await stablecoin.owner()).to.equal(owner.address);
    });
    
    it("Should start with zero supply", async function () {
      expect(await stablecoin.totalSupply()).to.equal(0);
    });
  });
  
  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const amount = ethers.parseEther("1000");
      await stablecoin.mint(user1.address, amount, "Test mint");
      expect(await stablecoin.balanceOf(user1.address)).to.equal(amount);
    });
    
    it("Should emit TokensMinted event", async function () {
      const amount = ethers.parseEther("1000");
      await expect(stablecoin.mint(user1.address, amount, "Test mint"))
        .to.emit(stablecoin, "TokensMinted")
        .withArgs(user1.address, amount, "Test mint");
    });
    
    it("Should revert when non-owner tries to mint", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        stablecoin.connect(user1).mint(user2.address, amount, "Unauthorized")
      ).to.be.revertedWithCustomError(stablecoin, "OwnableUnauthorizedAccount");
    });
    
    it("Should revert when minting to zero address", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        stablecoin.mint(ethers.ZeroAddress, amount, "Zero address")
      ).to.be.revertedWith("Cannot mint to zero address");
    });
  });
  
  describe("Burning", function () {
    beforeEach(async function () {
      await stablecoin.mint(user1.address, ethers.parseEther("1000"), "Setup");
    });
    
    it("Should allow owner to burn tokens", async function () {
      const burnAmount = ethers.parseEther("500");
      await stablecoin.burn(user1.address, burnAmount, "Clawback");
      expect(await stablecoin.balanceOf(user1.address)).to.equal(ethers.parseEther("500"));
    });
    
    it("Should emit TokensBurned event", async function () {
      const burnAmount = ethers.parseEther("500");
      await expect(stablecoin.burn(user1.address, burnAmount, "Clawback"))
        .to.emit(stablecoin, "TokensBurned")
        .withArgs(user1.address, burnAmount, "Clawback");
    });
  });
  
  describe("ProgramManager", function () {
    beforeEach(async function () {
      await stablecoin.setProgramManager(programManager.address);
      await stablecoin.mint(user1.address, ethers.parseEther("1000"), "Setup");
    });
    
    it("Should allow setting ProgramManager", async function () {
      expect(await stablecoin.programManager()).to.equal(programManager.address);
    });
    
    it("Should allow ProgramManager to transfer tokens", async function () {
      const amount = ethers.parseEther("100");
      await stablecoin.connect(programManager).transferForPayment(user1.address, user2.address, amount);
      expect(await stablecoin.balanceOf(user2.address)).to.equal(amount);
    });
    
    it("Should revert when non-ProgramManager tries to transfer", async function () {
      const amount = ethers.parseEther("100");
      await expect(
        stablecoin.connect(user1).transferForPayment(user1.address, user2.address, amount)
      ).to.be.revertedWith("Only ProgramManager can call");
    });
  });
  
  describe("Pausing", function () {
    beforeEach(async function () {
      await stablecoin.mint(user1.address, ethers.parseEther("1000"), "Setup");
    });
    
    it("Should allow owner to pause", async function () {
      await stablecoin.pause();
      expect(await stablecoin.paused()).to.be.true;
    });
    
    it("Should block transfers when paused", async function () {
      await stablecoin.pause();
      await expect(
        stablecoin.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(stablecoin, "EnforcedPause");
    });
    
    it("Should allow owner to unpause", async function () {
      await stablecoin.pause();
      await stablecoin.unpause();
      expect(await stablecoin.paused()).to.be.false;
    });
  });
});
