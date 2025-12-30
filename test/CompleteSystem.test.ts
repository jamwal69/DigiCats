import { expect } from "chai";
import { ethers } from "ethers";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("CryptoKitties Complete System", function () {
  async function deployCompleteSystemFixture() {
    const [owner, addr1, addr2, addr3] = await hre.ethers.getSigners();

    // Deploy KittyToken
    const KittyToken = await hre.ethers.getContractFactory("KittyToken");
    const kittyToken = await KittyToken.deploy();

    // Deploy CryptoKitties
    const CryptoKitties = await hre.ethers.getContractFactory("CryptoKitties");
    const cryptoKitties = await CryptoKitties.deploy(kittyToken.target);

    // Deploy KittyMarketplace
    const KittyMarketplace = await hre.ethers.getContractFactory("KittyMarketplace");
    const marketplace = await KittyMarketplace.deploy(cryptoKitties.target, kittyToken.target);

    // Deploy KittyBattle
    const KittyBattle = await hre.ethers.getContractFactory("KittyBattle");
    const battle = await KittyBattle.deploy(cryptoKitties.target, kittyToken.target);

    // Deploy KittyStaking
    const KittyStaking = await hre.ethers.getContractFactory("KittyStaking");
    const staking = await KittyStaking.deploy(cryptoKitties.target, kittyToken.target);

    // Set up permissions for KittyToken
    await kittyToken.setMinterAuthorization(cryptoKitties.target, true);
    await kittyToken.setMinterAuthorization(marketplace.target, true);
    await kittyToken.setMinterAuthorization(battle.target, true);
    await kittyToken.setMinterAuthorization(staking.target, true);

    // Mint initial tokens for testing
    await kittyToken.mint(owner.address, hre.ethers.parseEther("1000"));
    await kittyToken.mint(addr1.address, hre.ethers.parseEther("1000"));
    await kittyToken.mint(addr2.address, hre.ethers.parseEther("1000"));

    return {
      kittyToken,
      cryptoKitties,
      marketplace,
      battle,
      staking,
      owner,
      addr1,
      addr2,
      addr3
    };
  }

  describe("Token System", function () {
    it("Should deploy with correct initial supply", async function () {
      const { kittyToken, owner } = await loadFixture(deployCompleteSystemFixture);
      const ownerBalance = await kittyToken.balanceOf(owner.address);
      expect(ownerBalance).to.be.gt(0);
    });

    it("Should allow authorized contracts to mint", async function () {
      const { kittyToken, cryptoKitties, addr1 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      const balance = await kittyToken.balanceOf(addr1.address);
      expect(balance).to.be.gt(ethers.parseEther("1000"));
    });
  });

  describe("CryptoKitties NFT", function () {
    it("Should mint Gen 0 kitties with random traits", async function () {
      const { cryptoKitties, addr1 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      const kitty = await cryptoKitties.getKitty(1);
      
      expect(kitty.owner).to.equal(addr1.address);
      expect(kitty.generation).to.equal(0);
      expect(kitty.traits.length).to.equal(12);
    });

    it("Should breed kitties with genetic inheritance", async function () {
      const { cryptoKitties, kittyToken, addr1 } = await loadFixture(deployCompleteSystemFixture);
      
      // Mint two parent kitties
      await cryptoKitties.mintGen0Kitty(addr1.address);
      await cryptoKitties.mintGen0Kitty(addr1.address);
      
      // Approve breeding fee
      await kittyToken.connect(addr1).approve(cryptoKitties.target, ethers.parseEther("10"));
      
      // Breed kitties
      await cryptoKitties.connect(addr1).breedKitties(1, 2);
      
      const offspring = await cryptoKitties.getKitty(3);
      expect(offspring.generation).to.equal(1);
      expect(offspring.owner).to.equal(addr1.address);
    });

    it("Should calculate correct battle stats from traits", async function () {
      const { cryptoKitties, addr1 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      const kitty = await cryptoKitties.getKitty(1);
      
      expect(kitty.battleStats.attack).to.be.gt(0);
      expect(kitty.battleStats.defense).to.be.gt(0);
      expect(kitty.battleStats.speed).to.be.gt(0);
      expect(kitty.battleStats.health).to.be.gt(0);
    });
  });

  describe("Marketplace", function () {
    it("Should list kitty for sale", async function () {
      const { cryptoKitties, marketplace, kittyToken, addr1 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      await cryptoKitties.connect(addr1).approve(marketplace.target, 1);
      
      await marketplace.connect(addr1).listKittyForSale(1, ethers.parseEther("100"));
      
      const listing = await marketplace.listings(1);
      expect(listing.seller).to.equal(addr1.address);
      expect(listing.price).to.equal(ethers.parseEther("100"));
    });

    it("Should allow buying listed kitty", async function () {
      const { cryptoKitties, marketplace, kittyToken, addr1, addr2 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      await cryptoKitties.connect(addr1).approve(marketplace.target, 1);
      await marketplace.connect(addr1).listKittyForSale(1, ethers.parseEther("100"));
      
      await kittyToken.connect(addr2).approve(marketplace.target, ethers.parseEther("100"));
      await marketplace.connect(addr2).buyKitty(1);
      
      expect(await cryptoKitties.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should handle auction bidding", async function () {
      const { cryptoKitties, marketplace, kittyToken, addr1, addr2 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      await cryptoKitties.connect(addr1).approve(marketplace.target, 1);
      
      const duration = 86400; // 1 day
      await marketplace.connect(addr1).createAuction(1, ethers.parseEther("50"), duration);
      
      await kittyToken.connect(addr2).approve(marketplace.target, ethers.parseEther("75"));
      await marketplace.connect(addr2).placeBid(1, ethers.parseEther("75"));
      
      const auction = await marketplace.auctions(1);
      expect(auction.highestBid).to.equal(ethers.parseEther("75"));
      expect(auction.highestBidder).to.equal(addr2.address);
    });
  });

  describe("Battle System", function () {
    it("Should allow kitties to battle", async function () {
      const { cryptoKitties, battle, kittyToken, addr1, addr2 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      await cryptoKitties.mintGen0Kitty(addr2.address);
      
      await battle.connect(addr1).initiateBattle(1, 2);
      
      const battleData = await battle.battles(1);
      expect(battleData.attacker).to.equal(1);
      expect(battleData.defender).to.equal(2);
      expect(battleData.isActive).to.be.true;
    });

    it("Should execute battle actions", async function () {
      const { cryptoKitties, battle, addr1, addr2 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      await cryptoKitties.mintGen0Kitty(addr2.address);
      
      await battle.connect(addr1).initiateBattle(1, 2);
      await battle.connect(addr2).acceptBattle(1);
      
      // Execute attack action (action 0 = attack)
      await battle.connect(addr1).executeBattleAction(1, 0);
      
      const battleData = await battle.battles(1);
      expect(battleData.turn).to.equal(2); // Should be defender's turn
    });
  });

  describe("Staking System", function () {
    it("Should allow staking kitties", async function () {
      const { cryptoKitties, staking, addr1 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      await cryptoKitties.connect(addr1).approve(staking.target, 1);
      
      await staking.connect(addr1).stakeKitty(1, 30); // 30 days
      
      const stake = await staking.stakes(1);
      expect(stake.owner).to.equal(addr1.address);
      expect(stake.stakingPeriod).to.equal(30);
    });

    it("Should calculate rewards correctly", async function () {
      const { cryptoKitties, staking, addr1 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      await cryptoKitties.connect(addr1).approve(staking.target, 1);
      await staking.connect(addr1).stakeKitty(1, 30);
      
      // Fast forward time
      await hre.network.provider.send("evm_increaseTime", [86400]); // 1 day
      await hre.network.provider.send("evm_mine", []);
      
      const rewards = await staking.calculateRewards(1);
      expect(rewards).to.be.gt(0);
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full breeding and marketplace cycle", async function () {
      const { cryptoKitties, marketplace, kittyToken, addr1, addr2 } = await loadFixture(deployCompleteSystemFixture);
      
      // Mint Gen 0 kitties
      await cryptoKitties.mintGen0Kitty(addr1.address);
      await cryptoKitties.mintGen0Kitty(addr1.address);
      
      // Breed to get offspring
      await kittyToken.connect(addr1).approve(cryptoKitties.target, ethers.parseEther("10"));
      await cryptoKitties.connect(addr1).breedKitties(1, 2);
      
      // List offspring on marketplace
      await cryptoKitties.connect(addr1).approve(marketplace.target, 3);
      await marketplace.connect(addr1).listKittyForSale(3, ethers.parseEther("150"));
      
      // Buy offspring
      await kittyToken.connect(addr2).approve(marketplace.target, ethers.parseEther("150"));
      await marketplace.connect(addr2).buyKitty(3);
      
      expect(await cryptoKitties.ownerOf(3)).to.equal(addr2.address);
    });

    it("Should handle battle rewards and experience", async function () {
      const { cryptoKitties, battle, addr1, addr2 } = await loadFixture(deployCompleteSystemFixture);
      
      await cryptoKitties.mintGen0Kitty(addr1.address);
      await cryptoKitties.mintGen0Kitty(addr2.address);
      
      const initialExp1 = (await cryptoKitties.getKitty(1)).experience;
      const initialExp2 = (await cryptoKitties.getKitty(2)).experience;
      
      await battle.connect(addr1).initiateBattle(1, 2);
      await battle.connect(addr2).acceptBattle(1);
      
      // Simulate battle completion by executing multiple actions
      for (let i = 0; i < 10; i++) {
        try {
          if (i % 2 === 0) {
            await battle.connect(addr1).executeBattleAction(1, 0);
          } else {
            await battle.connect(addr2).executeBattleAction(1, 0);
          }
        } catch (error) {
          // Battle might end before 10 rounds
          break;
        }
      }
      
      const finalExp1 = (await cryptoKitties.getKitty(1)).experience;
      const finalExp2 = (await cryptoKitties.getKitty(2)).experience;
      
      // At least one kitty should have gained experience
      expect(finalExp1 > initialExp1 || finalExp2 > initialExp2).to.be.true;
    });
  });
});
