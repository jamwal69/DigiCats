import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useMockData } from '@/hooks/useMockData';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { CatAvatar } from '@/components/CatAvatar';
import { Kitty, RarityLevel, RARITY_NAMES } from '@/lib/web3/types';
import { cn } from '@/lib/utils';

interface FusedCat extends Kitty {
  fusionPower: number;
  inheritedTraits: string[];
  fusionAbilities: string[];
}

type CatAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const FUSION_ABILITIES = [
  { name: 'Cosmic Fury', description: 'Deal 2x damage on critical hits', tier: 'legendary' },
  { name: 'Soul Link', description: 'Share 25% of damage with opponent', tier: 'legendary' },
  { name: 'Astral Form', description: '30% chance to dodge any attack', tier: 'legendary' },
  { name: 'Eternal Flame', description: 'Burn enemies for 5% HP per turn', tier: 'epic' },
  { name: 'Thunder Strike', description: 'Stun opponent for 1 turn on hit', tier: 'epic' },
  { name: 'Phoenix Rebirth', description: 'Revive once with 50% HP', tier: 'legendary' },
];

export default function Fusion() {
  const { myKitties } = useMockData();
  const { playClick, playSuccess, playError } = useSoundEffects();
  
  const [selectedCats, setSelectedCats] = useState<[Kitty | null, Kitty | null]>([null, null]);
  const [isFusing, setIsFusing] = useState(false);
  const [fusionProgress, setFusionProgress] = useState(0);
  const [fusedCat, setFusedCat] = useState<FusedCat | null>(null);
  const [showResult, setShowResult] = useState(false);

  const selectCat = (cat: Kitty) => {
    playClick();
    if (selectedCats[0]?.tokenId === cat.tokenId || selectedCats[1]?.tokenId === cat.tokenId) {
      // Deselect
      setSelectedCats(prev => 
        prev[0]?.tokenId === cat.tokenId ? [prev[1], null] : [prev[0], null]
      );
      return;
    }
    
    if (!selectedCats[0]) {
      setSelectedCats([cat, null]);
    } else if (!selectedCats[1]) {
      setSelectedCats([selectedCats[0], cat]);
    }
  };

  const calculateFusionResult = (): FusedCat => {
    const [cat1, cat2] = selectedCats;
    if (!cat1 || !cat2) throw new Error('Need two cats');

    // Combine stats with bonus
    const fusionBonus = 1.5;
    const avgStrength = Math.floor((cat1.strength + cat2.strength) / 2 * fusionBonus);
    const avgAgility = Math.floor((cat1.agility + cat2.agility) / 2 * fusionBonus);
    const avgIntelligence = Math.floor((cat1.intelligence + cat2.intelligence) / 2 * fusionBonus);

    // Inherit best traits
    const inheritedTraits: string[] = [];
    if (cat1.isSpecial || cat2.isSpecial) inheritedTraits.push('Special Lineage');
    if (Number(cat1.generation) === 0 || Number(cat2.generation) === 0) inheritedTraits.push('Genesis Blood');
    if (cat1.rarity >= RarityLevel.Epic || cat2.rarity >= RarityLevel.Epic) inheritedTraits.push('Noble Heritage');

    // Random fusion abilities based on combined rarity
    const numAbilities = Math.min(3, Math.floor((cat1.rarity + cat2.rarity) / 2) + 1);
    const fusionAbilities = FUSION_ABILITIES
      .sort(() => Math.random() - 0.5)
      .slice(0, numAbilities)
      .map(a => a.name);

    return {
      tokenId: BigInt(Date.now()),
      generation: BigInt(Math.max(Number(cat1.generation), Number(cat2.generation)) + 1),
      birthTime: BigInt(Date.now()),
      lastBreedTime: BigInt(0),
      matronId: cat1.tokenId,
      sireId: cat2.tokenId,
      bodyColor: Math.random() > 0.5 ? cat1.bodyColor : cat2.bodyColor,
      eyeColor: Math.random() > 0.5 ? cat1.eyeColor : cat2.eyeColor,
      pattern: Math.floor(Math.random() * 5),
      accessory: Math.max(cat1.accessory, cat2.accessory),
      background: 2, // Galaxy background for legendary
      isSpecial: true,
      strength: Math.min(150, avgStrength),
      agility: Math.min(150, avgAgility),
      intelligence: Math.min(150, avgIntelligence),
      rarity: RarityLevel.Legendary,
      fusionPower: Math.floor((cat1.strength + cat2.strength + cat1.agility + cat2.agility + cat1.intelligence + cat2.intelligence) / 6 * fusionBonus),
      inheritedTraits,
      fusionAbilities,
    };
  };

  const startFusion = async () => {
    if (!selectedCats[0] || !selectedCats[1]) {
      playError();
      return;
    }

    playClick();
    setIsFusing(true);
    setFusionProgress(0);

    // Dramatic fusion animation
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 50));
      setFusionProgress(i);
    }

    const result = calculateFusionResult();
    setFusedCat(result);
    setIsFusing(false);
    setShowResult(true);
    playSuccess();
  };

  const resetFusion = () => {
    playClick();
    setSelectedCats([null, null]);
    setFusedCat(null);
    setShowResult(false);
    setFusionProgress(0);
  };

  const canFuse = selectedCats[0] && selectedCats[1];
  const combinedPower = selectedCats[0] && selectedCats[1]
    ? Math.floor((selectedCats[0].strength + selectedCats[1].strength + 
        selectedCats[0].agility + selectedCats[1].agility +
        selectedCats[0].intelligence + selectedCats[1].intelligence) / 6 * 1.5)
    : 0;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Cat Fusion</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Combine two cats to create an all-powerful legendary fusion with enhanced stats and unique abilities
          </p>
        </motion.div>

        {/* Fusion Chamber */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="p-6 md:p-8 glass border-primary/20 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
              {isFusing && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-primary/30 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-accent/30 rounded-full"
                  />
                </>
              )}
            </div>

            <div className="relative z-10">
              {/* Fusion Slots */}
              <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
                {/* Cat 1 */}
                <FusionSlot
                  cat={selectedCats[0]}
                  label="Primary"
                  isFusing={isFusing}
                  onClear={() => setSelectedCats([null, selectedCats[1]])}
                />

                {/* Fusion Indicator */}
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={isFusing ? { 
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360]
                    } : {}}
                    transition={{ duration: 1, repeat: isFusing ? Infinity : 0 }}
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center",
                      isFusing ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <Zap className="w-8 h-8" />
                  </motion.div>
                  {canFuse && !isFusing && (
                    <span className="text-xs text-muted-foreground">
                      Power: {combinedPower}
                    </span>
                  )}
                </div>

                {/* Cat 2 */}
                <FusionSlot
                  cat={selectedCats[1]}
                  label="Secondary"
                  isFusing={isFusing}
                  onClear={() => setSelectedCats([selectedCats[0], null])}
                />
              </div>

              {/* Progress Bar */}
              <AnimatePresence>
                {isFusing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="text-center mb-2">
                      <span className="text-sm text-primary font-medium animate-pulse">
                        Fusion in progress... {fusionProgress}%
                      </span>
                    </div>
                    <Progress value={fusionProgress} className="h-3" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Warning */}
              {canFuse && !isFusing && !showResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 justify-center text-amber-500 text-sm mb-4"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Warning: Both cats will be consumed in the fusion process</span>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-4">
                {!showResult ? (
                  <>
                    <Button
                      size="lg"
                      onClick={startFusion}
                      disabled={!canFuse || isFusing}
                      className="btn-glow gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      {isFusing ? 'Fusing...' : 'Begin Fusion'}
                    </Button>
                    {(selectedCats[0] || selectedCats[1]) && !isFusing && (
                      <Button variant="outline" size="lg" onClick={resetFusion}>
                        Clear Selection
                      </Button>
                    )}
                  </>
                ) : (
                  <Button size="lg" onClick={resetFusion} className="gap-2">
                    <Sparkles className="w-5 h-5" />
                    Create Another Fusion
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Fusion Result */}
        <AnimatePresence>
          {showResult && fusedCat && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-8"
            >
              <Card className="p-6 md:p-8 border-2 border-primary glass overflow-hidden relative">
                {/* Celebration Effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: '50%', 
                        y: '50%', 
                        scale: 0,
                        opacity: 1 
                      }}
                      animate={{ 
                        x: `${Math.random() * 100}%`, 
                        y: `${Math.random() * 100}%`,
                        scale: Math.random() * 2 + 1,
                        opacity: 0
                      }}
                      transition={{ 
                        duration: 2 + Math.random(),
                        delay: Math.random() * 0.5,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="absolute w-2 h-2 bg-primary rounded-full"
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <Badge className="mb-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black">
                      LEGENDARY FUSION
                    </Badge>
                    <h2 className="text-2xl font-display font-bold gradient-text">
                      Fusion Complete!
                    </h2>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Fused Cat Avatar */}
                    <div className="relative">
                      <motion.div
                        animate={{ 
                          boxShadow: [
                            '0 0 20px rgba(var(--primary), 0.3)',
                            '0 0 40px rgba(var(--primary), 0.6)',
                            '0 0 20px rgba(var(--primary), 0.3)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-48 h-48 rounded-2xl overflow-hidden"
                      >
                        <CatAvatar 
                          kitty={fusedCat} 
                          size="xl"
                          showEffects 
                          evolutionStage={4}
                        />
                      </motion.div>
                    </div>

                    {/* Stats & Abilities */}
                    <div className="flex-1 space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <StatDisplay 
                          label="Strength" 
                          value={fusedCat.strength} 
                          max={150}
                          color="text-red-400"
                        />
                        <StatDisplay 
                          label="Agility" 
                          value={fusedCat.agility} 
                          max={150}
                          color="text-green-400"
                        />
                        <StatDisplay 
                          label="Intelligence" 
                          value={fusedCat.intelligence} 
                          max={150}
                          color="text-blue-400"
                        />
                      </div>

                      {/* Inherited Traits */}
                      {fusedCat.inheritedTraits.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Inherited Traits</h4>
                          <div className="flex flex-wrap gap-2">
                            {fusedCat.inheritedTraits.map(trait => (
                              <Badge key={trait} variant="secondary">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fusion Abilities */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Fusion Abilities</h4>
                        <div className="grid gap-2">
                          {fusedCat.fusionAbilities.map(abilityName => {
                            const ability = FUSION_ABILITIES.find(a => a.name === abilityName);
                            return (
                              <div 
                                key={abilityName}
                                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                              >
                                <Sparkles className={cn(
                                  "w-4 h-4",
                                  ability?.tier === 'legendary' ? "text-amber-400" : "text-purple-400"
                                )} />
                                <span className="font-medium text-sm">{abilityName}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {ability?.description}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cat Selection */}
        {!showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-display font-semibold mb-4">
              Select Cats to Fuse
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {myKitties.map(cat => {
                const isSelected = selectedCats[0]?.tokenId === cat.tokenId || 
                                   selectedCats[1]?.tokenId === cat.tokenId;
                return (
                  <motion.div
                    key={cat.tokenId.toString()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => !isFusing && selectCat(cat)}
                      className={cn(
                        "p-3 cursor-pointer transition-all border-2",
                        isSelected 
                          ? "border-primary bg-primary/10 shadow-kawaii" 
                          : "border-transparent hover:border-primary/50",
                        isFusing && "opacity-50 pointer-events-none"
                      )}
                    >
                      <div className="relative">
                        <CatAvatar kitty={cat} size="lg" />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </motion.div>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-xs text-muted-foreground">
                          #{cat.tokenId.toString()}
                        </span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1.5"
                          >
                            {RARITY_NAMES[cat.rarity]}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Fusion slot component
function FusionSlot({ 
  cat, 
  label, 
  isFusing,
  onClear 
}: { 
  cat: Kitty | null; 
  label: string;
  isFusing: boolean;
  onClear: () => void;
}) {
  return (
    <motion.div
      animate={isFusing && cat ? {
        x: label === 'Primary' ? [0, 30, 0] : [0, -30, 0],
        scale: [1, 0.9, 1]
      } : {}}
      transition={{ duration: 0.5, repeat: isFusing ? Infinity : 0 }}
      className="relative"
    >
      <Card className={cn(
        "w-32 h-40 md:w-40 md:h-48 flex flex-col items-center justify-center p-4 border-2 border-dashed transition-all",
        cat ? "border-primary bg-primary/5" : "border-muted-foreground/30"
      )}>
        {cat ? (
          <>
            <CatAvatar kitty={cat} size="lg" />
            <span className="text-xs mt-2 text-muted-foreground">
              #{cat.tokenId.toString()}
            </span>
            <Badge variant="outline" className="text-[10px] mt-1">
              {RARITY_NAMES[cat.rarity]}
            </Badge>
            {!isFusing && (
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
              >
                <X className="w-3 h-3 text-destructive-foreground" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🐱</span>
            </div>
            <span className="text-xs text-muted-foreground">{label} Cat</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// Stat display component
function StatDisplay({ 
  label, 
  value, 
  max, 
  color 
}: { 
  label: string; 
  value: number; 
  max: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <span className={cn("text-2xl font-bold", color)}>{value}</span>
      <div className="text-xs text-muted-foreground">{label}</div>
      <Progress value={(value / max) * 100} className="h-1 mt-1" />
    </div>
  );
}
