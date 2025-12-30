// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CryptoKitties.sol";
import "./KittyToken.sol";

/**
 * @title KittyStaking
 * @dev Staking system for CryptoKitties to earn KITTY tokens
 */
contract KittyStaking is ReentrancyGuard, Ownable {
    CryptoKitties public cryptoKitties;
    KittyToken public kittyToken;
    
    // Staking parameters
    uint256 public constant BASE_REWARD_RATE = 5; // 5% APY base rate
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant RARITY_MULTIPLIER_UNCOMMON = 12; // 1.2x
    uint256 public constant RARITY_MULTIPLIER_RARE = 15; // 1.5x
    uint256 public constant RARITY_MULTIPLIER_EPIC = 20; // 2.0x
    uint256 public constant RARITY_MULTIPLIER_LEGENDARY = 30; // 3.0x
    
    struct StakedKitty {
        uint256 tokenId;
        address owner;
        uint256 stakedAt;
        uint256 lastRewardClaim;
        bool isStaked;
        CryptoKitties.Rarity rarity;
    }
    
    struct UserStakeInfo {
        uint256[] stakedKitties;
        uint256 totalRewardsClaimed;
        uint256 totalRewardsEarned;
    }
    
    // State variables
    mapping(uint256 => StakedKitty) public stakedKitties;
    mapping(address => UserStakeInfo) public userStakeInfo;
    mapping(uint256 => bool) public isStaked;
    
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    
    // Events
    event KittyStaked(
        uint256 indexed tokenId,
        address indexed owner,
        CryptoKitties.Rarity rarity,
        uint256 timestamp
    );
    
    event KittyUnstaked(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 rewardsEarned,
        uint256 timestamp
    );
    
    event RewardsClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    constructor(address _cryptoKittiesAddress, address _kittyTokenAddress) Ownable(msg.sender) {
        cryptoKitties = CryptoKitties(_cryptoKittiesAddress);
        kittyToken = KittyToken(_kittyTokenAddress);
    }
    
    /**
     * @dev Stake a kitty to earn rewards
     */
    function stakeKitty(uint256 tokenId) external nonReentrant {
        require(cryptoKitties.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!isStaked[tokenId], "Kitty already staked");
        require(
            cryptoKitties.isApprovedForAll(msg.sender, address(this)) ||
            cryptoKitties.getApproved(tokenId) == address(this),
            "Staking contract not approved"
        );
        
        // Transfer kitty to staking contract
        cryptoKitties.safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Get kitty rarity
        CryptoKitties.Rarity rarity = cryptoKitties.calculateRarity(tokenId);
        
        // Create staking record
        stakedKitties[tokenId] = StakedKitty({
            tokenId: tokenId,
            owner: msg.sender,
            stakedAt: block.timestamp,
            lastRewardClaim: block.timestamp,
            isStaked: true,
            rarity: rarity
        });
        
        isStaked[tokenId] = true;
        userStakeInfo[msg.sender].stakedKitties.push(tokenId);
        totalStaked++;
        
        emit KittyStaked(tokenId, msg.sender, rarity, block.timestamp);
    }
    
    /**
     * @dev Unstake a kitty and claim all rewards
     */
    function unstakeKitty(uint256 tokenId) external nonReentrant {
        require(isStaked[tokenId], "Kitty not staked");
        require(stakedKitties[tokenId].owner == msg.sender, "Not the staker");
        
        // Calculate and transfer pending rewards
        uint256 pendingRewards = calculatePendingRewards(tokenId);
        if (pendingRewards > 0) {
            kittyToken.mint(msg.sender, pendingRewards);
            userStakeInfo[msg.sender].totalRewardsClaimed += pendingRewards;
            userStakeInfo[msg.sender].totalRewardsEarned += pendingRewards;
            totalRewardsDistributed += pendingRewards;
        }
        
        // Transfer kitty back to owner
        cryptoKitties.safeTransferFrom(address(this), msg.sender, tokenId);
        
        // Update staking records
        stakedKitties[tokenId].isStaked = false;
        isStaked[tokenId] = false;
        _removeFromUserStakedKitties(msg.sender, tokenId);
        totalStaked--;
        
        emit KittyUnstaked(tokenId, msg.sender, pendingRewards, block.timestamp);
    }
    
    /**
     * @dev Claim rewards without unstaking
     */
    function claimRewards(uint256 tokenId) external nonReentrant {
        require(isStaked[tokenId], "Kitty not staked");
        require(stakedKitties[tokenId].owner == msg.sender, "Not the staker");
        
        uint256 pendingRewards = calculatePendingRewards(tokenId);
        require(pendingRewards > 0, "No rewards to claim");
        
        // Update last claim time
        stakedKitties[tokenId].lastRewardClaim = block.timestamp;
        
        // Transfer rewards
        kittyToken.mint(msg.sender, pendingRewards);
        userStakeInfo[msg.sender].totalRewardsClaimed += pendingRewards;
        userStakeInfo[msg.sender].totalRewardsEarned += pendingRewards;
        totalRewardsDistributed += pendingRewards;
        
        emit RewardsClaimed(msg.sender, pendingRewards, block.timestamp);
    }
    
    /**
     * @dev Claim rewards for all staked kitties
     */
    function claimAllRewards() external nonReentrant {
        uint256[] memory userKitties = userStakeInfo[msg.sender].stakedKitties;
        require(userKitties.length > 0, "No staked kitties");
        
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < userKitties.length; i++) {
            uint256 tokenId = userKitties[i];
            if (isStaked[tokenId] && stakedKitties[tokenId].owner == msg.sender) {
                uint256 pendingRewards = calculatePendingRewards(tokenId);
                if (pendingRewards > 0) {
                    stakedKitties[tokenId].lastRewardClaim = block.timestamp;
                    totalRewards += pendingRewards;
                }
            }
        }
        
        require(totalRewards > 0, "No rewards to claim");
        
        // Transfer total rewards
        kittyToken.mint(msg.sender, totalRewards);
        userStakeInfo[msg.sender].totalRewardsClaimed += totalRewards;
        userStakeInfo[msg.sender].totalRewardsEarned += totalRewards;
        totalRewardsDistributed += totalRewards;
        
        emit RewardsClaimed(msg.sender, totalRewards, block.timestamp);
    }
    
    /**
     * @dev Calculate pending rewards for a staked kitty
     */
    function calculatePendingRewards(uint256 tokenId) public view returns (uint256) {
        if (!isStaked[tokenId]) {
            return 0;
        }
        
        StakedKitty memory stakedKitty = stakedKitties[tokenId];
        uint256 stakingDuration = block.timestamp - stakedKitty.lastRewardClaim;
        
        if (stakingDuration == 0) {
            return 0;
        }
        
        // Get rarity multiplier
        uint256 multiplier = getRarityMultiplier(stakedKitty.rarity);
        
        // Calculate base rewards (assuming 1 KITTY token as base)
        uint256 baseAmount = 1 * 10**18; // 1 KITTY token
        uint256 yearlyReward = (baseAmount * BASE_REWARD_RATE * multiplier) / (100 * 10);
        uint256 reward = (yearlyReward * stakingDuration) / SECONDS_PER_YEAR;
        
        return reward;
    }
    
    /**
     * @dev Calculate total pending rewards for a user
     */
    function calculateUserPendingRewards(address user) external view returns (uint256) {
        uint256[] memory userKitties = userStakeInfo[user].stakedKitties;
        uint256 totalPending = 0;
        
        for (uint256 i = 0; i < userKitties.length; i++) {
            totalPending += calculatePendingRewards(userKitties[i]);
        }
        
        return totalPending;
    }
    
    /**
     * @dev Get rarity multiplier
     */
    function getRarityMultiplier(CryptoKitties.Rarity rarity) public pure returns (uint256) {
        if (rarity == CryptoKitties.Rarity.Common) {
            return 10; // 1.0x (base)
        } else if (rarity == CryptoKitties.Rarity.Uncommon) {
            return RARITY_MULTIPLIER_UNCOMMON;
        } else if (rarity == CryptoKitties.Rarity.Rare) {
            return RARITY_MULTIPLIER_RARE;
        } else if (rarity == CryptoKitties.Rarity.Epic) {
            return RARITY_MULTIPLIER_EPIC;
        } else if (rarity == CryptoKitties.Rarity.Legendary) {
            return RARITY_MULTIPLIER_LEGENDARY;
        }
        return 10; // Default to 1.0x
    }
    
    /**
     * @dev Get user's staked kitties
     */
    function getUserStakedKitties(address user) external view returns (uint256[] memory) {
        return userStakeInfo[user].stakedKitties;
    }
    
    /**
     * @dev Get user's staking statistics
     */
    function getUserStakingStats(address user) 
        external 
        view 
        returns (
            uint256 stakedCount,
            uint256 totalClaimed,
            uint256 totalEarned,
            uint256 pendingRewards
        ) 
    {
        UserStakeInfo memory userInfo = userStakeInfo[user];
        uint256 pending = 0;
        
        for (uint256 i = 0; i < userInfo.stakedKitties.length; i++) {
            pending += calculatePendingRewards(userInfo.stakedKitties[i]);
        }
        
        return (
            userInfo.stakedKitties.length,
            userInfo.totalRewardsClaimed,
            userInfo.totalRewardsEarned,
            pending
        );
    }
    
    /**
     * @dev Get staking details for a specific kitty
     */
    function getStakingDetails(uint256 tokenId) 
        external 
        view 
        returns (
            bool staked,
            address owner,
            uint256 stakedAt,
            uint256 stakingDuration,
            CryptoKitties.Rarity rarity,
            uint256 pendingRewards
        ) 
    {
        if (!isStaked[tokenId]) {
            return (false, address(0), 0, 0, CryptoKitties.Rarity.Common, 0);
        }
        
        StakedKitty memory stakedKitty = stakedKitties[tokenId];
        
        return (
            true,
            stakedKitty.owner,
            stakedKitty.stakedAt,
            block.timestamp - stakedKitty.stakedAt,
            stakedKitty.rarity,
            calculatePendingRewards(tokenId)
        );
    }
    
    /**
     * @dev Get global staking statistics
     */
    function getGlobalStats() 
        external 
        view 
        returns (
            uint256 totalKittiesStaked,
            uint256 totalRewardsGiven
        ) 
    {
        return (totalStaked, totalRewardsDistributed);
    }
    
    /**
     * @dev Remove kitty from user's staked list
     */
    function _removeFromUserStakedKitties(address user, uint256 tokenId) internal {
        uint256[] storage userKitties = userStakeInfo[user].stakedKitties;
        
        for (uint256 i = 0; i < userKitties.length; i++) {
            if (userKitties[i] == tokenId) {
                userKitties[i] = userKitties[userKitties.length - 1];
                userKitties.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Emergency function to handle stuck kitties
     */
    function emergencyUnstake(uint256 tokenId) external onlyOwner {
        require(isStaked[tokenId], "Kitty not staked");
        
        StakedKitty memory stakedKitty = stakedKitties[tokenId];
        address owner = stakedKitty.owner;
        
        // Return kitty without rewards
        cryptoKitties.safeTransferFrom(address(this), owner, tokenId);
        
        // Update records
        stakedKitties[tokenId].isStaked = false;
        isStaked[tokenId] = false;
        _removeFromUserStakedKitties(owner, tokenId);
        totalStaked--;
    }
    
    /**
     * @dev Required function to receive NFTs
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
