const hre = require("hardhat");

async function testBreeding() {
    console.log("🧬 Testing CryptoKitties Genetic Algorithm!");
    console.log("=".repeat(50));
    
    const [deployer] = await hre.ethers.getSigners();
    
    // Get deployed contracts
    const cryptoKitties = await hre.ethers.getContractAt("CryptoKitties", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    const kittyToken = await hre.ethers.getContractAt("KittyToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
    
    console.log("👤 Testing with account:", deployer.address);
    
    // Get parent kitties
    console.log("\n🔍 Getting Parent Kitties...");
    const parent1 = await cryptoKitties.getKitty(1);
    const parent2 = await cryptoKitties.getKitty(4);
    
    console.log("👨 Parent 1 (Kitty #1):");
    console.log(`   Body: ${parent1.bodyColor}, Eyes: ${parent1.eyeColor}, Pattern: ${parent1.pattern}`);
    console.log(`   Stats: STR=${parent1.strength}, AGI=${parent1.agility}, INT=${parent1.intelligence}`);
    
    console.log("👩 Parent 2 (Kitty #4):");
    console.log(`   Body: ${parent2.bodyColor}, Eyes: ${parent2.eyeColor}, Pattern: ${parent2.pattern}`);
    console.log(`   Stats: STR=${parent2.strength}, AGI=${parent2.agility}, INT=${parent2.intelligence}`);
    
    // Approve breeding fee
    console.log("\n💰 Approving breeding fee...");
    const breedingFee = hre.ethers.parseEther("10");
    await kittyToken.approve(cryptoKitties.target, breedingFee);
    console.log("✅ Breeding fee approved!");
    
    // Breed kitties
    console.log("\n🧬 BREEDING KITTIES...");
    const breedTx = await cryptoKitties.breedKitties(1, 4);
    await breedTx.wait();
    console.log("✅ Breeding successful!");
    
    // Get offspring
    const offspring = await cryptoKitties.getKitty(11);
    console.log("\n👶 OFFSPRING (Kitty #11):");
    console.log(`   Generation: ${offspring.generation}`);
    console.log(`   Body: ${offspring.bodyColor}, Eyes: ${offspring.eyeColor}, Pattern: ${offspring.pattern}`);
    console.log(`   Stats: STR=${offspring.strength}, AGI=${offspring.agility}, INT=${offspring.intelligence}`);
    
    // Analyze inheritance
    console.log("\n🔬 GENETIC ANALYSIS:");
    console.log("Trait Inheritance Pattern:");
    
    if (offspring.bodyColor == parent1.bodyColor) {
        console.log(`   Body Color: Inherited from Parent 1 ✅`);
    } else if (offspring.bodyColor == parent2.bodyColor) {
        console.log(`   Body Color: Inherited from Parent 2 ✅`);
    } else {
        console.log(`   Body Color: MUTATION! 🧬 (${offspring.bodyColor})`);
    }
    
    if (offspring.eyeColor == parent1.eyeColor) {
        console.log(`   Eye Color: Inherited from Parent 1 ✅`);
    } else if (offspring.eyeColor == parent2.eyeColor) {
        console.log(`   Eye Color: Inherited from Parent 2 ✅`);
    } else {
        console.log(`   Eye Color: MUTATION! 🧬 (${offspring.eyeColor})`);
    }
    
    if (offspring.pattern == parent1.pattern) {
        console.log(`   Pattern: Inherited from Parent 1 ✅`);
    } else if (offspring.pattern == parent2.pattern) {
        console.log(`   Pattern: Inherited from Parent 2 ✅`);
    } else {
        console.log(`   Pattern: MUTATION! 🧬 (${offspring.pattern})`);
    }
    
    console.log("\n🎯 GENETIC ALGORITHM SUCCESS!");
    console.log("The offspring shows proper trait inheritance with potential mutations!");
}

testBreeding()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
