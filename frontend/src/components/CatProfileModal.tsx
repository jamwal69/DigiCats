import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Heart, Clock, Trophy, Dna, Star, TrendingUp } from 'lucide-react';
import { Kitty, RARITY_NAMES, RARITY_COLORS, BODY_COLORS, EYE_COLORS, PATTERNS, ACCESSORIES } from '@/lib/web3/types';
import { Button } from '@/components/ui/button';
import { CatAvatar } from '@/components/CatAvatar';
import { EvolutionPanel } from '@/components/EvolutionPanel';
import { useEvolution } from '@/hooks/useEvolution';
import { cn } from '@/lib/utils';

interface CatProfileModalProps {
  kitty: Kitty | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CatProfileModal({ kitty, isOpen, onClose }: CatProfileModalProps) {
  const { getCatEvolution } = useEvolution();
  
  if (!kitty) return null;

  const evolution = getCatEvolution(kitty.tokenId);
  const rarityClass = RARITY_COLORS[kitty.rarity];
  const bodyColor = BODY_COLORS[kitty.bodyColor];
  const eyeColor = EYE_COLORS[kitty.eyeColor];

  // Mock breeding history
  const breedingHistory = [
    { partner: kitty.matronId.toString() !== '0' ? `#${kitty.matronId}` : 'Gen 0', offspring: `#${Number(kitty.tokenId) + 10}`, date: '2 days ago' },
    { partner: kitty.sireId.toString() !== '0' ? `#${kitty.sireId}` : 'Gen 0', offspring: `#${Number(kitty.tokenId) + 15}`, date: '5 days ago' },
  ];

  // Mock battle record
  const battleRecord = {
    wins: Math.floor(Math.random() * 20) + 5,
    losses: Math.floor(Math.random() * 10),
    streak: Math.floor(Math.random() * 5),
  };

  const totalStats = kitty.strength + kitty.agility + kitty.intelligence;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "kawaii-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6",
              kitty.rarity === 4 && "holographic"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                  DigiCat #{kitty.tokenId.toString()}
                  {kitty.isSpecial && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", rarityClass)}>
                    {RARITY_NAMES[kitty.rarity]}
                  </span>
                  <span className="text-sm text-muted-foreground">Gen {kitty.generation.toString()}</span>
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-kawaii-purple text-white text-xs font-bold">
                    Lv.{evolution.level} {evolution.title}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cat Visual - Now with realistic avatar */}
              <div className="space-y-4">
                <div 
                  className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${bodyColor}30, ${bodyColor}10)` }}
                >
                  <CatAvatar 
                    kitty={kitty} 
                    size="xl" 
                    showEffects={true}
                    evolutionStage={evolution.evolutionStage}
                  />
                </div>
                
                {/* Quick Abilities Preview */}
                <div className="flex flex-wrap gap-1">
                  {evolution.abilities.slice(0, 6).map((ability) => (
                    <div
                      key={ability.id}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg"
                      title={`${ability.name}: ${ability.description}`}
                    >
                      {ability.icon}
                    </div>
                  ))}
                  {evolution.abilities.length > 6 && (
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                      +{evolution.abilities.length - 6}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats & Info */}
              <div className="space-y-4">
                {/* Battle Stats */}
                <div className="space-y-3">
                  <h3 className="font-display font-semibold flex items-center gap-2">
                    <Swords className="w-4 h-4 text-primary" /> Battle Stats
                  </h3>
                  <div className="space-y-2">
                    <StatBar label="Strength" value={kitty.strength} color="bg-kawaii-coral" />
                    <StatBar label="Agility" value={kitty.agility} color="bg-kawaii-blue" />
                    <StatBar label="Intelligence" value={kitty.intelligence} color="bg-kawaii-purple" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Power: <span className="text-foreground font-semibold">{totalStats}</span>
                    {evolution.abilities.length > 0 && (
                      <span className="text-kawaii-green ml-2">
                        (+{evolution.abilities.filter(a => a.effect.bonus).reduce((sum, a) => sum + (a.effect.bonus || 0), 0)} from abilities)
                      </span>
                    )}
                  </div>
                </div>

                {/* Traits */}
                <div className="space-y-2">
                  <h3 className="font-display font-semibold flex items-center gap-2">
                    <Dna className="w-4 h-4 text-primary" /> Genetic Traits
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="glass rounded-lg p-2">
                      <span className="text-muted-foreground">Body</span>
                      <div className="font-medium flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: bodyColor }} />
                        Color {kitty.bodyColor + 1}
                      </div>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <span className="text-muted-foreground">Eyes</span>
                      <div className="font-medium flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: eyeColor }} />
                        Color {kitty.eyeColor + 1}
                      </div>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <span className="text-muted-foreground">Pattern</span>
                      <div className="font-medium">{PATTERNS[kitty.pattern]}</div>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <span className="text-muted-foreground">Accessory</span>
                      <div className="font-medium">{ACCESSORIES[kitty.accessory]}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evolution & Abilities Section */}
            <div className="mt-6">
              <EvolutionPanel kitty={kitty} />
            </div>

            {/* Battle Record */}
            <div className="mt-6 space-y-3">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Battle Record
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-green-500">{battleRecord.wins}</div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-red-400">{battleRecord.losses}</div>
                  <div className="text-xs text-muted-foreground">Losses</div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-primary">{battleRecord.streak}</div>
                  <div className="text-xs text-muted-foreground">Win Streak</div>
                </div>
              </div>
            </div>

            {/* Breeding History */}
            <div className="mt-6 space-y-3">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" /> Breeding History
              </h3>
              {kitty.generation.toString() === '0' ? (
                <div className="text-sm text-muted-foreground">This is a Genesis cat (Gen 0)</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Parents:</span>
                    <span className="font-medium">#{kitty.matronId.toString()}</span>
                    <span className="text-muted-foreground">×</span>
                    <span className="font-medium">#{kitty.sireId.toString()}</span>
                  </div>
                </div>
              )}
              {breedingHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Recent breeds:</div>
                  {breedingHistory.map((breed, i) => (
                    <div key={i} className="glass rounded-lg p-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>Bred with {breed.partner}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-primary font-medium">Offspring {breed.offspring}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {breed.date}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <Button className="flex-1 btn-glow">
                <Swords className="w-4 h-4 mr-2" /> Battle
              </Button>
              <Button variant="outline" className="flex-1">
                <Heart className="w-4 h-4 mr-2" /> Breed
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium w-20 text-muted-foreground">{label}</span>
      <div className="stat-bar flex-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("stat-bar-fill", color)}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right">{value}</span>
    </div>
  );
}
