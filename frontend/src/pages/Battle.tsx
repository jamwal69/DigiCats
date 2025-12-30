import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatCard } from '@/components/CatCard';
import { BattleArena } from '@/components/BattleArena';
import { useMockData } from '@/hooks/useMockData';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Kitty } from '@/lib/web3/types';
import { formatEther } from 'viem';

export default function Battle() {
  const { myKitties, activeBattles } = useMockData();
  const { playSelect, playClick } = useSoundEffects();
  const [selectedCat, setSelectedCat] = useState<Kitty | null>(null);
  const [opponent, setOpponent] = useState<Kitty | null>(null);
  const [inBattle, setInBattle] = useState(false);

  const handleSelectCat = (kitty: Kitty) => {
    playSelect();
    setSelectedCat(kitty);
  };

  const startQuickBattle = () => {
    playClick();
    // Pick a random opponent from mock data
    const opponents = myKitties.filter(k => k.tokenId !== selectedCat?.tokenId);
    const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
    setOpponent(randomOpponent);
    setInBattle(true);
  };

  const handleBattleEnd = (won: boolean) => {
    console.log('Battle ended, won:', won);
    // Could add rewards logic here
  };

  const exitBattle = () => {
    setInBattle(false);
    setOpponent(null);
  };

  // Show battle arena when in battle
  if (inBattle && selectedCat && opponent) {
    return (
      <div className="min-h-screen pt-24 pb-8 px-4" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Swords className="w-6 h-6 text-primary" /> Battle Arena
            </h1>
            <Button variant="outline" onClick={exitBattle}>Exit Battle</Button>
          </div>
          <BattleArena 
            playerCat={selectedCat} 
            opponentCat={opponent} 
            onBattleEnd={handleBattleEnd}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Swords className="w-8 h-8 text-primary" /> Battle Arena
          </h1>
          <p className="text-muted-foreground mb-8">Challenge other players and prove your cats are the strongest!</p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Select Cat */}
            <div className="lg:col-span-2">
              <Card className="kawaii-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> Select Your Fighter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {myKitties.map(kitty => (
                      <div key={kitty.tokenId.toString()} onClick={() => handleSelectCat(kitty)}>
                        <CatCard kitty={kitty} selected={selectedCat?.tokenId === kitty.tokenId} showStats={false} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Battle Actions */}
            <div className="space-y-4">
              <Card className="kawaii-card">
                <CardHeader>
                  <CardTitle>Create Battle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedCat ? (
                    <>
                      <div className="text-center p-4 rounded-xl bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Selected Fighter</p>
                        <p className="font-display font-bold">DigiCat #{selectedCat.tokenId.toString()}</p>
                        <div className="flex justify-center gap-4 mt-2 text-xs">
                          <span>STR: {selectedCat.strength}</span>
                          <span>AGI: {selectedCat.agility}</span>
                          <span>INT: {selectedCat.intelligence}</span>
                        </div>
                      </div>
                      <Button className="w-full btn-glow" onClick={startQuickBattle}>
                        Quick Battle (Demo)
                      </Button>
                      <Button className="w-full" variant="outline" onMouseDown={playClick}>
                        Create Battle (0.01 ETH)
                      </Button>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Select a cat to battle</p>
                  )}
                </CardContent>
              </Card>

              {/* Leaderboard */}
              <Card className="kawaii-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-kawaii-yellow" /> Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3].map(rank => (
                      <div key={rank} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <span className="font-bold text-lg w-6">{rank}</span>
                        <span className="text-sm flex-1">0x1234...abcd</span>
                        <span className="text-sm font-medium">{30 - rank * 5} wins</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Active Battles */}
          <Card className="kawaii-card mt-8">
            <CardHeader>
              <CardTitle>Active Battles ({activeBattles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeBattles.map(battle => (
                  <div key={battle.battleId.toString()} className="p-4 rounded-xl bg-muted/30 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Battle #{battle.battleId.toString()}</p>
                      <p className="text-sm text-muted-foreground">Wager: {formatEther(battle.wager)} ETH</p>
                    </div>
                    <Button size="sm" variant="outline" onMouseDown={playClick}>Join</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
