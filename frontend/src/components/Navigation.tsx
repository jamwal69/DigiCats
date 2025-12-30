import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Store, Swords, Heart, Coins, Wallet, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/hooks/useWeb3';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'My Cats', icon: Heart },
  { path: '/marketplace', label: 'Market', icon: Store },
  { path: '/battle', label: 'Battle', icon: Swords },
  { path: '/breeding', label: 'Breed', icon: Heart },
  { path: '/fusion', label: 'Fusion', icon: Sparkles },
  { path: '/staking', label: 'Stake', icon: Coins },
];

export function Navigation() {
  const location = useLocation();
  const { address, isConnected, connectWallet, disconnect, isConnecting } = useWeb3();

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          <span className="font-display text-xl font-bold gradient-text">DigiCats</span>
        </Link>

        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 transition-all",
                    isActive && "shadow-kawaii"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
              className="gap-2"
            >
              <Wallet className="w-4 h-4" />
              {formatAddress(address!)}
            </Button>
          ) : (
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="gap-2 btn-glow"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden flex items-center justify-around py-2 border-t border-border/30">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <div className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </motion.header>
  );
}
