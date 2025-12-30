<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-Ethereum-blue?style=for-the-badge&logo=ethereum" />
  <img src="https://img.shields.io/badge/Network-Sepolia-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
</p>

<h1 align="center">
  🐱 DigiCats
</h1>

<p align="center">
  <strong>A next-generation NFT collectible game on Ethereum</strong>
</p>

<p align="center">
  Breed • Battle • Trade • Stake
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-smart-contracts">Contracts</a> •
  <a href="#-gameplay">Gameplay</a> •
  <a href="#-tech-stack">Tech Stack</a>
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧬 Genetic Breeding System
Each DigiCat has unique DNA with traits like body color, eye color, patterns, and accessories. Breed two cats to create offspring with inherited and mutated traits. Rare special traits can emerge!

</td>
<td width="50%">

### ⚔️ Turn-Based Battles
Challenge other players to strategic battles! Each cat has Strength, Agility, and Intelligence stats. Execute attacks, defend, or use special abilities to defeat your opponent.

</td>
</tr>
<tr>
<td width="50%">

### 🏪 NFT Marketplace
List your cats for fixed-price sales or create auctions. Trade with other players using KITTY tokens. Low 2.5% marketplace fee!

</td>
<td width="50%">

### 💎 Staking Rewards
Stake your cats to earn passive KITTY token rewards. Rarer cats earn higher rewards. Claim anytime or let them accumulate!

</td>
</tr>
</table>

---

## 🎮 Gameplay

### Cat Attributes
Every DigiCat is unique with:
- **Generation** - Gen0 are the rarest founders
- **Visual Traits** - Body color, eye color, pattern, accessory, background
- **Battle Stats** - Strength 💪, Agility ⚡, Intelligence 🧠
- **Rarity** - Common → Uncommon → Rare → Epic → Legendary

### Breeding Mechanics
```
Parent A (Gen 0)  +  Parent B (Gen 0)  =  Child (Gen 1)
     DNA               DNA                Inherited + Mutated DNA
```
- Higher generation cats have more diverse traits
- Breeding cooldown prevents spam
- Small chance for special trait mutations

### Battle System
```
┌─────────────────────────────────────────┐
│  Your Cat          VS          Enemy    │
│  ❤️ 100/100                  ❤️ 85/100  │
│                                         │
│  [⚔️ Attack] [🛡️ Defend] [✨ Special]  │
└─────────────────────────────────────────┘
```
- Stats determine damage and dodge chance
- Critical hits deal bonus damage
- Winner takes the prize pool!

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/jamwal69/DigiCats.git
cd DigiCats

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Run Development Server

```bash
# From frontend directory
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Connect Your Wallet
1. Install MetaMask
2. Switch to Sepolia testnet
3. Click "Connect Wallet"
4. Claim free KITTY tokens to start playing!

---

## 📜 Smart Contracts

### Deployed on Sepolia Testnet

| Contract | Address | Description |
|----------|---------|-------------|
| **DigiCats** | `0xba9847de247D2930bc8CFD9CfB26fa4e3b93cF59` | Main NFT contract with breeding |
| **KittyMarketplace** | `0xA2e26014B850684aB4026b9dfCB8aeBeDED018F9` | Buy/sell cats, auctions |
| **KittyBattle** | `0x2eF7CE17630bcADAdC28EF8cf846DD6dB30B842F` | PvP battle system |
| **KittyStaking** | `0x7BE33aABB8AD08541586696e975fC0299a43fc0A` | Stake cats for rewards |
| **KittyToken** | `0x43dBDc57206B3C16c01d0da91dE113B2ffE5bB89` | ERC20 game currency |

### Contract Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         DigiCats                             │
│                    (ERC721 NFT Contract)                     │
│  • Mint Gen0 cats    • Breed cats    • Store cat DNA        │
└─────────────────────────────┬────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Marketplace  │    │    Battle     │    │    Staking    │
│               │    │               │    │               │
│ • List/Buy    │    │ • Create      │    │ • Stake       │
│ • Auctions    │    │ • Join        │    │ • Unstake     │
│ • Fees        │    │ • Fight       │    │ • Rewards     │
└───────┬───────┘    └───────────────┘    └───────┬───────┘
        │                                         │
        └────────────────────┬────────────────────┘
                             ▼
                    ┌───────────────┐
                    │  KittyToken   │
                    │   (ERC20)     │
                    │               │
                    │ • Payments    │
                    │ • Rewards     │
                    │ • Free claim  │
                    └───────────────┘
```

---

## 🛠️ Tech Stack

### Blockchain
- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Development framework
- **OpenZeppelin** - Secure contract libraries
- **Sepolia** - Ethereum testnet

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations

### Web3
- **wagmi v2** - React hooks for Ethereum
- **viem** - TypeScript Ethereum library
- **WalletConnect** - Wallet connections

---

## 📁 Project Structure

```
DigiCats/
├── contracts/              # Solidity smart contracts
│   ├── DigiCats.sol       # Main NFT contract
│   ├── KittyMarketplace.sol
│   ├── KittyBattle.sol
│   ├── KittyStaking.sol
│   └── KittyToken.sol
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities & contracts
│   └── public/
├── scripts/               # Deployment scripts
├── test/                  # Contract tests
├── hardhat.config.ts
└── package.json
```

---

## 🎨 Screenshots

### Dashboard
*Manage your collection, mint new cats, and track your stats*

### Marketplace
*Buy and sell cats with other players*

### Battle Arena
*Challenge others to strategic turn-based combat*

### Staking
*Earn passive KITTY token rewards*

---

## 🧪 Running Tests

```bash
# Run contract tests
npx hardhat test

# Run with coverage
npx hardhat coverage
```

---

## 🚢 Deployment

### Deploy Contracts

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

### Build Frontend

```bash
cd frontend
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by CryptoKitties
- Built with OpenZeppelin contracts
- UI components from shadcn/ui

---

<p align="center">
  <strong>Built with 💜 by <a href="https://github.com/jamwal69">jamwal69</a></strong>
</p>

<p align="center">
  <a href="https://github.com/jamwal69/DigiCats/stargazers">⭐ Star this repo</a> •
  <a href="https://github.com/jamwal69/DigiCats/issues">🐛 Report Bug</a> •
  <a href="https://github.com/jamwal69/DigiCats/issues">✨ Request Feature</a>
</p>
