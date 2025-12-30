import { ethers } from "hardhat";
import { Contract } from "ethers";

async function main() {
    console.log("🚀 Deploying CryptoKitties contracts to Polygon Mumbai...");
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
    
    let kittyToken: Contract;
    let cryptoKitties: Contract;
    let kittyMarketplace: Contract;
    let kittyBattle: Contract;
    let kittyStaking: Contract;
    
    try {
        // 1. Deploy KittyToken (ERC-20)
        console.log("\n📝 1. Deploying KittyToken...");
        const KittyToken = await ethers.getContractFactory("KittyToken");
        kittyToken = await KittyToken.deploy();
        await kittyToken.waitForDeployment();
        const kittyTokenAddress = await kittyToken.getAddress();
        console.log("✅ KittyToken deployed to:", kittyTokenAddress);
        
        // 2. Deploy CryptoKitties NFT contract
        console.log("\n📝 2. Deploying CryptoKitties NFT...");
        const CryptoKitties = await ethers.getContractFactory("CryptoKitties");
        cryptoKitties = await CryptoKitties.deploy(kittyTokenAddress);
        await cryptoKitties.waitForDeployment();
        const cryptoKittiesAddress = await cryptoKitties.getAddress();
        console.log("✅ CryptoKitties deployed to:", cryptoKittiesAddress);
        
        // 3. Deploy KittyMarketplace
        console.log("\n📝 3. Deploying KittyMarketplace...");
        const KittyMarketplace = await ethers.getContractFactory("KittyMarketplace");
        kittyMarketplace = await KittyMarketplace.deploy(cryptoKittiesAddress, kittyTokenAddress);
        await kittyMarketplace.waitForDeployment();
        const kittyMarketplaceAddress = await kittyMarketplace.getAddress();
        console.log("✅ KittyMarketplace deployed to:", kittyMarketplaceAddress);
        
        // 4. Deploy KittyBattle
        console.log("\n📝 4. Deploying KittyBattle...");
        const KittyBattle = await ethers.getContractFactory("KittyBattle");
        kittyBattle = await KittyBattle.deploy(cryptoKittiesAddress, kittyTokenAddress);
        await kittyBattle.waitForDeployment();
        const kittyBattleAddress = await kittyBattle.getAddress();
        console.log("✅ KittyBattle deployed to:", kittyBattleAddress);
        
        // 5. Deploy KittyStaking
        console.log("\n📝 5. Deploying KittyStaking...");
        const KittyStaking = await ethers.getContractFactory("KittyStaking");
        kittyStaking = await KittyStaking.deploy(cryptoKittiesAddress, kittyTokenAddress);
        await kittyStaking.waitForDeployment();
        const kittyStakingAddress = await kittyStaking.getAddress();
        console.log("✅ KittyStaking deployed to:", kittyStakingAddress);
        
        // 6. Setup authorizations and permissions
        console.log("\n⚙️ Setting up contracts permissions...");
        
        // Authorize contracts to mint KITTY tokens
        console.log("📝 Authorizing KittyBattle to mint rewards...");
        await kittyToken.setMinterAuthorization(kittyBattleAddress, true);
        
        console.log("📝 Authorizing KittyStaking to mint rewards...");
        await kittyToken.setMinterAuthorization(kittyStakingAddress, true);
        
        // Wait for transactions to be mined
        console.log("⏳ Waiting for authorization transactions...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log("\n🎉 All contracts deployed successfully!");
        console.log("\n📋 Contract Addresses:");
        console.log("=".repeat(50));
        console.log(`🪙 KittyToken (KITTY):     ${kittyTokenAddress}`);
        console.log(`🐱 CryptoKitties (NFT):   ${cryptoKittiesAddress}`);
        console.log(`🏪 KittyMarketplace:      ${kittyMarketplaceAddress}`);
        console.log(`⚔️  KittyBattle:          ${kittyBattleAddress}`);
        console.log(`🏦 KittyStaking:          ${kittyStakingAddress}`);
        console.log("=".repeat(50));
        
        // Save addresses to file for frontend
        const addresses = {
            KittyToken: kittyTokenAddress,
            CryptoKitties: cryptoKittiesAddress,
            KittyMarketplace: kittyMarketplaceAddress,
            KittyBattle: kittyBattleAddress,
            KittyStaking: kittyStakingAddress,
            deployer: deployer.address,
            network: "polygon-mumbai",
            deployedAt: new Date().toISOString()
        };
        
        const fs = require('fs');
        const path = require('path');
        
        // Create addresses directory if it doesn't exist
        const addressesDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts');
        if (!fs.existsSync(addressesDir)) {
            fs.mkdirSync(addressesDir, { recursive: true });
        }
        
        // Write addresses file
        fs.writeFileSync(
            path.join(addressesDir, 'addresses.json'),
            JSON.stringify(addresses, null, 2)
        );
        
        console.log("\n📁 Contract addresses saved to frontend/src/contracts/addresses.json");
        
        // Initial setup suggestions
        console.log("\n🔧 Next Steps:");
        console.log("1. Mint some Generation 0 kitties for testing");
        console.log("2. Set up the frontend to connect to these contracts");
        console.log("3. Test breeding, marketplace, and battle functionality");
        console.log("4. Deploy to frontend hosting platform");
        
        console.log("\n💡 To mint Gen 0 kitties, run:");
        console.log("npx hardhat run scripts/mint.ts --network polygon-mumbai");
        
        return {
            kittyToken,
            cryptoKitties,
            kittyMarketplace,
            kittyBattle,
            kittyStaking
        };
        
    } catch (error) {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export default main;
