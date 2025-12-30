import { motion } from 'framer-motion';
import { Sparkles, Zap, Lock, Star, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Kitty } from '@/lib/web3/types';
import { useEvolution, getAbilityTypeColor, Ability } from '@/hooks/useEvolution';
import { cn } from '@/lib/utils';

interface EvolutionPanelProps {
  kitty: Kitty;
  compact?: boolean;
}

export const EvolutionPanel = ({ kitty, compact = false }: EvolutionPanelProps) => {
  const { getCatEvolution, getNextAbility, allAbilities } = useEvolution();
  const evolution = getCatEvolution(kitty.tokenId);
  const nextAbility = getNextAbility(evolution.level);
  
  const xpProgress = (evolution.xp / evolution.xpToNextLevel) * 100;

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Level Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-primary to-kawaii-purple text-white text-xs font-bold">
              Lv. {evolution.level}
            </div>
            <span className="text-sm text-muted-foreground">{evolution.title}</span>
          </div>
          <span className="text-xs text-muted-foreground">{evolution.abilities.length} abilities</span>
        </div>
        
        {/* XP Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>XP</span>
            <span>{evolution.xp} / {evolution.xpToNextLevel}</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>
      </div>
    );
  }

  return (
    <Card className="kawaii-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Evolution & Abilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level & XP Section */}
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-kawaii-purple/10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 mb-3"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-kawaii-purple flex items-center justify-center text-white">
              <span className="font-display text-2xl font-bold">{evolution.level}</span>
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-lg">{evolution.title}</p>
              <p className="text-sm text-muted-foreground">Stage {evolution.evolutionStage + 1}/5</p>
            </div>
          </motion.div>
          
          <div className="space-y-2 max-w-xs mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Experience</span>
              <span className="font-medium">{evolution.xp} / {evolution.xpToNextLevel} XP</span>
            </div>
            <Progress value={xpProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Total: {evolution.totalXp.toLocaleString()} XP earned
            </p>
          </div>
        </div>

        {/* Unlocked Abilities */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-kawaii-yellow" />
            Unlocked Abilities ({evolution.abilities.length})
          </h4>
          <div className="grid gap-2">
            {evolution.abilities.map((ability, i) => (
              <AbilityCard key={ability.id} ability={ability} index={i} unlocked />
            ))}
          </div>
        </div>

        {/* Next Ability Preview */}
        {nextAbility && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Next Unlock (Level {nextAbility.unlockLevel})
            </h4>
            <AbilityCard ability={nextAbility} index={0} unlocked={false} />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {nextAbility.unlockLevel - evolution.level} more level{nextAbility.unlockLevel - evolution.level > 1 ? 's' : ''} to unlock!
            </p>
          </div>
        )}

        {/* All Abilities Preview */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-kawaii-purple" />
            All Abilities ({allAbilities.length} total)
          </h4>
          <div className="flex flex-wrap gap-1">
            {allAbilities.map((ability) => {
              const isUnlocked = ability.unlockLevel <= evolution.level;
              return (
                <div
                  key={ability.id}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                    isUnlocked ? "bg-muted" : "bg-muted/30 opacity-40"
                  )}
                  title={`${ability.name} (Lv. ${ability.unlockLevel})`}
                >
                  {isUnlocked ? ability.icon : '🔒'}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AbilityCard = ({ ability, index, unlocked }: { ability: Ability; index: number; unlocked: boolean }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className={cn(
      "flex items-center gap-3 p-3 rounded-lg border transition-all",
      unlocked ? getAbilityTypeColor(ability.type) : "bg-muted/20 border-muted opacity-60"
    )}
  >
    <span className="text-2xl">{ability.icon}</span>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">{ability.name}</span>
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
          ability.type === 'passive' && "bg-kawaii-green/30 text-kawaii-green",
          ability.type === 'active' && "bg-kawaii-blue/30 text-kawaii-blue",
          ability.type === 'ultimate' && "bg-kawaii-purple/30 text-kawaii-purple"
        )}>
          {ability.type}
        </span>
      </div>
      <p className="text-xs text-muted-foreground truncate">{ability.description}</p>
    </div>
    {unlocked && <Sparkles className="w-4 h-4 text-kawaii-yellow flex-shrink-0" />}
  </motion.div>
);
