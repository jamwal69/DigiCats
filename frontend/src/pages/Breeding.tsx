import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Clock, Zap, Baby, ArrowRight, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CatCard } from '@/components/CatCard';
import { CatAvatar } from '@/components/CatAvatar';
import { BreedingPreview } from '@/components/BreedingPreview';
import { useMockData } from '@/hooks/useMockData';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useEvolution } from '@/hooks/useEvolution';
import { Kitty, RarityLevel, RARITY_NAMES, RARITY_COLORS, PATTERNS, BODY_COLORS, EYE_COLORS } from '@/lib/web3/types';
import { cn } from '@/lib/utils';

export default function Breeding() {
  const { myKitties, kittyBalance } = useMockData();
  const { playSelect, playBreeding, playClick, playSuccess } = useSoundEffects();
  const { getCatEvolution } = useEvolution();
  const [matron, setMatron] = useState<Kitty | null>(null);
  const [sire, setSire] = useState<Kitty | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);
  const [breedingProgress, setBreedingProgress] = useState(0);
  const [offspring, setOffspring] = useState<Kitty | null>(null);

  const breedingFee = 10; // KITTY tokens
  const canAfford = Number(kittyBalance) / 1e18 >= breedingFee;

  // Check breeding cooldown (24h)
  const getCooldownRemaining = (kitty: Kitty): number => {
    const cooldownEnd = Number(kitty.lastBreedTime) + 24 * 60 * 60 * 1000;
    return Math.max(0, cooldownEnd - Date.now());
  };

  const formatCooldown = (ms: number): string => {
    if (ms <= 0) return 'Ready';
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  const handleSelectMatron = (kitty: Kitty) => {
    playSelect();
    if (matron?.tokenId === kitty.tokenId) {
      setMatron(null);
    } else if (sire?.tokenId === kitty.tokenId) {
      // Swap: if clicking on sire, make it matron
      setSire(matron);
      setMatron(kitty);
    } else {
      setMatron(kitty);
    }
    setOffspring(null);
  };

  const handleSelectSire = (kitty: Kitty) => {
    playSelect();
    if (sire?.tokenId === kitty.tokenId) {
      setSire(null);
    } else if (matron?.tokenId === kitty.tokenId) {
      // Swap: if clicking on matron, make it sire
      setMatron(sire);
      setSire(kitty);
    } else {
      setSire(kitty);
    }
    setOffspring(null);
  };

  // Breeding logic - generates offspring based on parents
  const generateOffspring = (matron: Kitty, sire: Kitty): Kitty => {
    const rand = () => Math.random();
    
    // Inherit traits from parents with some mutation chance
    const inheritTrait = (matronVal: number, sireVal: number, mutationChance: number = 0.1): number => {
      if (rand() < mutationChance) {
        // Mutation - random new value
        return Math.floor(rand() * 8);
      }
      // 50/50 inheritance
      return rand() < 0.5 ? matronVal : sireVal;
    };

    // Stats inherit with some variance
    const inheritStat = (matronVal: number, sireVal: number): number => {
      const avg = (matronVal + sireVal) / 2;
      const variance = (rand() - 0.5) * 30; // ±15 variance
      return Math.min(100, Math.max(1, Math.round(avg + variance)));
    };

    // Rarity calculation based on parents
    const calculateRarity = (): RarityLevel => {
      const parentAvg = (Number(matron.rarity) + Number(sire.rarity)) / 2;
      const roll = rand();
      
      // Higher rarity parents increase chance of rare offspring
      if (roll < 0.02 + parentAvg * 0.02) return RarityLevel.Legendary;
      if (roll < 0.08 + parentAvg * 0.04) return RarityLevel.Epic;
      if (roll < 0.20 + parentAvg * 0.06) return RarityLevel.Rare;
      if (roll < 0.45 + parentAvg * 0.05) return RarityLevel.Uncommon;
      return RarityLevel.Common;
    };

    const newGen = BigInt(Math.max(Number(matron.generation), Number(sire.generation)) + 1);
    const newRarity = calculateRarity();
    const rarityBonus = Number(newRarity) * 5;

    return {
      tokenId: BigInt(1000 + Math.floor(rand() * 9000)),
      generation: newGen,
      birthTime: BigInt(Date.now()),
      lastBreedTime: BigInt(0),
      matronId: matron.tokenId,
      sireId: sire.tokenId,
      bodyColor: inheritTrait(matron.bodyColor, sire.bodyColor, 0.15),
      eyeColor: inheritTrait(matron.eyeColor, sire.eyeColor, 0.1),
      pattern: inheritTrait(matron.pattern, sire.pattern, 0.2),
      accessory: inheritTrait(matron.accessory, sire.accessory, 0.25),
      background: inheritTrait(matron.background, sire.background, 0.1),
      isSpecial: (matron.isSpecial || sire.isSpecial) && rand() < 0.3,
      strength: Math.min(100, inheritStat(matron.strength, sire.strength) + rarityBonus),
      agility: Math.min(100, inheritStat(matron.agility, sire.agility) + rarityBonus),
      intelligence: Math.min(100, inheritStat(matron.intelligence, sire.intelligence) + rarityBonus),
      rarity: newRarity,
    };
  };

  const handleBreed = async () => {
    if (!matron || !sire || !canAfford) return;
    
    playBreeding();
    setIsBreeding(true);
    setBreedingProgress(0);
    
    // Simulate breeding animation
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 50));
      setBreedingProgress(i);
    }
    
    // Generate offspring
    const newKitty = generateOffspring(matron, sire);
    setOffspring(newKitty);
    setIsBreeding(false);
    playSuccess();
  };

  const clearSelection = () => {
    setMatron(null);
    setSire(null);
    setOffspring(null);
  };

  // Available cats that can be selected
  const availableCats = myKitties.filter(k => 
    k.tokenId !== matron?.tokenId && k.tokenId !== sire?.tokenId
  );

  return (
    <div className="min-h-screen pt-24 pb-8 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary" /> Breeding Lab
              </h1>
              <p className="text-muted-foreground">Combine traits to create unique offspring!</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm py-1 px-3">
                <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                {(Number(kittyBalance) / 1e18).toFixed(0)} KITTY
              </Badge>
              {(matron || sire) && (
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>

          {/* Breeding Station */}
          <Card className="kawaii-card mb-8 overflow-hidden">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                {/* Matron Selection */}
                <div className="space-y-3">
                  <h3 className="font-display font-semibold text-center flex items-center justify-center gap-2">
                    <span className="text-pink-500">♀</span> Mother (Matron)
                  </h3>
                  {matron ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                    >
                      <div className="aspect-square max-w-[200px] mx-auto rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-4 flex items-center justify-center">
                        <CatAvatar kitty={matron} size="lg" showEffects evolutionStage={getCatEvolution(matron.tokenId).evolutionStage} />
                      </div>
                      <div className="text-center mt-2">
                        <span className="font-semibold">DigiCat #{matron.tokenId.toString()}</span>
                        <div className="text-xs text-muted-foreground">
                          Gen {matron.generation.toString()} • {RARITY_NAMES[matron.rarity]}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {getCooldownRemaining(matron) > 0 ? (
                            <><Clock className="w-3 h-3 mr-1" /> {formatCooldown(getCooldownRemaining(matron))}</>
                          ) : (
                            <><CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Ready</>
                          )}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background"
                        onClick={() => setMatron(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="aspect-square max-w-[200px] mx-auto rounded-xl border-2 border-dashed border-pink-500/30 flex items-center justify-center bg-pink-500/5">
                      <div className="text-center text-muted-foreground">
                        <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <span className="text-sm">Select a mother</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Breeding Center */}
                <div className="flex flex-col items-center justify-center py-4">
                  <AnimatePresence mode="wait">
                    {isBreeding ? (
                      <motion.div
                        key="breeding"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center space-y-4"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center"
                        >
                          <Sparkles className="w-10 h-10 text-white" />
                        </motion.div>
                        <div className="w-32">
                          <Progress value={breedingProgress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">Breeding...</p>
                        </div>
                      </motion.div>
                    ) : offspring ? (
                      <motion.div
                        key="offspring"
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="text-center space-y-3"
                      >
                        <div className="relative">
                          <motion.div
                            animate={{ boxShadow: ["0 0 20px rgba(168,85,247,0.5)", "0 0 40px rgba(168,85,247,0.8)", "0 0 20px rgba(168,85,247,0.5)"] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center"
                          >
                            <CatAvatar kitty={offspring} size="md" showEffects />
                          </motion.div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="absolute -top-1 -right-1"
                          >
                            <Baby className="w-6 h-6 text-pink-500" />
                          </motion.div>
                        </div>
                        <div>
                          <Badge className={cn("text-xs", RARITY_COLORS[offspring.rarity])}>
                            {RARITY_NAMES[offspring.rarity]}
                          </Badge>
                          <p className="text-sm font-semibold mt-1">New Kitten Born!</p>
                          <p className="text-xs text-muted-foreground">Gen {offspring.generation.toString()}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4"
                        >
                          <Sparkles className="w-8 h-8 text-primary" />
                        </motion.div>
                        <Button 
                          disabled={!matron || !sire || !canAfford || isBreeding} 
                          className="btn-glow"
                          onClick={handleBreed}
                          onMouseDown={playClick}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Breed ({breedingFee} KITTY)
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" /> 24h cooldown after breeding
                        </p>
                        {!canAfford && (
                          <p className="text-xs text-destructive mt-1">Insufficient KITTY tokens</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sire Selection */}
                <div className="space-y-3">
                  <h3 className="font-display font-semibold text-center flex items-center justify-center gap-2">
                    <span className="text-blue-500">♂</span> Father (Sire)
                  </h3>
                  {sire ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                    >
                      <div className="aspect-square max-w-[200px] mx-auto rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 flex items-center justify-center">
                        <CatAvatar kitty={sire} size="lg" showEffects evolutionStage={getCatEvolution(sire.tokenId).evolutionStage} />
                      </div>
                      <div className="text-center mt-2">
                        <span className="font-semibold">DigiCat #{sire.tokenId.toString()}</span>
                        <div className="text-xs text-muted-foreground">
                          Gen {sire.generation.toString()} • {RARITY_NAMES[sire.rarity]}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {getCooldownRemaining(sire) > 0 ? (
                            <><Clock className="w-3 h-3 mr-1" /> {formatCooldown(getCooldownRemaining(sire))}</>
                          ) : (
                            <><CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Ready</>
                          )}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background"
                        onClick={() => setSire(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="aspect-square max-w-[200px] mx-auto rounded-xl border-2 border-dashed border-blue-500/30 flex items-center justify-center bg-blue-500/5">
                      <div className="text-center text-muted-foreground">
                        <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <span className="text-sm">Select a father</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breeding Preview */}
          {matron && sire && !offspring && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <BreedingPreview matron={matron} sire={sire} />
            </motion.div>
          )}

          {/* Offspring Details */}
          {offspring && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="kawaii-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="w-5 h-5 text-pink-500" />
                    Your New Kitten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <CatAvatar kitty={offspring} size="xl" showEffects />
                      </motion.div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg">DigiCat #{offspring.tokenId.toString()}</h4>
                        <Badge className={cn("mt-1", RARITY_COLORS[offspring.rarity])}>
                          {RARITY_NAMES[offspring.rarity]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Generation:</span>
                          <span className="ml-2 font-medium">{offspring.generation.toString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pattern:</span>
                          <span className="ml-2 font-medium">{PATTERNS[offspring.pattern]}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Body:</span>
                          <span className="ml-2 font-medium" style={{ color: BODY_COLORS[offspring.bodyColor] }}>■</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Eyes:</span>
                          <span className="ml-2 font-medium" style={{ color: EYE_COLORS[offspring.eyeColor] }}>●</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Inherited Stats</h5>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-lg bg-red-500/10">
                            <div className="text-lg font-bold text-red-500">{offspring.strength}</div>
                            <div className="text-xs text-muted-foreground">STR</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-blue-500/10">
                            <div className="text-lg font-bold text-blue-500">{offspring.agility}</div>
                            <div className="text-xs text-muted-foreground">AGI</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-purple-500/10">
                            <div className="text-lg font-bold text-purple-500">{offspring.intelligence}</div>
                            <div className="text-xs text-muted-foreground">INT</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <ArrowRight className="w-3 h-3" />
                        Parents: #{matron?.tokenId.toString()} × #{sire?.tokenId.toString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Cat Selection Grid */}
          <Card className="kawaii-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Cats ({myKitties.length})</span>
                <div className="flex gap-2 text-sm font-normal">
                  <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30">
                    Click to select Matron
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30">
                    Shift+Click to select Sire
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {myKitties.map(kitty => {
                  const isMatron = matron?.tokenId === kitty.tokenId;
                  const isSire = sire?.tokenId === kitty.tokenId;
                  const evolution = getCatEvolution(kitty.tokenId);
                  const cooldown = getCooldownRemaining(kitty);
                  
                  return (
                    <motion.div
                      key={kitty.tokenId.toString()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        if (e.shiftKey) {
                          handleSelectSire(kitty);
                        } else {
                          handleSelectMatron(kitty);
                        }
                      }}
                      className={cn(
                        "kawaii-card cursor-pointer p-3 transition-all relative",
                        isMatron && "ring-2 ring-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]",
                        isSire && "ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                        !isMatron && !isSire && "hover:ring-1 hover:ring-primary/50"
                      )}
                    >
                      {/* Role Badge */}
                      {(isMatron || isSire) && (
                        <div className={cn(
                          "absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                          isMatron ? "bg-pink-500" : "bg-blue-500"
                        )}>
                          {isMatron ? "♀" : "♂"}
                        </div>
                      )}
                      
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center mb-2 overflow-hidden">
                        <CatAvatar 
                          kitty={kitty} 
                          size="md" 
                          showEffects={kitty.rarity >= 3}
                          evolutionStage={evolution.evolutionStage}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">#{kitty.tokenId.toString()}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                            Lv.{evolution.level}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={cn("text-[10px] px-1", RARITY_COLORS[kitty.rarity])}>
                            {RARITY_NAMES[kitty.rarity]}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            Gen{kitty.generation.toString()}
                          </span>
                        </div>
                        {cooldown > 0 && (
                          <div className="text-[10px] text-yellow-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatCooldown(cooldown)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
