import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { 
  DIGICATS_ABI, 
  KITTY_MARKETPLACE_ABI, 
  KITTY_BATTLE_ABI, 
  KITTY_STAKING_ABI, 
  KITTY_TOKEN_ABI,
  CONTRACT_ADDRESSES 
} from '@/lib/contracts/abis';
import { Kitty, RarityLevel, MarketplaceListing, StakeInfo } from '@/lib/web3/types';
import { useWeb3 } from './useWeb3';

// Parse raw kitty data from contract to Kitty type
function parseKittyData(data: any): Kitty | null {
  if (!data) return null;
  
  // Calculate rarity from stats
  const totalStats = Number(data.strength) + Number(data.agility) + Number(data.intelligence);
  let rarity: RarityLevel;
  if (data.hasSpecialTrait) {
    rarity = RarityLevel.Legendary;
  } else if (totalStats > 240) {
    rarity = RarityLevel.Epic;
  } else if (totalStats > 200) {
    rarity = RarityLevel.Rare;
  } else if (totalStats > 160) {
    rarity = RarityLevel.Uncommon;
  } else {
    rarity = RarityLevel.Common;
  }
  
  return {
    tokenId: BigInt(data.tokenId),
    generation: BigInt(data.generation),
    birthTime: BigInt(data.birthTime),
    lastBreedTime: BigInt(data.lastBreedTime),
    matronId: BigInt(data.matronId),
    sireId: BigInt(data.sireId),
    bodyColor: Number(data.bodyColor),
    eyeColor: Number(data.eyeColor),
    pattern: Number(data.pattern),
    accessory: Number(data.accessory),
    background: Number(data.background),
    isSpecial: Boolean(data.hasSpecialTrait),
    strength: Number(data.strength),
    agility: Number(data.agility),
    intelligence: Number(data.intelligence),
    rarity,
  };
}

// Hook to get user's kitties
export function useUserKitties() {
  const { address, isConnected } = useWeb3();
  
  const { data: kittyIds, isLoading: isLoadingIds, refetch: refetchIds } = useReadContract({
    address: CONTRACT_ADDRESSES.DIGICATS as `0x${string}`,
    abi: DIGICATS_ABI,
    functionName: 'getKittiesByOwner',
    args: [address as `0x${string}`],
    chainId: sepolia.id,
    query: {
      enabled: isConnected && !!address,
    },
  });

  return {
    kittyIds: kittyIds as bigint[] | undefined,
    isLoading: isLoadingIds,
    refetch: refetchIds,
  };
}

// Hook to get a single kitty's data
export function useKitty(tokenId: bigint | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.DIGICATS as `0x${string}`,
    abi: DIGICATS_ABI,
    functionName: 'getKitty',
    args: tokenId ? [tokenId] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!tokenId,
    },
  });

  return {
    kitty: data ? parseKittyData(data) : null,
    isLoading,
    refetch,
  };
}

// Hook to breed kitties
export function useBreedKitties() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const breed = async (matronId: bigint, sireId: bigint) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.DIGICATS as `0x${string}`,
      abi: DIGICATS_ABI,
      functionName: 'breedKitties',
      args: [matronId, sireId],
      chainId: sepolia.id,
    });
  };

  return {
    breed,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for marketplace listings
export function useMarketplaceListings() {
  const { data: activeListingIds, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KITTY_MARKETPLACE as `0x${string}`,
    abi: KITTY_MARKETPLACE_ABI,
    functionName: 'getActiveListings',
    chainId: sepolia.id,
  });

  return {
    listingIds: activeListingIds as bigint[] | undefined,
    isLoading,
    refetch,
  };
}

// Hook to get a single listing
export function useListing(tokenId: bigint | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KITTY_MARKETPLACE as `0x${string}`,
    abi: KITTY_MARKETPLACE_ABI,
    functionName: 'listings',
    args: tokenId ? [tokenId] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!tokenId,
    },
  });

  const listing = data ? {
    tokenId: BigInt((data as any).tokenId),
    seller: (data as any).seller as string,
    price: BigInt((data as any).price),
    active: Boolean((data as any).active),
    listedAt: BigInt((data as any).listedAt),
  } : null;

  return {
    listing,
    isLoading,
    refetch,
  };
}

