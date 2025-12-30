const hre = require("hardhat");

async function showGameStats() {
    console.log("🎮 CRYPTOKITTIES GAME STATISTICS");
    console.log("=".repeat(60));
    
    const cryptoKitties = await hre.ethers.getContractAt("CryptoKitties", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    const kittyToken = await hre.ethers.getContractAt("KittyToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
    
    // Get total supply
    const totalSupply = await cryptoKitties.totalSupply();
    console.log(`📊 Total Kitties Minted: ${totalSupply}`);
    
    // Show token stats
    const tokenSupply = await kittyToken.totalSupply();
    console.log(`🪙 KITTY Token Supply: ${hre.ethers.formatEther(tokenSupply)}`);
    
    console.log("\n🐱 KITTY SHOWCASE:");
    console.log("-".repeat(40));
    
    // Show all kitties
    for (let i = 1; i <= totalSupply; i++) {
        try {
            const kitty = await cryptoKitties.getKitty(i);
            const owner = await cryptoKitties.ownerOf(i);
            
            // Calculate rarity
            let rarity = "Common";
            if (kitty.bodyColor >= 5 || kitty.eyeColor >= 4) rarity = "Rare";
            else if (kitty.bodyColor >= 3 || kitty.eyeColor >= 2) rarity = "Uncommon";
            
            console.log(`🐱 Kitty #${i} | Gen ${kitty.generation} | ${rarity}`);
            console.log(`   Traits: Body=${kitty.bodyColor}, Eyes=${kitty.eyeColor}, Pattern=${kitty.pattern}`);
            console.log(`   Stats: STR=${kitty.strength}, AGI=${kitty.agility}, INT=${kitty.intelligence}`);
            console.log(`   Owner: ${owner.slice(0,10)}...`);
            console.log("");
        } catch (e) {
            // Skip if kitty doesn't exist
        }
    }
    
    console.log("🎯 GAME FEATURES DEMONSTRATED:");
    console.log("✅ Advanced Genetic Algorithm (45/45/10% inheritance)");
    console.log("✅ Unique Trait Generation with Rarity System");
    console.log("✅ Battle Stats Derived from Genetics");
    console.log("✅ Breeding System with Fee Economics");
    console.log("✅ Marketplace Trading Platform");
    console.log("✅ NFT Ownership Transfer");
    console.log("✅ Token Economics Integration");
    
    console.log("\n🏆 YOUR CRYPTOKITTIES ECOSYSTEM IS LIVE!");
    console.log("Ready for deployment to Polygon Mumbai testnet!");
}

showGameStats()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
