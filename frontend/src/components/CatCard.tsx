import { useState } from 'react';
import { motion } from 'framer-motion';
import { Kitty, RARITY_NAMES, RARITY_COLORS, PATTERNS, ACCESSORIES } from '@/lib/web3/types';
import { CatProfileModal } from '@/components/CatProfileModal';
import { CatAvatar } from '@/components/CatAvatar';
import { useEvolution } from '@/hooks/useEvolution';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CatCardProps {
  kitty: Kitty;
  onClick?: () => void;
  selected?: boolean;
  showStats?: boolean;
  showEvolution?: boolean;
  disableModal?: boolean;
}

export function CatCard({ kitty, onClick, selected, showStats = true, showEvolution = true, disableModal = false }: CatCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { getCatEvolution } = useEvolution();
  const evolution = getCatEvolution(kitty.tokenId);
  
  const rarityClass = RARITY_COLORS[kitty.rarity];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!disableModal) {
      setModalOpen(true);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, rotateY: 5, rotateX: 2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={cn(
          "kawaii-card cursor-pointer transition-all duration-300 p-4",
          selected && "ring-2 ring-primary shadow-glow",
          kitty.rarity === 4 && "holographic"
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Cat Visual with realistic avatar */}
        <div 
          className="relative aspect-square rounded-xl mb-3 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, hsl(var(--muted)/0.5), hsl(var(--muted)/0.2))` }}
        >
          <CatAvatar 
            kitty={kitty} 
            size="lg" 
            showEffects={kitty.rarity >= 3}
            evolutionStage={evolution.evolutionStage}
          />

          {/* Special indicator */}
          {kitty.isSpecial && (
            <div className="absolute top-2 right-2 text-lg sparkle">⭐</div>
          )}
          
          {/* Level badge */}
          {showEvolution && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-kawaii-purple text-white text-[10px] font-bold">
              Lv.{evolution.level}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-foreground">
              DigiCat #{kitty.tokenId.toString()}
            </span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", rarityClass)}>
              {RARITY_NAMES[kitty.rarity]}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            Gen {kitty.generation.toString()} • {PATTERNS[kitty.pattern]} • {ACCESSORIES[kitty.accessory]}
          </div>

          {/* Evolution XP bar */}
          {showEvolution && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{evolution.title}</span>
                <span>{evolution.abilities.length} abilities</span>
              </div>
              <Progress value={(evolution.xp / evolution.xpToNextLevel) * 100} className="h-1.5" />
            </div>
          )}

          {showStats && (
            <div className="space-y-1.5 pt-2">
              <StatBar label="STR" value={kitty.strength} color="bg-kawaii-coral" />
              <StatBar label="AGI" value={kitty.agility} color="bg-kawaii-blue" />
              <StatBar label="INT" value={kitty.intelligence} color="bg-kawaii-purple" />
            </div>
          )}
        </div>
      </motion.div>
      
      <CatProfileModal 
        kitty={kitty} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-medium w-6 text-muted-foreground">{label}</span>
      <div className="stat-bar flex-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("stat-bar-fill", color)}
        />
      </div>
      <span className="text-[10px] font-medium w-6 text-right text-muted-foreground">{value}</span>
    </div>
  );
}
