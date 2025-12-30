import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, Tag, Wallet, Loader2, AlertCircle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CatCard } from '@/components/CatCard';
import { useWeb3 } from '@/hooks/useWeb3';
import { usePurchaseKitty, useApproveTokens, useKittyTokenBalance, useMarketplaceListings, useKitty, useListing } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';
import { formatEther, parseEther } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/abis';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Marketplace() {
  const { isConnected, connectWallet, isConnecting, address } = useWeb3();
  const { listingIds, isLoading: isLoadingListings, refetch: refetchListings } = useMarketplaceListings();
  const { purchaseKitty, isPending: isPurchasing, isConfirming, isSuccess } = usePurchaseKitty();
  const { approveTokens, isPending: isApproving } = useApproveTokens();
  const { balance: kittyBalance } = useKittyTokenBalance();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [buyingTokenId, setBuyingTokenId] = useState<bigint | null>(null);

  // Show success toast when purchase completes
  useEffect(() => {
    if (isSuccess && buyingTokenId) {
      toast({
        title: "Purchase Successful! 🎉",
        description: `You bought DigiCat #${buyingTokenId.toString()}`,
      });
      setBuyingTokenId(null);
      refetchListings();
    }
  }, [isSuccess, buyingTokenId, toast, refetchListings]);

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    // Check balance
    if (kittyBalance && kittyBalance < price) {
      toast({
        title: "Insufficient KITTY tokens",
        description: `You need ${formatEther(price)} KITTY tokens to buy this cat`,
        variant: "destructive",
      });
      return;
    }

    try {
      setBuyingTokenId(tokenId);
      
      // First approve the marketplace to spend tokens
      toast({
        title: "Approving tokens...",
        description: "Please confirm the approval transaction in your wallet",
      });
      
      await approveTokens(
        CONTRACT_ADDRESSES.KITTY_MARKETPLACE as `0x${string}`,
        price
      );

      // Then purchase
      toast({
        title: "Purchasing...",
        description: "Please confirm the purchase transaction in your wallet",
      });
      
      await purchaseKitty(tokenId);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setBuyingTokenId(null);
    }
  };

  const hasListings = listingIds && listingIds.length > 0;

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 pb-8 px-4 flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Connect your wallet to browse and buy DigiCats</p>
          <Button onClick={connectWallet} disabled={isConnecting} size="lg">
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold">Marketplace</h1>
            {kittyBalance && (
              <div className="text-sm text-muted-foreground">
                Balance: <span className="font-bold text-primary">{Number(formatEther(kittyBalance)).toFixed(2)} KITTY</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground mb-8">
            {isLoadingListings ? 'Loading listings...' : `${listingIds?.length || 0} cats for sale`}
          </p>

          {/* Info Alert for Empty Marketplace */}
          {!isLoadingListings && !hasListings && (
            <Alert className="mb-8 border-primary/50 bg-primary/10">
              <Info className="h-4 w-4" />
              <AlertTitle>No cats listed yet!</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">The marketplace is empty. To list a cat for sale:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to <strong>My Kitties</strong> page</li>
                  <li>Select a cat you own</li>
                  <li>Click <strong>"List for Sale"</strong> and set a price</li>
                </ol>
                <p className="mt-3 text-xs text-muted-foreground">
                  Make sure you have minted or bred some cats first! You can mint Gen0 cats from the Dashboard.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {isLoadingListings ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3">Loading marketplace...</span>
            </div>
          ) : hasListings ? (
            <>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {listingIds.map((tokenId, i) => (
                  <ListingCard
                    key={tokenId.toString()}
                    tokenId={tokenId}
                    index={i}
                    buyingTokenId={buyingTokenId}
                    isPurchasing={isPurchasing}
                    isConfirming={isConfirming}
                    isApproving={isApproving}
                    onBuy={handleBuy}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Be the first to list a cat!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Component to display a single listing with its kitty data
function ListingCard({
  tokenId,
  index,
  buyingTokenId,
  isPurchasing,
  isConfirming,
  isApproving,
  onBuy,
}: {
  tokenId: bigint;
  index: number;
  buyingTokenId: bigint | null;
  isPurchasing: boolean;
  isConfirming: boolean;
  isApproving: boolean;
  onBuy: (tokenId: bigint, price: bigint) => void;
}) {
  const { kitty, isLoading: isLoadingKitty } = useKitty(tokenId);
  const { listing, isLoading: isLoadingListing } = useListing(tokenId);

  if (isLoadingKitty || isLoadingListing) {
    return (
      <div className="kawaii-card p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!kitty || !listing || !listing.active) {
    return null;
  }

  const isBuying = buyingTokenId === tokenId && (isPurchasing || isConfirming || isApproving);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="kawaii-card overflow-hidden">
        <CatCard kitty={kitty} showStats={false} />
        <div className="p-4 pt-0 flex items-center justify-between">
          <span className="font-display font-bold text-lg">{formatEther(listing.price)} KITTY</span>
          <Button
            size="sm"
            className="btn-glow"
            disabled={isBuying}
            onClick={() => onBuy(tokenId, listing.price)}
          >
            {isBuying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isApproving ? 'Approving...' : isConfirming ? 'Confirming...' : 'Buying...'}
              </>
            ) : (
              'Buy'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
