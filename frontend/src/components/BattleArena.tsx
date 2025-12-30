import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Zap, Heart, Skull, Trophy, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Kitty, BODY_COLORS, EYE_COLORS, RARITY_NAMES, RARITY_COLORS } from '@/lib/web3/types';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface BattleArenaProps {
  playerCat: Kitty;
  opponentCat: Kitty;
  onBattleEnd?: (won: boolean) => void;
}

interface BattleState {
  playerHealth: number;
  opponentHealth: number;
  turn: 'player' | 'opponent';
  phase: 'ready' | 'battling' | 'ended';
  winner: 'player' | 'opponent' | null;
  log: string[];
}

interface AttackEffect {
  id: number;
  type: 'hit' | 'critical' | 'miss' | 'buff';
  target: 'player' | 'opponent';
  value?: number;
}

const MAX_HEALTH = 100;

export const BattleArena = ({ playerCat, opponentCat, onBattleEnd }: BattleArenaProps) => {
  const { playAttack, playDamage, playVictory, playError } = useSoundEffects();
  
  const [battleState, setBattleState] = useState<BattleState>({
    playerHealth: MAX_HEALTH,
    opponentHealth: MAX_HEALTH,
    turn: 'player',
    phase: 'ready',
    winner: null,
    log: [],
  });

  const [effects, setEffects] = useState<AttackEffect[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const addEffect = (effect: Omit<AttackEffect, 'id'>) => {
    const id = Date.now();
    setEffects(prev => [...prev, { ...effect, id }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 1000);
  };

  const calculateDamage = (attacker: Kitty, defender: Kitty) => {
    const baseDamage = attacker.strength * 0.8 + attacker.agility * 0.3;
    const defense = defender.agility * 0.2 + defender.intelligence * 0.1;
    const variance = Math.random() * 10 - 5;
    const isCritical = Math.random() < 0.15;
    const isMiss = Math.random() < 0.1;

    if (isMiss) return { damage: 0, isCritical: false, isMiss: true };
    
    let damage = Math.max(5, Math.floor(baseDamage - defense + variance));
    if (isCritical) damage = Math.floor(damage * 1.5);
    
    return { damage, isCritical, isMiss: false };
  };

  const executeAttack = useCallback(async (attacker: 'player' | 'opponent') => {
    if (isAnimating || battleState.phase === 'ended') return;
    
    setIsAnimating(true);
    
    const attackerCat = attacker === 'player' ? playerCat : opponentCat;
    const defenderCat = attacker === 'player' ? opponentCat : playerCat;
    const target = attacker === 'player' ? 'opponent' : 'player';
    
    playAttack();

    await new Promise(r => setTimeout(r, 300));

    const { damage, isCritical, isMiss } = calculateDamage(attackerCat, defenderCat);

    if (isMiss) {
      addEffect({ type: 'miss', target });
      playError();
      setBattleState(prev => ({
        ...prev,
        log: [...prev.log, `${attacker === 'player' ? 'Your cat' : 'Enemy'} missed!`],
      }));
    } else {
      addEffect({ type: isCritical ? 'critical' : 'hit', target, value: damage });
      playDamage();
      
      setBattleState(prev => {
        const newHealth = target === 'player' 
          ? Math.max(0, prev.playerHealth - damage)
          : Math.max(0, prev.opponentHealth - damage);
        
        const healthKey = target === 'player' ? 'playerHealth' : 'opponentHealth';
        const critText = isCritical ? ' CRITICAL!' : '';
        
        return {
          ...prev,
          [healthKey]: newHealth,
          log: [...prev.log, `${attacker === 'player' ? 'Your cat' : 'Enemy'} deals ${damage} damage!${critText}`],
        };
      });
    }

    await new Promise(r => setTimeout(r, 500));
    
    setBattleState(prev => {
      if (prev.playerHealth <= 0 || prev.opponentHealth <= 0) {
        const winner = prev.playerHealth > 0 ? 'player' : 'opponent';
        return { ...prev, phase: 'ended', winner };
      }
      return { ...prev, turn: attacker === 'player' ? 'opponent' : 'player' };
    });

    setIsAnimating(false);
  }, [isAnimating, battleState.phase, playerCat, opponentCat, playAttack, playDamage, playError]);

  // Auto-battle opponent turns
  useEffect(() => {
    if (battleState.phase === 'battling' && battleState.turn === 'opponent' && !isAnimating) {
      const timer = setTimeout(() => executeAttack('opponent'), 1000);
      return () => clearTimeout(timer);
    }
  }, [battleState.phase, battleState.turn, isAnimating, executeAttack]);

  // Handle battle end
  useEffect(() => {
    if (battleState.phase === 'ended' && battleState.winner) {
      if (battleState.winner === 'player') {
        playVictory();
      } else {
        playError();
      }
      onBattleEnd?.(battleState.winner === 'player');
    }
  }, [battleState.phase, battleState.winner, onBattleEnd, playVictory, playError]);

  const startBattle = () => {
    setBattleState(prev => ({ ...prev, phase: 'battling', log: ['Battle started!'] }));
  };

  const resetBattle = () => {
    setBattleState({
      playerHealth: MAX_HEALTH,
      opponentHealth: MAX_HEALTH,
      turn: 'player',
      phase: 'ready',
      winner: null,
      log: [],
    });
    setEffects([]);
  };

  const CatFighter = ({ cat, isPlayer, health }: { cat: Kitty; isPlayer: boolean; health: number }) => (
    <div className={`relative ${isPlayer ? '' : 'scale-x-[-1]'}`}>
      <motion.div
        animate={
          isAnimating && battleState.turn === (isPlayer ? 'player' : 'opponent')
            ? { x: [0, isPlayer ? 50 : -50, 0] }
            : {}
        }
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Cat SVG */}
        <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-40 md:h-40">
          <ellipse cx="50" cy="65" rx="35" ry="30" fill={BODY_COLORS[cat.bodyColor]} />
          <circle cx="50" cy="35" r="25" fill={BODY_COLORS[cat.bodyColor]} />
          <polygon points="30,20 35,40 25,40" fill={BODY_COLORS[cat.bodyColor]} />
          <polygon points="70,20 75,40 65,40" fill={BODY_COLORS[cat.bodyColor]} />
          <ellipse cx="40" cy="35" rx="8" ry="10" fill="white" />
          <ellipse cx="60" cy="35" rx="8" ry="10" fill="white" />
          <circle cx="40" cy="35" r="5" fill={EYE_COLORS[cat.eyeColor]} />
          <circle cx="60" cy="35" r="5" fill={EYE_COLORS[cat.eyeColor]} />
          <circle cx="42" cy="33" r="2" fill="white" />
          <circle cx="62" cy="33" r="2" fill="white" />
          <ellipse cx="50" cy="45" rx="3" ry="2" fill="#FFB6C1" />
        </svg>

        {/* Health Bar */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[150px]">
          <div className="flex items-center gap-1 mb-1">
            <Heart className="w-3 h-3 text-red-500" />
            <span className="text-xs font-bold">{health}/{MAX_HEALTH}</span>
          </div>
          <Progress 
            value={health} 
            className="h-3"
            style={{
              '--progress-background': health > 50 ? 'hsl(142, 76%, 36%)' : health > 25 ? 'hsl(45, 93%, 47%)' : 'hsl(0, 84%, 60%)',
            } as React.CSSProperties}
          />
        </div>
      </motion.div>

      {/* Attack Effects */}
      <AnimatePresence>
        {effects.filter(e => e.target === (isPlayer ? 'player' : 'opponent')).map(effect => (
          <motion.div
            key={effect.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -60 }}
            className={`absolute top-0 left-1/2 -translate-x-1/2 font-display font-bold text-2xl
              ${effect.type === 'critical' ? 'text-kawaii-yellow' : ''}
              ${effect.type === 'hit' ? 'text-red-500' : ''}
              ${effect.type === 'miss' ? 'text-muted-foreground' : ''}
            `}
          >
            {effect.type === 'miss' ? 'MISS!' : effect.type === 'critical' ? `💥 ${effect.value}!` : `-${effect.value}`}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <Card className="kawaii-card overflow-hidden">
      <CardContent className="p-6">
        {/* Battle Arena */}
        <div className="relative bg-gradient-to-b from-primary/5 to-kawaii-purple/5 rounded-xl p-6 mb-6">
          {/* VS Banner */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-gradient-to-r from-primary to-kawaii-purple text-white px-4 py-1 rounded-full font-display font-bold"
            >
              <Swords className="w-4 h-4 inline mr-1" /> VS
            </motion.div>
          </div>

          {/* Fighters */}
          <div className="flex items-center justify-between pt-8 pb-12">
            <div className="text-center">
              <CatFighter cat={playerCat} isPlayer={true} health={battleState.playerHealth} />
              <div className="mt-8">
                <p className="font-display font-bold">Your Cat</p>
                <p className={`text-xs ${RARITY_COLORS[playerCat.rarity]}`}>{RARITY_NAMES[playerCat.rarity]}</p>
              </div>
            </div>

            <div className="text-center">
              <CatFighter cat={opponentCat} isPlayer={false} health={battleState.opponentHealth} />
              <div className="mt-8">
                <p className="font-display font-bold">Opponent</p>
                <p className={`text-xs ${RARITY_COLORS[opponentCat.rarity]}`}>{RARITY_NAMES[opponentCat.rarity]}</p>
              </div>
            </div>
          </div>

          {/* Winner Overlay */}
          <AnimatePresence>
            {battleState.phase === 'ended' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl"
              >
                <div className="text-center">
                  {battleState.winner === 'player' ? (
                    <>
                      <Trophy className="w-16 h-16 text-kawaii-yellow mx-auto mb-4" />
                      <h3 className="font-display text-3xl font-bold text-kawaii-yellow">Victory!</h3>
                      <p className="text-muted-foreground">You won the battle!</p>
                    </>
                  ) : (
                    <>
                      <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="font-display text-3xl font-bold text-red-500">Defeat</h3>
                      <p className="text-muted-foreground">Better luck next time!</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {battleState.phase === 'ready' && (
            <Button onClick={startBattle} className="btn-glow">
              <Play className="w-4 h-4 mr-2" /> Start Battle
            </Button>
          )}
          
          {battleState.phase === 'battling' && battleState.turn === 'player' && (
            <>
              <Button 
                onClick={() => executeAttack('player')} 
                disabled={isAnimating}
                className="btn-glow"
              >
                <Swords className="w-4 h-4 mr-2" /> Attack
              </Button>
              <Button variant="outline" disabled={isAnimating}>
                <Shield className="w-4 h-4 mr-2" /> Defend
              </Button>
              <Button variant="outline" disabled={isAnimating}>
                <Zap className="w-4 h-4 mr-2" /> Special
              </Button>
            </>
          )}
          
          {battleState.phase === 'battling' && battleState.turn === 'opponent' && (
            <div className="text-muted-foreground animate-pulse">
              Opponent is attacking...
            </div>
          )}
          
          {battleState.phase === 'ended' && (
            <Button onClick={resetBattle} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" /> Battle Again
            </Button>
          )}
        </div>

        {/* Battle Log */}
        <div className="bg-muted/30 rounded-lg p-3 max-h-32 overflow-y-auto">
          <p className="text-xs text-muted-foreground mb-2">Battle Log</p>
          <div className="space-y-1">
            {battleState.log.slice(-5).map((entry, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm"
              >
                {entry}
              </motion.p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