// Hook to list a kitty for sale
export function useListKitty() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const listKitty = async (tokenId: bigint, price: bigint) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.KITTY_MARKETPLACE as `0x${string}`,
      abi: KITTY_MARKETPLACE_ABI,
      functionName: 'listKitty',
      args: [tokenId, price],
      chainId: sepolia.id,
    });
  };

  return {
    listKitty,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook to purchase a kitty
export function usePurchaseKitty() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const purchaseKitty = async (tokenId: bigint) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.KITTY_MARKETPLACE as `0x${string}`,
      abi: KITTY_MARKETPLACE_ABI,
      functionName: 'purchaseKitty',
      args: [tokenId],
      chainId: sepolia.id,
    });
  };

  return {
    purchaseKitty,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for battles
export function usePendingBattles() {
  const { data: battleIds, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KITTY_BATTLE as `0x${string}`,
    abi: KITTY_BATTLE_ABI,
    functionName: 'getPendingBattles',
    chainId: sepolia.id,
  });

  return {
    battleIds: battleIds as bigint[] | undefined,
    isLoading,
    refetch,
  };
}

// Hook to create a battle
export function useCreateBattle() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createBattle = async (kittyId: bigint) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.KITTY_BATTLE as `0x${string}`,
      abi: KITTY_BATTLE_ABI,
      functionName: 'createBattle',
      args: [kittyId],
      chainId: sepolia.id,
    });
  };

  return {
    createBattle,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook to join a battle
export function useJoinBattle() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const joinBattle = async (battleId: bigint, kittyId: bigint) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.KITTY_BATTLE as `0x${string}`,
      abi: KITTY_BATTLE_ABI,
      functionName: 'joinBattle',
      args: [battleId, kittyId],
      chainId: sepolia.id,
    });
  };

  return {
    joinBattle,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for staking
export function useStakeKitty() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stakeKitty = async (tokenId: bigint) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.KITTY_STAKING as `0x${string}`,
      abi: KITTY_STAKING_ABI,
      functionName: 'stakeKitty',
      args: [tokenId],
      chainId: sepolia.id,
    });
  };

  return {
    stakeKitty,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook to unstake a kitty
export function useUnstakeKitty() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unstakeKitty = async (tokenId: bigint) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.KITTY_STAKING as `0x${string}`,
      abi: KITTY_STAKING_ABI,
      functionName: 'unstakeKitty',
      args: [tokenId],
      chainId: sepolia.id,
    });
  };

  return {
    unstakeKitty,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for KITTY token balance
export function useKittyTokenBalance() {
  const { address, isConnected } = useWeb3();
  
  const { data: balance, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KITTY_TOKEN as `0x${string}`,
    abi: KITTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: sepolia.id,
    query: {
      enabled: isConnected && !!address,
    },
  });

  return {
    balance: balance as bigint | undefined,
    isLoading,
    refetch,
  };
}

// Hook to claim initial tokens
export function useClaimInitialTokens() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimTokens = async () => {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.KITTY_TOKEN as `0x${string}`,
      abi: KITTY_TOKEN_ABI,
      functionName: 'claimInitialTokens',
      chainId: sepolia.id,
    });
  };

  return {
    claimTokens,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook to approve tokens for a spender
export function useApproveTokens() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approveTokens = async (spender: `0x${string}`, amount: bigint) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.KITTY_TOKEN as `0x${string}`,
      abi: KITTY_TOKEN_ABI,
      functionName: 'approve',
      args: [spender, amount],
      chainId: sepolia.id,
    });
  };

  return {
    approveTokens,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook to approve NFT for marketplace/staking
export function useApproveNFT() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approveNFT = async (operator: `0x${string}`, approved: boolean) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.DIGICATS as `0x${string}`,
      abi: DIGICATS_ABI,
      functionName: 'setApprovalForAll',
      args: [operator, approved],
      chainId: sepolia.id,
    });
  };

  return {
    approveNFT,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}
