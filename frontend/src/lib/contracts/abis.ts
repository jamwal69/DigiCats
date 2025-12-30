// DigiCats Contract ABIs for Sepolia Testnet - JSON format for wagmi/viem

export const DIGICATS_ABI = [
  // Read functions
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    name: "getKitty",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "generation", type: "uint8" },
          { name: "birthTime", type: "uint256" },
          { name: "lastBreedTime", type: "uint256" },
          { name: "matronId", type: "uint256" },
          { name: "sireId", type: "uint256" },
          { name: "bodyColor", type: "uint8" },
          { name: "eyeColor", type: "uint8" },
          { name: "pattern", type: "uint8" },
          { name: "accessory", type: "uint8" },
          { name: "background", type: "uint8" },
          { name: "hasSpecialTrait", type: "bool" },
          { name: "strength", type: "uint16" },
          { name: "agility", type: "uint16" },
          { name: "intelligence", type: "uint16" },
        ],
      },
    ],
  },
  {
    name: "getKittiesByOwner",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256[]" }],
  },
  {
    name: "gen0Minted",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "MAX_GEN0_SUPPLY",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "BREEDING_FEE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "BREEDING_COOLDOWN",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "calculateRarity",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "canBreed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "isApprovedForAll",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "getApproved",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  // Write functions
  {
    name: "mintGen0Kitty",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }],
    outputs: [],
  },
  {
    name: "breedKitties",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "matronId", type: "uint256" },
      { name: "sireId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "setApprovalForAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "safeTransferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  // Events
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
  {
    name: "KittyBorn",
    type: "event",
    inputs: [
      { name: "kittyId", type: "uint256", indexed: true },
      { name: "matronId", type: "uint256", indexed: true },
      { name: "sireId", type: "uint256", indexed: true },
      { name: "generation", type: "uint8", indexed: false },
      { name: "owner", type: "address", indexed: false },
    ],
  },
] as const;

export const KITTY_MARKETPLACE_ABI = [
  // Read functions
  {
    name: "listings",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "seller", type: "address" },
          { name: "price", type: "uint256" },
          { name: "active", type: "bool" },
          { name: "listedAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "auctions",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "seller", type: "address" },
          { name: "startingPrice", type: "uint256" },
          { name: "reservePrice", type: "uint256" },
          { name: "currentBid", type: "uint256" },
          { name: "currentBidder", type: "address" },
          { name: "auctionEnd", type: "uint256" },
          { name: "active", type: "bool" },
          { name: "minBidIncrement", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "isListed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "isAuctioned",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "getActiveListings",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256[]" }],
  },
  {
    name: "getActiveAuctions",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256[]" }],
  },
  {
    name: "MARKETPLACE_FEE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  // Write functions
  {
    name: "listKitty",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "cancelListing",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "purchaseKitty",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "createAuction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "startingPrice", type: "uint256" },
      { name: "reservePrice", type: "uint256" },
      { name: "duration", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "placeBid",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "endAuction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancelAuction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  // Events
  {
    name: "KittyListed",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "KittyPurchased",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "ListingCancelled",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
    ],
  },
  {
    name: "AuctionCreated",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "startingPrice", type: "uint256", indexed: false },
      { name: "reservePrice", type: "uint256", indexed: false },
      { name: "duration", type: "uint256", indexed: false },
    ],
  },
  {
    name: "BidPlaced",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "bidder", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "AuctionEnded",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "finalPrice", type: "uint256", indexed: false },
    ],
  },
] as const;

