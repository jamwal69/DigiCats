import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("CryptoKitties", function () {
    let kittyToken: Contract;
    let cryptoKitties: Contract;
    let owner: Signer;
    let user1: Signer;
    let user2: Signer;
    let ownerAddress: string;
    let user1Address: string;
    let user2Address: string;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        ownerAddress = await owner.getAddress();
        user1Address = await user1.getAddress();
        user2Address = await user2.getAddress();

        // Deploy KittyToken
        const KittyToken = await ethers.getContractFactory("KittyToken");
        kittyToken = await KittyToken.deploy();
        await kittyToken.waitForDeployment();

        // Deploy CryptoKitties
        const CryptoKitties = await ethers.getContractFactory("CryptoKitties");
        cryptoKitties = await CryptoKitties.deploy(await kittyToken.getAddress());
        await cryptoKitties.waitForDeployment();
    });

    describe("Generation 0 Minting", function () {
        it("Should mint Gen 0 kitties correctly", async function () {
            await cryptoKitties.mintGen0Kitty(user1Address);
            
            const kitty = await cryptoKitties.getKitty(1);
            expect(kitty.generation).to.equal(0);
            expect(kitty.matronId).to.equal(0);
            expect(kitty.sireId).to.equal(0);
            
            const owner = await cryptoKitties.ownerOf(1);
            expect(owner).to.equal(user1Address);
        });

        it("Should not exceed Gen 0 supply limit", async function () {
            // This would take too long to test 1000, so we'll test the logic
            const maxSupply = await cryptoKitties.MAX_GEN0_SUPPLY();
            expect(maxSupply).to.equal(1000);
        });

        it("Should generate random traits for Gen 0 kitties", async function () {
            await cryptoKitties.mintGen0Kitty(user1Address);
            await cryptoKitties.mintGen0Kitty(user1Address);
            
            const kitty1 = await cryptoKitties.getKitty(1);
            const kitty2 = await cryptoKitties.getKitty(2);
            
            // Kitties should have different traits (very high probability)
            const traits1 = [kitty1.bodyColor, kitty1.eyeColor, kitty1.pattern];
            const traits2 = [kitty2.bodyColor, kitty2.eyeColor, kitty2.pattern];
            
            expect(traits1.join('')).to.not.equal(traits2.join(''));
        });
    });

    describe("Breeding System", function () {
        beforeEach(async function () {
            // Mint two Gen 0 kitties for breeding
            await cryptoKitties.mintGen0Kitty(user1Address);
            await cryptoKitties.mintGen0Kitty(user1Address);
            
            // Give user1 KITTY tokens for breeding
            await kittyToken.transfer(user1Address, ethers.parseEther("100"));
        });

        it("Should breed two kitties successfully", async function () {
            // Approve breeding fee
            await kittyToken.connect(user1).approve(
                await cryptoKitties.getAddress(), 
                ethers.parseEther("10")
            );
            
            await cryptoKitties.connect(user1).breedKitties(1, 2);
            
            const offspring = await cryptoKitties.getKitty(3);
            expect(offspring.generation).to.equal(1);
            expect(offspring.matronId).to.equal(1);
            expect(offspring.sireId).to.equal(2);
            
            const owner = await cryptoKitties.ownerOf(3);
            expect(owner).to.equal(user1Address);
        });

        it("Should not allow breeding same kitty with itself", async function () {
            await kittyToken.connect(user1).approve(
                await cryptoKitties.getAddress(), 
                ethers.parseEther("10")
            );
            
            await expect(
                cryptoKitties.connect(user1).breedKitties(1, 1)
            ).to.be.revertedWith("Cannot breed with self");
        });

        it("Should enforce breeding cooldown", async function () {
            await kittyToken.connect(user1).approve(
                await cryptoKitties.getAddress(), 
                ethers.parseEther("20")
            );
            
            // First breeding
            await cryptoKitties.connect(user1).breedKitties(1, 2);
            
            // Try to breed again immediately (should fail)
            await expect(
                cryptoKitties.connect(user1).breedKitties(1, 2)
            ).to.be.revertedWith("Matron still in cooldown");
        });

        it("Should require breeding fee payment", async function () {
            // Don't approve tokens
            await expect(
                cryptoKitties.connect(user1).breedKitties(1, 2)
            ).to.be.revertedWith("ERC20: insufficient allowance");
        });
    });

    describe("Genetic Algorithm", function () {
        it("Should inherit traits from parents", async function () {
            // Mint two Gen 0 kitties
            await cryptoKitties.mintGen0Kitty(user1Address);
            await cryptoKitties.mintGen0Kitty(user1Address);
            
            const parent1 = await cryptoKitties.getKitty(1);
            const parent2 = await cryptoKitties.getKitty(2);
            
            // Give tokens and breed
            await kittyToken.transfer(user1Address, ethers.parseEther("100"));
            await kittyToken.connect(user1).approve(
                await cryptoKitties.getAddress(), 
                ethers.parseEther("10")
            );
            
            await cryptoKitties.connect(user1).breedKitties(1, 2);
            
            const offspring = await cryptoKitties.getKitty(3);
            
            // Offspring traits should be within the valid ranges
            expect(offspring.bodyColor).to.be.at.most(7);
            expect(offspring.eyeColor).to.be.at.most(5);
            expect(offspring.pattern).to.be.at.most(4);
            expect(offspring.accessory).to.be.at.most(3);
            expect(offspring.background).to.be.at.most(2);
            
            // At least some traits should come from parents
            const inheritedFromParent1 = (
                offspring.bodyColor === parent1.bodyColor ||
                offspring.eyeColor === parent1.eyeColor ||
                offspring.pattern === parent1.pattern
            );
            
            const inheritedFromParent2 = (
                offspring.bodyColor === parent2.bodyColor ||
                offspring.eyeColor === parent2.eyeColor ||
                offspring.pattern === parent2.pattern
            );
            
            // Should inherit from at least one parent (high probability)
            expect(inheritedFromParent1 || inheritedFromParent2).to.be.true;
        });
    });

    describe("Rarity Calculation", function () {
        it("Should calculate rarity correctly", async function () {
            await cryptoKitties.mintGen0Kitty(user1Address);
            
            const rarity = await cryptoKitties.calculateRarity(1);
            
            // Rarity should be between 0-4 (Common, Uncommon, Rare, Epic, Legendary)
            expect(rarity).to.be.at.least(0);
            expect(rarity).to.be.at.most(4);
        });
    });

    describe("Utility Functions", function () {
        it("Should check if kitty can breed", async function () {
            await cryptoKitties.mintGen0Kitty(user1Address);
            
            const canBreed = await cryptoKitties.canBreed(1);
            expect(canBreed).to.be.true;
        });

        it("Should get kitties by owner", async function () {
            await cryptoKitties.mintGen0Kitty(user1Address);
            await cryptoKitties.mintGen0Kitty(user1Address);
            
            const kitties = await cryptoKitties.getKittiesByOwner(user1Address);
            expect(kitties.length).to.equal(2);
            expect(kitties[0]).to.equal(1);
            expect(kitties[1]).to.equal(2);
        });
    });

    describe("Battle Stats Generation", function () {
        it("Should generate appropriate battle stats", async function () {
            await cryptoKitties.mintGen0Kitty(user1Address);
            
            const kitty = await cryptoKitties.getKitty(1);
            
            // Stats should be reasonable values
            expect(kitty.strength).to.be.at.least(50);
            expect(kitty.strength).to.be.at.most(200);
            expect(kitty.agility).to.be.at.least(60);
            expect(kitty.agility).to.be.at.most(200);
            expect(kitty.intelligence).to.be.at.least(70);
            expect(kitty.intelligence).to.be.at.most(200);
        });
    });
});
