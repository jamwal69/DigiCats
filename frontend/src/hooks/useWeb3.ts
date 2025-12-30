import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export function useWeb3() {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
    chainId: sepolia.id,
  });

  const isCorrectNetwork = chain?.id === sepolia.id;

  const connectWallet = () => {
    const injectedConnector = connectors.find((c) => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isPending,
    balance,
    isCorrectNetwork,
    connectWallet,
    disconnect,
    connectors,
    connect,
  };
}
