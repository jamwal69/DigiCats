# 🚀 DigiCats Deployment Guide

## Prerequisites ✅

Before deploying, make sure you have:

1. **MetaMask Wallet** installed and set up
2. **Polygon Mumbai Testnet** added to MetaMask
3. **Test MATIC** in your wallet for gas fees
4. **Your private key** exported from MetaMask

## Step 1: Environment Setup

### 1.1 Get Test MATIC
Visit: https://faucet.polygon.technology/
- Connect your MetaMask wallet
- Select Mumbai network
- Request test MATIC tokens

### 1.2 Add Mumbai Network to MetaMask
If not already added:
- **Network Name**: Polygon Mumbai
- **RPC URL**: https://rpc-mumbai.maticvigil.com/
- **Chain ID**: 80001
- **Currency Symbol**: MATIC
- **Block Explorer**: https://mumbai.polygonscan.com/

### 1.3 Get Your Private Key
1. Open MetaMask
2. Click on account menu (3 dots)
3. Go to "Account Details"
4. Click "Export Private Key"
5. Enter your password
6. Copy the private key (starts with 0x...)

### 1.4 Get PolygonScan API Key (Optional)
1. Go to https://polygonscan.com/apis
2. Create an account
3. Generate a free API key

### 1.5 Update .env File
Open the `.env` file and replace the placeholder values:

```env
PRIVATE_KEY=0x1234567890abcdef... # Your actual private key
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com/
POLYGONSCAN_API_KEY=ABC123... # Your actual API key
```

## Step 2: Deploy Smart Contracts

### 2.1 Compile Contracts
```bash
npm run compile
```

### 2.2 Run Tests (Optional)
```bash
npm run test
```

### 2.3 Deploy to Mumbai
```bash
npm run deploy:mumbai
```

This will deploy all 5 contracts:
- ✅ KittyToken (ERC-20)
- ✅ DigiCats (ERC-721 with genetics)
- ✅ KittyMarketplace (Trading platform)
- ✅ KittyBattle (Combat system)
- ✅ KittyStaking (Reward system)

### 2.4 Verify Contracts (Optional)
```bash
npm run verify
```

### 2.5 Mint Gen 0 Kitties
```bash
npm run mint
```

## Step 3: Start Frontend

### 3.1 Start Development Server
```bash
npm run frontend:start
```

### 3.2 Access the Application
Open your browser to: http://localhost:3000

### 3.3 Connect MetaMask
1. Click "Connect Wallet" in the app
2. Select MetaMask
3. Approve the connection
4. Switch to Mumbai network if prompted

## Step 4: Test the Game

### 4.1 Claim Initial Tokens
- Click on "Claim Free Tokens" to get KittyTokens for breeding

### 4.2 Mint Your First Kitty
- Go to "My Kitties"
- Click "Mint Gen 0 Kitty"
- Confirm the transaction in MetaMask

### 4.3 Test Breeding
- Mint at least 2 kitties
- Go to "Breeding Lab"
- Select two parent kitties
- Approve KittyToken spending
- Breed to create offspring
- **Observe the genetic algorithm** creating unique traits!

### 4.4 Test Marketplace
- List a kitty for sale
- Create an auction
- Test buying/bidding functionality

### 4.5 Test Battle System
- Challenge another kitty to battle
- Execute battle actions
- Gain experience and rewards

### 4.6 Test Staking
- Stake a kitty for rewards
- Check reward calculations
- Test unstaking functionality

## Step 5: Advanced Features

### 5.1 Contract Interaction
Use the deployed contract addresses to interact directly:
- View on Mumbai PolygonScan
- Call contract functions
- Monitor events and transactions

### 5.2 Frontend Customization
- Modify React components in `frontend/src/`
- Update styling with Tailwind CSS
- Add new features to the Web3 integration

### 5.3 Genetic Algorithm Analysis
- Study the breeding outcomes
- Analyze trait inheritance patterns
- Verify the 45/45/10% distribution
- Check rarity calculations

## Troubleshooting

### Common Issues:

**1. "Insufficient funds for gas"**
- Get more test MATIC from the faucet
- Reduce gas limit in MetaMask

**2. "Network mismatch"**
- Ensure MetaMask is set to Mumbai
- Check RPC URL in .env file

**3. "Contract not deployed"**
- Run deployment script again
- Check contract addresses in deployment output

**4. "Transaction reverted"**
- Check if you have enough KittyTokens
- Ensure proper approvals are set
- Verify function parameters

**5. "Private key invalid"**
- Ensure private key starts with 0x
- Check for any extra spaces or characters
- Re-export from MetaMask if needed

## Success Metrics

Your deployment is successful when you can:

✅ **Deploy all 5 contracts** without errors
✅ **Mint Gen 0 kitties** and see unique traits
✅ **Breed kitties** and observe genetic inheritance
✅ **Trade on marketplace** with price discovery
✅ **Battle kitties** using genetic stats
✅ **Stake for rewards** with rarity multipliers
✅ **Frontend connects** to deployed contracts

## Demo Script for College Presentation

1. **Show the genetic algorithm** by breeding kitties
2. **Demonstrate rarity** with different trait combinations
3. **Explain the inheritance** using parent/offspring comparison
4. **Show marketplace economics** with trading
5. **Display battle stats** derived from genetics
6. **Demonstrate staking** with reward calculations

## Next Steps After Deployment

1. **Document your results** for college submission
2. **Create a demo video** showing all features
3. **Analyze gas costs** and optimization opportunities
4. **Expand features** based on user feedback
5. **Consider mainnet deployment** for real usage

---

**🎉 You're ready to deploy and demonstrate your DigiCats game with its advanced genetic algorithm!**