export const KITTY_BATTLE_ABI = [
  // Read functions
  {
    name: "battles",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "battleId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "battleId", type: "uint256" },
          { name: "challenger", type: "address" },
          { name: "opponent", type: "address" },
          { name: "challengerKittyId", type: "uint256" },
          { name: "opponentKittyId", type: "uint256" },
          { name: "state", type: "uint8" },
          { name: "winner", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "startedAt", type: "uint256" },
          { name: "finishedAt", type: "uint256" },
          { name: "turn", type: "uint8" },
          {
            name: "challengerStats",
            type: "tuple",
            components: [
              { name: "health", type: "uint16" },
              { name: "maxHealth", type: "uint16" },
              { name: "strength", type: "uint16" },
              { name: "agility", type: "uint16" },
              { name: "intelligence", type: "uint16" },
              { name: "criticalChance", type: "uint8" },
              { name: "dodgeChance", type: "uint8" },
            ],
          },
          {
            name: "opponentStats",
            type: "tuple",
            components: [
              { name: "health", type: "uint16" },
              { name: "maxHealth", type: "uint16" },
              { name: "strength", type: "uint16" },
              { name: "agility", type: "uint16" },
              { name: "intelligence", type: "uint16" },
              { name: "criticalChance", type: "uint8" },
              { name: "dodgeChance", type: "uint8" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "getPendingBattles",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256[]" }],
  },
  {
    name: "getActiveBattles",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256[]" }],
  },
  {
    name: "getUserBattles",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256[]" }],
  },
  {
    name: "kittyInBattle",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "kittyId", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "wins",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "losses",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "totalBattles",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "BATTLE_ENTRY_FEE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "BATTLE_REWARD",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  // Write functions
  {
    name: "createBattle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "kittyId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "joinBattle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "battleId", type: "uint256" },
      { name: "kittyId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "performAction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "battleId", type: "uint256" },
      { name: "actionType", type: "uint8" },
    ],
    outputs: [],
  },
  {
    name: "cancelBattle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "battleId", type: "uint256" }],
    outputs: [],
  },
  // Events
  {
    name: "BattleCreated",
    type: "event",
    inputs: [
      { name: "battleId", type: "uint256", indexed: true },
      { name: "challenger", type: "address", indexed: true },
      { name: "challengerKittyId", type: "uint256", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "BattleJoined",
    type: "event",
    inputs: [
      { name: "battleId", type: "uint256", indexed: true },
      { name: "opponent", type: "address", indexed: true },
      { name: "opponentKittyId", type: "uint256", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "BattleAction",
    type: "event",
    inputs: [
      { name: "battleId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "actionType", type: "uint8", indexed: false },
      { name: "damage", type: "uint256", indexed: false },
      { name: "isCritical", type: "bool", indexed: false },
      { name: "isDodged", type: "bool", indexed: false },
    ],
  },
  {
    name: "BattleFinished",
    type: "event",
    inputs: [
      { name: "battleId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "loser", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const KITTY_STAKING_ABI = [
  // Read functions
  {
    name: "stakedKitties",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "owner", type: "address" },
          { name: "stakedAt", type: "uint256" },
          { name: "lastRewardClaim", type: "uint256" },
          { name: "isStaked", type: "bool" },
          { name: "rarity", type: "uint8" },
        ],
      },
    ],
  },
  {
    name: "getUserStakedKitties",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256[]" }],
  },
  {
    name: "isStaked",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "calculatePendingRewards",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "totalStaked",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "totalRewardsDistributed",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "BASE_REWARD_RATE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  // Write functions
  {
    name: "stakeKitty",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "unstakeKitty",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claimRewards",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claimAllRewards",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  // Events
  {
    name: "KittyStaked",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "rarity", type: "uint8", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "KittyUnstaked",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "rewardsEarned", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "RewardsClaimed",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const KITTY_TOKEN_ABI = [
  // Read functions
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "hasClaimed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "INITIAL_CLAIM_AMOUNT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  // Write functions
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "claimInitialTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  // Events
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Approval",
    type: "event",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

// Contract addresses on Sepolia Testnet - DEPLOYED CONTRACTS
export const CONTRACT_ADDRESSES = {
  DIGICATS: "0xba9847de247D2930bc8CFD9CfB26fa4e3b93cF59",
  KITTY_MARKETPLACE: "0xA2e26014B850684aB4026b9dfCB8aeBeDED018F9",
  KITTY_BATTLE: "0x2eF7CE17630bcADAdC28EF8cf846DD6dB30B842F",
  KITTY_STAKING: "0x7BE33aABB8AD08541586696e975fC0299a43fc0A",
  KITTY_TOKEN: "0x43dBDc57206B3C16c01d0da91dE113B2ffE5bB89",
} as const;
