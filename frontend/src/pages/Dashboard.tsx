import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid3X3, LayoutGrid, Wallet, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CatCard } from '@/components/CatCard';
import { useWeb3 } from '@/hooks/useWeb3';
import { useUserKitties, useKitty } from '@/hooks/useContracts';
import { useMockData } from '@/hooks/useMockData';
import { Kitty, RarityLevel, RARITY_NAMES } from '@/lib/web3/types';
import { cn } from '@/lib/utils';

// Component to fetch individual kitty data
function KittyLoader({ tokenId, onLoad }: { tokenId: bigint; onLoad: (kitty: Kitty) => void }) {
  const { kitty } = useKitty(tokenId);
  
  useEffect(() => {
    if (kitty) {
      onLoad(kitty);
    }
  }, [kitty, onLoad]);
  
  return null;
}

export default function Dashboard() {
  const { isConnected, connectWallet, isConnecting } = useWeb3();
  const { kittyIds, isLoading: isLoadingIds, refetch } = useUserKitties();
  const { myKitties: mockKitties } = useMockData();
  
  const [myKitties, setMyKitties] = useState<Kitty[]>([]);
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [gridSize, setGridSize] = useState<'sm' | 'lg'>('lg');
  const [useMock, setUseMock] = useState(false);

  // Use mock data if not connected or no kitties found
  const displayKitties = useMock || !isConnected ? mockKitties : myKitties;

  const handleKittyLoaded = (kitty: Kitty) => {
    setMyKitties(prev => {
      const exists = prev.find(k => k.tokenId === kitty.tokenId);
      if (exists) return prev;
      return [...prev, kitty];
    });
  };

  const filteredKitties = displayKitties.filter(kitty => {
    if (rarityFilter !== 'all' && kitty.rarity !== Number(rarityFilter)) return false;
    if (search && !kitty.tokenId.toString().includes(search)) return false;
    return true;
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 pb-8 px-4 flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Connect your wallet to view your DigiCats</p>
          <Button onClick={connectWallet} disabled={isConnecting} size="lg">
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => setUseMock(true)}>
              View Demo Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-4" style={{ background: 'var(--gradient-hero)' }}>
      {/* Load kitty data for each token ID */}
      {kittyIds?.map(id => (
        <KittyLoader key={id.toString()} tokenId={id} onLoad={handleKittyLoaded} />
      ))}
      
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold">My DigiCats</h1>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-muted-foreground mb-8">
            {isLoadingIds ? 'Loading...' : `You own ${displayKitties.length} cats`}
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                {Object.entries(RARITY_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-1">
              <Button
                variant={gridSize === 'lg' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setGridSize('lg')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={gridSize === 'sm' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setGridSize('sm')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Grid */}
          <div className={cn(
            "grid gap-4",
            gridSize === 'lg' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
          )}>
            {filteredKitties.map((kitty, i) => (
              <motion.div
                key={kitty.tokenId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CatCard kitty={kitty} showStats={gridSize === 'lg'} />
              </motion.div>
            ))}
          </div>

          {filteredKitties.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No cats found</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
