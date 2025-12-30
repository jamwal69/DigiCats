import { motion } from 'framer-motion';
import { Coins, TrendingUp, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatCard } from '@/components/CatCard';
import { useMockData } from '@/hooks/useMockData';
import { RARITY_NAMES } from '@/lib/web3/types';
import { formatEther } from 'viem';

const RARITY_MULTIPLIERS = ['1.0x', '1.2x', '1.5x', '2.0x', '3.0x'];

export default function Staking() {
  const { myKitties, stakedKitties, kittyBalance, stakeKitty, unstakeKitty } = useMockData();

  const availableToStake = myKitties.filter(k => !stakedKitties.find(s => s.tokenId === k.tokenId));
  const stakedKittyData = myKitties.filter(k => stakedKitties.find(s => s.tokenId === k.tokenId));

  return (
    <div className="min-h-screen pt-24 pb-8 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Coins className="w-8 h-8 text-primary" /> Staking Vault
          </h1>
          <p className="text-muted-foreground mb-8">Stake your cats to earn KITTY tokens!</p>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="kawaii-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Balance</p>
                    <p className="font-display text-2xl font-bold">
                      {Number(formatEther(kittyBalance)).toFixed(0)} KITTY
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="kawaii-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cats Staked</p>
                    <p className="font-display text-2xl font-bold">{stakedKitties.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="kawaii-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-kawaii-yellow/20 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-kawaii-yellow" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Rewards</p>
                    <p className="font-display text-2xl font-bold">12.5 KITTY</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Multiplier Info */}
          <Card className="kawaii-card mb-8">
            <CardHeader><CardTitle>Rarity Multipliers</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(RARITY_NAMES).map(([key, name], i) => (
                  <div key={key} className="px-4 py-2 rounded-lg bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">{name}</p>
                    <p className="font-bold">{RARITY_MULTIPLIERS[i]}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staked Cats */}
          {stakedKittyData.length > 0 && (
            <Card className="kawaii-card mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Staked Cats ({stakedKittyData.length})</CardTitle>
                <Button variant="outline">Claim All Rewards</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {stakedKittyData.map(kitty => (
                    <div key={kitty.tokenId.toString()}>
                      <CatCard kitty={kitty} showStats={false} />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => unstakeKitty(kitty.tokenId)}
                      >
                        Unstake
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available to Stake */}
          <Card className="kawaii-card">
            <CardHeader><CardTitle>Available to Stake ({availableToStake.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {availableToStake.map(kitty => (
                  <div key={kitty.tokenId.toString()}>
                    <CatCard kitty={kitty} showStats={false} />
                    <Button 
                      size="sm" 
                      className="w-full mt-2 btn-glow"
                      onClick={() => stakeKitty(kitty.tokenId)}
                    >
                      Stake
                    </Button>
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
