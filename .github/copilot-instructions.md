# CryptoKitties Project Instructions for GitHub Copilot

## Project Overview
This is a complete blockchain-based CryptoKitties game built for educational purposes. The project implements advanced genetic algorithms for NFT breeding, marketplace functionality, battle system, and staking rewards on Polygon Mumbai testnet.

## Core Architecture

### Smart Contracts (Solidity 0.8.19)
- **CryptoKitties.sol**: Main NFT contract with advanced genetic breeding system
- **KittyToken.sol**: ERC-20 utility token for ecosystem transactions
- **KittyMarketplace.sol**: Trading platform with auctions and fixed price sales
- **KittyBattle.sol**: Turn-based battle system with stat-based combat
- **KittyStaking.sol**: Staking system with rarity-based rewards

### Frontend (React + TypeScript)
- **Web3 Integration**: Ethers.js for blockchain interactions
- **UI Framework**: Tailwind CSS for responsive design
- **State Management**: React Context for Web3 connections
- **Routing**: React Router for navigation

## Key Features to Maintain

### 1. Genetic Algorithm (CRITICAL)
The genetic breeding system is the core feature and must maintain:
- 45% traits from parent1, 45% from parent2, 10% mutations
- 12 traits: speed, strength, intelligence, luck, agility, cuteness, pattern, eyeColor, bodyColor, accent, background, generation
- Proper rarity calculation based on trait combinations
- Battle stats derived from genetic traits

### 2. Smart Contract Security
- All contracts use OpenZeppelin security patterns
- Proper access controls and authorization
- Reentrancy guards on financial functions
- Input validation and bounds checking

### 3. Gas Optimization
- Efficient storage patterns
- Minimal external calls
- Optimized loops and calculations
- Proper use of view/pure functions

## Development Guidelines

### Coding Standards
- Follow Solidity style guide for smart contracts
- Use TypeScript strict mode for frontend
- Implement proper error handling and user feedback
- Maintain comprehensive comments for complex logic

### Testing Requirements
- Unit tests for all smart contract functions
- Integration tests for contract interactions
- Frontend component testing
- End-to-end testing for complete workflows

### Deployment Process
1. Compile contracts: `npm run compile`
2. Run tests: `npm run test`
3. Deploy to Mumbai: `npm run deploy:mumbai`
4. Verify contracts: `npm run verify`
5. Mint Gen 0 kitties: `npm run mint`

## Important Context

### Genetic Breeding Logic
When suggesting improvements to breeding:
```solidity
function _generateOffspringTraits(
    uint256[] memory parent1Traits,
    uint256[] memory parent2Traits
) private view returns (uint256[] memory) {
    // 45% parent1, 45% parent2, 10% mutation
    // Each trait has specific ranges and rarity calculations
}
```

### Battle System
- Stats derived from genetic traits
- Turn-based combat with critical hits and dodging
- Experience points and level progression
- Tournament and leaderboard systems

### Marketplace Features
- Fixed price listings and auction system
- Breeding offers between users
- Sale history and price tracking
- Marketplace fees and revenue sharing

### Staking Mechanics
- Rarity-based reward multipliers
- Time-locked staking periods
- Compound interest calculations
- Emergency unstaking with penalties

## Common Tasks

### Adding New Traits
1. Update trait ranges in CryptoKitties.sol
2. Modify visualization in KittyVisualization component
3. Update rarity calculations
4. Test breeding outcomes

### Marketplace Improvements
1. Enhance auction bidding mechanisms
2. Add advanced filtering and sorting
3. Implement bulk operations
4. Optimize gas costs for listings

### Battle Enhancements
1. Add new battle mechanics or special abilities
2. Implement team battles or tournaments
3. Balance combat formulas
4. Add battle animations

### Frontend Development
1. Focus on user experience and Web3 integration
2. Handle loading states and error conditions
3. Implement responsive design patterns
4. Optimize for mobile devices

## Security Considerations
- Always validate user inputs
- Check for integer overflow/underflow
- Implement proper access controls
- Use events for important state changes
- Consider MEV protection for valuable operations

## Performance Guidelines
- Minimize state reads in loops
- Use memory instead of storage when possible
- Batch operations where applicable
- Implement pagination for large datasets
- Cache frequently accessed data

Remember: The genetic algorithm is the heart of this project and should be treated with special care when making any modifications.
