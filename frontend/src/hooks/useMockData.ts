import { useState, useMemo } from 'react';
import { Kitty, RarityLevel, StakeInfo } from '@/lib/web3/types';

// Mock listing type for demo purposes (combines listing + auction features)
export interface MockListing {
  tokenId: bigint;
  seller: string;
  price: bigint;
  isAuction: boolean;
  highestBid: bigint;
  auctionEnd: bigint;
  active: boolean;
}

// Seeded random for consistent cat generation
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Generate mock kitties for demo purposes with seeded randomness
function generateMockKitty(id: number): Kitty {
  const rand = seededRandom(id * 7919); // Prime multiplier for variety
  
  const rarity = rand() < 0.05 
    ? RarityLevel.Legendary 
    : rand() < 0.15 
      ? RarityLevel.Epic 
      : rand() < 0.35 
        ? RarityLevel.Rare 
        : rand() < 0.6 
          ? RarityLevel.Uncommon 
          : RarityLevel.Common;

  // Generate unique stats based on id for consistency
  const baseStrength = 20 + Math.floor(rand() * 60);
  const baseAgility = 20 + Math.floor(rand() * 60);
  const baseIntelligence = 20 + Math.floor(rand() * 60);
  
  // Rarity bonus
  const rarityBonus = Number(rarity) * 10;

  return {
    tokenId: BigInt(id),
    generation: BigInt(Math.floor(rand() * 5)),
    birthTime: BigInt(Math.floor(Date.now() - rand() * 30 * 24 * 60 * 60 * 1000)),
    lastBreedTime: BigInt(Math.floor(Date.now() - rand() * 7 * 24 * 60 * 60 * 1000)),
    matronId: BigInt(id > 1 ? Math.floor(rand() * (id - 1)) : 0),
    sireId: BigInt(id > 1 ? Math.floor(rand() * (id - 1)) : 0),
    bodyColor: Math.floor(rand() * 8),
    eyeColor: Math.floor(rand() * 6),
    pattern: Math.floor(rand() * 5),
    accessory: Math.floor(rand() * 4),
    background: Math.floor(rand() * 3),
    isSpecial: rand() < 0.1,
    strength: Math.min(100, baseStrength + rarityBonus),
    agility: Math.min(100, baseAgility + rarityBonus),
    intelligence: Math.min(100, baseIntelligence + rarityBonus),
    rarity,
  };
}

function generateMockListing(kitty: Kitty): MockListing {
  const isAuction = Math.random() < 0.3;
  const basePrice = (Number(kitty.rarity) + 1) * 10; // Price in KITTY tokens
  
  return {
    tokenId: kitty.tokenId,
    seller: `0x${Math.random().toString(16).slice(2, 42)}`,
    price: BigInt(Math.floor(basePrice * 1e18)),
    isAuction,
    auctionEnd: isAuction ? BigInt(Math.floor(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)) : BigInt(0),
    highestBid: isAuction ? BigInt(Math.floor(basePrice * 0.7 * 1e18)) : BigInt(0),
    active: true,
  };
}

// Mock battle type for demo purposes
export interface MockBattle {
  battleId: bigint;
  challengerKittyId: bigint;
  opponentKittyId: bigint;
  challengerOwner: string;
  opponentOwner: string;
  challengerHealth: number;
  opponentHealth: number;
  isActive: boolean;
  challengerTurn: boolean;
  winner: string;
  wager: bigint;
}

function generateMockBattle(id: number): MockBattle {
  return {
    battleId: BigInt(id),
    challengerKittyId: BigInt(Math.floor(Math.random() * 100) + 1),
    opponentKittyId: BigInt(Math.floor(Math.random() * 100) + 1),
    challengerOwner: `0x${Math.random().toString(16).slice(2, 42)}`,
    opponentOwner: `0x${Math.random().toString(16).slice(2, 42)}`,
    challengerHealth: Math.floor(Math.random() * 100) + 1,
    opponentHealth: Math.floor(Math.random() * 100) + 1,
    isActive: true,
    challengerTurn: Math.random() < 0.5,
    winner: '0x0000000000000000000000000000000000000000',
    wager: BigInt(Math.floor(Math.random() * 0.5 * 1e18)),
  };
}

export function useMockData() {
  // Generate consistent mock data - 16 unique cats
  const myKitties = useMemo(() => 
    Array.from({ length: 16 }, (_, i) => generateMockKitty(i + 1)),
    []
  );

  const marketplaceKitties = useMemo(() => {
    const kitties = Array.from({ length: 24 }, (_, i) => generateMockKitty(i + 100));
    return kitties.map(k => ({ kitty: k, listing: generateMockListing(k) }));
  }, []);

  const activeBattles = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => generateMockBattle(i + 1)),
    []
  );

  const [stakedKitties, setStakedKitties] = useState<StakeInfo[]>([]);
  const [kittyBalance, setKittyBalance] = useState(BigInt(100 * 1e18)); // 100 KITTY tokens
  const [hasClaimed, setHasClaimed] = useState(false);

  const stakeKitty = (tokenId: bigint) => {
    const stakeInfo: StakeInfo = {
      tokenId,
      owner: '0x0000000000000000000000000000000000000000',
      stakedAt: BigInt(Math.floor(Date.now())),
      lastClaimTime: BigInt(Math.floor(Date.now())),
      pendingRewards: BigInt(0),
    };
    setStakedKitties(prev => [...prev, stakeInfo]);
  };

  const unstakeKitty = (tokenId: bigint) => {
    setStakedKitties(prev => prev.filter(s => s.tokenId !== tokenId));
  };

  const claimTokens = () => {
    if (!hasClaimed) {
      setKittyBalance(prev => prev + BigInt(100 * 1e18));
      setHasClaimed(true);
    }
  };

  return {
    myKitties,
    marketplaceKitties,
    activeBattles,
    stakedKitties,
    kittyBalance,
    hasClaimed,
    stakeKitty,
    unstakeKitty,
    claimTokens,
  };
}
