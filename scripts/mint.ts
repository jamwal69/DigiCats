import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🐱 Minting Generation 0 CryptoKitties...");
    
    // Get the deployer account
    const [deployer, user1, user2] = await ethers.getSigners();
    console.log("📋 Minting with account:", deployer.address);
    
    // Load contract addresses
    const addressesPath = path.join(__dirname, '..', 'frontend', 'src', 'contracts', 'addresses.json');
    if (!fs.existsSync(addressesPath)) {
        console.error("❌ Contract addresses not found. Please run deploy script first.");
        process.exit(1);
    }
    
    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    
    // Connect to deployed contracts
    const CryptoKitties = await ethers.getContractFactory("CryptoKitties");
    const cryptoKitties = CryptoKitties.attach(addresses.CryptoKitties);
    
    const KittyToken = await ethers.getContractFactory("KittyToken");
    const kittyToken = KittyToken.attach(addresses.KittyToken);
    
    try {
        // Mint some Gen 0 kitties for testing
        console.log("\n📝 Minting Generation 0 kitties...");
        
        const recipients = [
            { address: deployer.address, name: "Deployer" },
            { address: user1?.address || deployer.address, name: "User1" },
            { address: user2?.address || deployer.address, name: "User2" }
        ];
        
        const mintedKitties = [];
        
        for (let i = 0; i < 10; i++) {
            const recipient = recipients[i % recipients.length];
            
            console.log(`🐱 Minting kitty ${i + 1} to ${recipient.name} (${recipient.address})...`);
            
            const tx = await cryptoKitties.mintGen0Kitty(recipient.address);
            const receipt = await tx.wait();
            
            // Get the minted kitty ID from the event
            const kittyBornEvent = receipt.logs.find((log: any) => {
                try {
                    const parsed = cryptoKitties.interface.parseLog(log);
                    return parsed?.name === 'KittyBorn';
                } catch {
                    return false;
                }
            });
            
            if (kittyBornEvent) {
                const parsed = cryptoKitties.interface.parseLog(kittyBornEvent);
                if (parsed) {
                    const kittyId = parsed.args.kittyId;
                
                // Get kitty details
                const kitty = await cryptoKitties.getKitty(kittyId);
                const rarity = await cryptoKitties.calculateRarity(kittyId);
                
                const rarityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
                
                mintedKitties.push({
                    id: kittyId.toString(),
                    owner: recipient.address,
                    rarity: rarityNames[rarity],
                    traits: {
                        bodyColor: kitty.bodyColor,
                        eyeColor: kitty.eyeColor,
                        pattern: kitty.pattern,
                        accessory: kitty.accessory,
                        background: kitty.background,
                        hasSpecialTrait: kitty.hasSpecialTrait
                    },
                    stats: {
                        strength: kitty.strength,
                        agility: kitty.agility,
                        intelligence: kitty.intelligence
                    }
                });
                
                console.log(`✅ Kitty #${kittyId} minted! Rarity: ${rarityNames[rarity]}`);
                console.log(`   Traits: Body=${kitty.bodyColor}, Eyes=${kitty.eyeColor}, Pattern=${kitty.pattern}`);
                console.log(`   Stats: STR=${kitty.strength}, AGI=${kitty.agility}, INT=${kitty.intelligence}`);
                
                // Small delay to avoid overwhelming the network
                await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        
        console.log("\n🎉 Generation 0 kitties minted successfully!");
        console.log(`📊 Total minted: ${mintedKitties.length}`);
        
        // Display rarity distribution
        const rarityCount = mintedKitties.reduce((acc, kitty) => {
            acc[kitty.rarity] = (acc[kitty.rarity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        console.log("\n📈 Rarity Distribution:");
        Object.entries(rarityCount).forEach(([rarity, count]) => {
            console.log(`   ${rarity}: ${count} kitties`);
        });
        
        // Give some initial KITTY tokens to users for testing
        console.log("\n💰 Distributing initial KITTY tokens...");
        
        for (const recipient of recipients) {
            if (recipient.address !== deployer.address) {
                // Transfer some tokens for testing
                const transferAmount = ethers.parseEther("1000"); // 1000 KITTY tokens
                console.log(`💸 Transferring 1000 KITTY to ${recipient.name}...`);
                await kittyToken.transfer(recipient.address, transferAmount);
            }
        }
        
        console.log("\n✅ Initial setup complete!");
        console.log("\n🔧 You can now:");
        console.log("1. Test breeding by calling breedKitties with two kitty IDs");
        console.log("2. List kitties for sale on the marketplace");
        console.log("3. Start battles between kitties");
        console.log("4. Stake kitties to earn rewards");
        
        console.log("\n📱 Start the frontend with:");
        console.log("cd frontend && npm start");
        
        // Save minted kitties info for frontend testing
        const fs = require('fs');
        const path = require('path');
        
        const mintedKittiesPath = path.join(__dirname, '..', 'frontend', 'src', 'contracts', 'minted-kitties.json');
        fs.writeFileSync(mintedKittiesPath, JSON.stringify(mintedKitties, null, 2));
        console.log("\n📁 Minted kitties info saved to frontend/src/contracts/minted-kitties.json");
        
    } catch (error) {
        console.error("\n❌ Minting failed:", error);
        process.exit(1);
    }
}

// Execute minting
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export default main;
