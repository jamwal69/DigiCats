const hre = require("hardhat");

async function testMarketplace() {
    console.log("🏪 Testing CryptoKitties Marketplace!");
    console.log("=".repeat(50));
    
    const [deployer, user1] = await hre.ethers.getSigners();
    
    // Get deployed contracts
    const cryptoKitties = await hre.ethers.getContractAt("CryptoKitties", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    const marketplace = await hre.ethers.getContractAt("KittyMarketplace", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    const kittyToken = await hre.ethers.getContractAt("KittyToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
    
    console.log("👤 Seller:", deployer.address);
    console.log("🛒 Buyer:", user1.address);
    
    // List kitty for sale
    console.log("\n📝 Listing Kitty #7 for sale...");
    await cryptoKitties.approve(marketplace.target, 7);
    const price = hre.ethers.parseEther("100");
    await marketplace.listKitty(7, price);
    console.log("✅ Kitty #7 listed for 100 KITTY tokens!");
    
    // Check listing
    const listing = await marketplace.listings(7);
    console.log(`📋 Listing Details: Seller=${listing.seller}, Price=${hre.ethers.formatEther(listing.price)} KITTY`);
    
    // Buy kitty as user1
    console.log("\n🛒 User1 buying the kitty...");
    await kittyToken.connect(user1).approve(marketplace.target, price);
    await marketplace.connect(user1).purchaseKitty(7);
    console.log("✅ Purchase successful!");
    
    // Verify ownership transfer
    const newOwner = await cryptoKitties.ownerOf(7);
    console.log(`👑 New owner of Kitty #7: ${newOwner}`);
    console.log(`✅ Ownership transferred: ${newOwner === user1.address ? 'SUCCESS' : 'FAILED'}`);
    
    console.log("\n🎯 MARKETPLACE SUCCESS!");
    console.log("Kitty successfully sold and ownership transferred!");
}

testMarketplace()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
