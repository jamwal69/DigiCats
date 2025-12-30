import { useState, useMemo } from 'react';

export interface Ability {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockLevel: number;
  type: 'passive' | 'active' | 'ultimate';
  effect: {
    stat?: 'strength' | 'agility' | 'intelligence';
    bonus?: number;
    special?: string;
  };
}

export interface CatEvolution {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  abilities: Ability[];
  title: string;
  evolutionStage: number;
}

// All possible abilities cats can unlock
export const ALL_ABILITIES: Ability[] = [
  // Level 2-5 abilities
  { id: 'quick_paws', name: 'Quick Paws', description: '+5 Agility in battles', icon: '🐾', unlockLevel: 2, type: 'passive', effect: { stat: 'agility', bonus: 5 } },
  { id: 'sharp_claws', name: 'Sharp Claws', description: '+5 Strength in battles', icon: '🦴', unlockLevel: 3, type: 'passive', effect: { stat: 'strength', bonus: 5 } },
  { id: 'keen_eyes', name: 'Keen Eyes', description: '+5 Intelligence in battles', icon: '👁️', unlockLevel: 4, type: 'passive', effect: { stat: 'intelligence', bonus: 5 } },
  { id: 'dodge', name: 'Dodge', description: '15% chance to avoid attacks', icon: '💨', unlockLevel: 5, type: 'passive', effect: { special: 'dodge' } },
  
  // Level 6-10 abilities
  { id: 'power_strike', name: 'Power Strike', description: 'Deal 1.5x damage (3 turn cooldown)', icon: '⚔️', unlockLevel: 6, type: 'active', effect: { special: 'power_strike' } },
  { id: 'healing_purr', name: 'Healing Purr', description: 'Restore 15 HP (4 turn cooldown)', icon: '💗', unlockLevel: 7, type: 'active', effect: { special: 'heal' } },
  { id: 'intimidate', name: 'Intimidate', description: 'Reduce enemy STR by 10% for 2 turns', icon: '😾', unlockLevel: 8, type: 'active', effect: { special: 'debuff' } },
  { id: 'ninth_life', name: 'Ninth Life', description: 'Survive fatal blow with 1 HP once per battle', icon: '✨', unlockLevel: 10, type: 'passive', effect: { special: 'revive' } },
  
  // Level 11-15 abilities
  { id: 'critical_master', name: 'Critical Master', description: '+10% critical hit chance', icon: '🎯', unlockLevel: 11, type: 'passive', effect: { special: 'crit_boost' } },
  { id: 'combo_attack', name: 'Combo Attack', description: 'Attack twice in one turn (5 turn cooldown)', icon: '⚡', unlockLevel: 13, type: 'active', effect: { special: 'double_attack' } },
  { id: 'aura_shield', name: 'Aura Shield', description: 'Block next attack completely', icon: '🛡️', unlockLevel: 15, type: 'active', effect: { special: 'shield' } },
  
  // Level 16-20 ultimate abilities
  { id: 'legendary_roar', name: 'Legendary Roar', description: 'Stun enemy for 1 turn + 20 damage', icon: '🦁', unlockLevel: 18, type: 'ultimate', effect: { special: 'stun' } },
  { id: 'nine_lives_fury', name: 'Nine Lives Fury', description: 'Deal 9 rapid hits of 5 damage each', icon: '🔥', unlockLevel: 20, type: 'ultimate', effect: { special: 'fury' } },
];

// Evolution stages
const EVOLUTION_STAGES = [
  { minLevel: 1, maxLevel: 5, name: 'Kitten', suffix: '' },
  { minLevel: 6, maxLevel: 10, name: 'Young Cat', suffix: ' Jr.' },
  { minLevel: 11, maxLevel: 15, name: 'Adult Cat', suffix: '' },
  { minLevel: 16, maxLevel: 20, name: 'Elder Cat', suffix: ' Sr.' },
  { minLevel: 21, maxLevel: 99, name: 'Legendary', suffix: ' the Great' },
];

// XP required per level (increases exponentially)
const getXpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Get title based on level
const getTitleForLevel = (level: number): string => {
  const stage = EVOLUTION_STAGES.find(s => level >= s.minLevel && level <= s.maxLevel);
  return stage?.name || 'Legendary';
};

// Get evolution stage index
const getEvolutionStage = (level: number): number => {
  const stageIndex = EVOLUTION_STAGES.findIndex(s => level >= s.minLevel && level <= s.maxLevel);
  return stageIndex >= 0 ? stageIndex : EVOLUTION_STAGES.length - 1;
};

export const useEvolution = () => {
  // Mock XP data - in real app this would come from blockchain/database
  const [catXp, setCatXp] = useState<Record<string, number>>({});

  const getCatEvolution = (tokenId: bigint): CatEvolution => {
    const id = tokenId.toString();
    // Generate deterministic mock XP based on tokenId
    const mockXp = catXp[id] ?? (Number(tokenId) * 127 + Number(tokenId) * Number(tokenId)) % 5000;
    
    // Calculate level from total XP
    let remainingXp = mockXp;
    let level = 1;
    let xpForCurrentLevel = getXpForLevel(level);
    
    while (remainingXp >= xpForCurrentLevel && level < 99) {
      remainingXp -= xpForCurrentLevel;
      level++;
      xpForCurrentLevel = getXpForLevel(level);
    }
    
    // Get unlocked abilities
    const abilities = ALL_ABILITIES.filter(a => a.unlockLevel <= level);
    
    return {
      level,
      xp: remainingXp,
      xpToNextLevel: xpForCurrentLevel,
      totalXp: mockXp,
      abilities,
      title: getTitleForLevel(level),
      evolutionStage: getEvolutionStage(level),
    };
  };

  // Add XP to a cat (called after winning battles)
  const addXp = (tokenId: bigint, amount: number) => {
    const id = tokenId.toString();
    setCatXp(prev => ({
      ...prev,
      [id]: (prev[id] ?? 0) + amount,
    }));
  };

  // Calculate XP reward for winning a battle
  const calculateBattleXp = (opponentLevel: number, won: boolean): number => {
    if (!won) return Math.floor(10 + opponentLevel * 2); // Lose: small XP
    return Math.floor(50 + opponentLevel * 10); // Win: good XP
  };

  // Get next ability to unlock
  const getNextAbility = (currentLevel: number): Ability | null => {
    return ALL_ABILITIES.find(a => a.unlockLevel > currentLevel) || null;
  };

  return {
    getCatEvolution,
    addXp,
    calculateBattleXp,
    getNextAbility,
    allAbilities: ALL_ABILITIES,
  };
};

// Utility to get ability type color
export const getAbilityTypeColor = (type: Ability['type']): string => {
  switch (type) {
    case 'passive': return 'bg-kawaii-green/20 text-kawaii-green border-kawaii-green/30';
    case 'active': return 'bg-kawaii-blue/20 text-kawaii-blue border-kawaii-blue/30';
    case 'ultimate': return 'bg-kawaii-purple/20 text-kawaii-purple border-kawaii-purple/30';
    default: return 'bg-muted';
  }
};
