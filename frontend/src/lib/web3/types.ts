// Kitty trait types matching the smart contract
export interface Kitty {
  tokenId: bigint;
  generation: bigint;
  birthTime: bigint;
  lastBreedTime: bigint;
  matronId: bigint;
  sireId: bigint;
  bodyColor: number;
  eyeColor: number;
  pattern: number;
  accessory: number;
  background: number;
  isSpecial: boolean;  // hasSpecialTrait from contract
  strength: number;
  agility: number;
  intelligence: number;
  rarity: RarityLevel;
}

export enum RarityLevel {
  Common = 0,
  Uncommon = 1,
  Rare = 2,
  Epic = 3,
  Legendary = 4,
}

export const RARITY_NAMES: Record<RarityLevel, string> = {
  [RarityLevel.Common]: 'Common',
  [RarityLevel.Uncommon]: 'Uncommon',
  [RarityLevel.Rare]: 'Rare',
  [RarityLevel.Epic]: 'Epic',
  [RarityLevel.Legendary]: 'Legendary',
};

export const RARITY_COLORS: Record<RarityLevel, string> = {
  [RarityLevel.Common]: 'rarity-common',
  [RarityLevel.Uncommon]: 'rarity-uncommon',
  [RarityLevel.Rare]: 'rarity-rare',
  [RarityLevel.Epic]: 'rarity-epic',
  [RarityLevel.Legendary]: 'rarity-legendary',
};

// Body color mapping
export const BODY_COLORS = [
  '#FFB6C1', // Light Pink
  '#FFA07A', // Light Salmon
  '#DDA0DD', // Plum
  '#87CEEB', // Sky Blue
  '#98FB98', // Pale Green
  '#FFDAB9', // Peach Puff
  '#E6E6FA', // Lavender
  '#F0E68C', // Khaki
];

// Eye color mapping
export const EYE_COLORS = [
  '#4169E1', // Royal Blue
  '#32CD32', // Lime Green
  '#FFD700', // Gold
  '#FF69B4', // Hot Pink
  '#8A2BE2', // Blue Violet
  '#20B2AA', // Light Sea Green
];

// Pattern mapping
export const PATTERNS = ['Solid', 'Striped', 'Spotted', 'Tabby', 'Calico'];

// Accessory mapping
export const ACCESSORIES = ['None', 'Bow', 'Crown', 'Glasses'];

// Background mapping
export const BACKGROUNDS = ['Pastel', 'Sunset', 'Galaxy'];

// Marketplace listing - matches contract Listing struct
export interface MarketplaceListing {
  tokenId: bigint;
  seller: string;
  price: bigint;
  active: boolean;
  listedAt: bigint;
}

// Marketplace auction - matches contract Auction struct
export interface MarketplaceAuction {
  tokenId: bigint;
  seller: string;
  startingPrice: bigint;
  reservePrice: bigint;
  currentBid: bigint;
  currentBidder: string;
  auctionEnd: bigint;
  active: boolean;
  minBidIncrement: bigint;
}

// Battle state enum - matches contract BattleState
export enum BattleState {
  Pending = 0,
  Active = 1,
  Finished = 2,
  Cancelled = 3,
}

// Battle stats - matches contract BattleStats struct
export interface BattleStats {
  health: number;
  maxHealth: number;
  strength: number;
  agility: number;
  intelligence: number;
  criticalChance: number;
  dodgeChance: number;
}

// Battle types - matches contract Battle struct
export interface Battle {
  battleId: bigint;
  challenger: string;
  opponent: string;
  challengerKittyId: bigint;
  opponentKittyId: bigint;
  state: BattleState;
  winner: string;
  createdAt: bigint;
  startedAt: bigint;
  finishedAt: bigint;
  turn: number;
  challengerStats: BattleStats;
  opponentStats: BattleStats;
}

// Staking info - matches contract StakedKitty struct
export interface StakeInfo {
  tokenId: bigint;
  owner: string;
  stakedAt: bigint;
  lastRewardClaim: bigint;
  isStaked: boolean;
  rarity: RarityLevel;
}
