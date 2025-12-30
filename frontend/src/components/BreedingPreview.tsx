import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dna, Sparkles, TrendingUp, Zap, Eye, Palette, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Kitty, BODY_COLORS, EYE_COLORS, PATTERNS, RarityLevel, RARITY_NAMES, RARITY_COLORS } from '@/lib/web3/types';

interface TraitProbability {
  trait: string;
  value: string;
  color?: string;
  probability: number;
}

interface BreedingPreviewProps {
  matron: Kitty;
  sire: Kitty;
}

export const BreedingPreview = ({ matron, sire }: BreedingPreviewProps) => {
  const traitProbabilities = useMemo(() => {
    // Body color probabilities
    const bodyColors: TraitProbability[] = [];
    if (matron.bodyColor === sire.bodyColor) {
      bodyColors.push({ trait: 'Body', value: 'Same as parents', color: BODY_COLORS[matron.bodyColor], probability: 85 });
      bodyColors.push({ trait: 'Body', value: 'Mutation', color: BODY_COLORS[(matron.bodyColor + 1) % BODY_COLORS.length], probability: 15 });
    } else {
      bodyColors.push({ trait: 'Body', value: 'Matron color', color: BODY_COLORS[matron.bodyColor], probability: 40 });
      bodyColors.push({ trait: 'Body', value: 'Sire color', color: BODY_COLORS[sire.bodyColor], probability: 40 });
      bodyColors.push({ trait: 'Body', value: 'Blend', color: BODY_COLORS[(matron.bodyColor + sire.bodyColor) % BODY_COLORS.length], probability: 20 });
    }

    // Eye color probabilities
    const eyeColors: TraitProbability[] = [];
    if (matron.eyeColor === sire.eyeColor) {
      eyeColors.push({ trait: 'Eyes', value: 'Same as parents', color: EYE_COLORS[matron.eyeColor], probability: 80 });
      eyeColors.push({ trait: 'Eyes', value: 'Mutation', color: EYE_COLORS[(matron.eyeColor + 2) % EYE_COLORS.length], probability: 20 });
    } else {
      eyeColors.push({ trait: 'Eyes', value: 'Matron eyes', color: EYE_COLORS[matron.eyeColor], probability: 45 });
      eyeColors.push({ trait: 'Eyes', value: 'Sire eyes', color: EYE_COLORS[sire.eyeColor], probability: 45 });
      eyeColors.push({ trait: 'Eyes', value: 'Rare mutation', color: EYE_COLORS[(matron.eyeColor + sire.eyeColor) % EYE_COLORS.length], probability: 10 });
    }

    // Pattern probabilities
    const patterns: TraitProbability[] = [];
    if (matron.pattern === sire.pattern) {
      patterns.push({ trait: 'Pattern', value: PATTERNS[matron.pattern], probability: 75 });
      patterns.push({ trait: 'Pattern', value: PATTERNS[(matron.pattern + 1) % PATTERNS.length], probability: 25 });
    } else {
      patterns.push({ trait: 'Pattern', value: PATTERNS[matron.pattern], probability: 35 });
      patterns.push({ trait: 'Pattern', value: PATTERNS[sire.pattern], probability: 35 });
      patterns.push({ trait: 'Pattern', value: 'Mixed', probability: 30 });
    }

    return { bodyColors, eyeColors, patterns };
  }, [matron, sire]);

  const statPredictions = useMemo(() => {
    const avgStrength = Math.floor((matron.strength + sire.strength) / 2);
    const avgAgility = Math.floor((matron.agility + sire.agility) / 2);
    const avgIntelligence = Math.floor((matron.intelligence + sire.intelligence) / 2);
    const bonus = Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 5 : 0;

    return {
      strength: { min: avgStrength - 10, max: avgStrength + 15 + bonus, avg: avgStrength },
      agility: { min: avgAgility - 10, max: avgAgility + 15 + bonus, avg: avgAgility },
      intelligence: { min: avgIntelligence - 10, max: avgIntelligence + 15 + bonus, avg: avgIntelligence },
    };
  }, [matron, sire]);

  const rarityChances = useMemo(() => {
    const parentRarity = Math.max(matron.rarity, sire.rarity);
    const baseChances = {
      [RarityLevel.Common]: 40,
      [RarityLevel.Uncommon]: 30,
      [RarityLevel.Rare]: 20,
      [RarityLevel.Epic]: 8,
      [RarityLevel.Legendary]: 2,
    };

    // Boost chances based on parent rarity
    if (parentRarity >= RarityLevel.Epic) {
      baseChances[RarityLevel.Epic] += 10;
      baseChances[RarityLevel.Legendary] += 3;
      baseChances[RarityLevel.Common] -= 13;
    } else if (parentRarity >= RarityLevel.Rare) {
      baseChances[RarityLevel.Rare] += 10;
      baseChances[RarityLevel.Epic] += 5;
      baseChances[RarityLevel.Common] -= 15;
    }

    return Object.entries(baseChances).map(([rarity, chance]) => ({
      rarity: Number(rarity) as RarityLevel,
      chance: Math.max(0, chance),
    }));
  }, [matron, sire]);

  const generation = Math.max(Number(matron.generation), Number(sire.generation)) + 1;

  return (
    <Card className="kawaii-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-kawaii-purple/10">
        <CardTitle className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-primary" />
          Offspring Trait Predictions
          <Sparkles className="w-4 h-4 text-kawaii-yellow animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Trait Probabilities */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Body Colors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4 text-primary" />
              Body Color
            </div>
            {traitProbabilities.bodyColors.map((trait, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2"
              >
                <div 
                  className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
                  style={{ background: trait.color }}
                />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{trait.value}</span>
                    <span className="font-medium text-primary">{trait.probability}%</span>
                  </div>
                  <Progress value={trait.probability} className="h-1.5" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Eye Colors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Eye className="w-4 h-4 text-kawaii-blue" />
              Eye Color
            </div>
            {traitProbabilities.eyeColors.map((trait, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className="flex items-center gap-2"
              >
                <div 
                  className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
                  style={{ background: trait.color }}
                />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{trait.value}</span>
                    <span className="font-medium text-kawaii-blue">{trait.probability}%</span>
                  </div>
                  <Progress value={trait.probability} className="h-1.5" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Patterns */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Star className="w-4 h-4 text-kawaii-purple" />
              Pattern
            </div>
            {traitProbabilities.patterns.map((trait, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.4 }}
                className="flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs">
                  {trait.value.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{trait.value}</span>
                    <span className="font-medium text-kawaii-purple">{trait.probability}%</span>
                  </div>
                  <Progress value={trait.probability} className="h-1.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stat Ranges */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4 text-kawaii-green" />
            Predicted Stat Ranges
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(statPredictions).map(([stat, range], i) => (
              <motion.div
                key={stat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.6 }}
                className="p-3 rounded-lg bg-muted/30 text-center"
              >
                <div className="text-xs text-muted-foreground capitalize mb-1">{stat}</div>
                <div className="font-display font-bold text-lg">
                  {range.min} - {range.max}
                </div>
                <div className="text-xs text-primary">avg: {range.avg}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rarity Chances */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm font-medium mb-4">
            <Zap className="w-4 h-4 text-kawaii-yellow" />
            Rarity Chances
          </div>
          <div className="flex flex-wrap gap-2">
            {rarityChances.map(({ rarity, chance }, i) => (
              <motion.div
                key={rarity}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.8 }}
                className={`px-3 py-2 rounded-lg ${RARITY_COLORS[rarity]} text-xs font-medium flex items-center gap-2`}
              >
                <span>{RARITY_NAMES[rarity]}</span>
                <span className="px-1.5 py-0.5 rounded bg-background/20">{chance}%</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Generation Info */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Offspring will be <span className="font-bold text-foreground">Generation {generation}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Higher generation = longer cooldowns
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
