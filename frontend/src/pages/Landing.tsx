import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Swords, Store, Heart, Coins, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/hooks/useWeb3';
import { useMockData } from '@/hooks/useMockData';
import { CatCard } from '@/components/CatCard';
import { ParticleField, FloatingElements } from '@/components/ParticleField';
import { cn } from '@/lib/utils';
export default function Landing() {
  const { isConnected, connectWallet, isConnecting } = useWeb3();
  const { myKitties, hasClaimed, claimTokens } = useMockData();

  const features = [
    { icon: Heart, title: 'Collect', desc: 'Build your unique collection of DigiCats with rare traits' },
    { icon: Store, title: 'Trade', desc: 'Buy and sell on the marketplace or auction your cats' },
    { icon: Swords, title: 'Battle', desc: 'Challenge others in strategic turn-based battles' },
    { icon: Coins, title: 'Earn', desc: 'Stake your cats to earn KITTY token rewards' },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--gradient-hero)' }}>
      <ParticleField />
      <FloatingElements />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Built on Sepolia Testnet</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">DigiCats</span>
              <br />
              <span className="text-foreground">NFT Gaming</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Collect adorable digital cats, breed unique combinations, 
              battle for glory, and earn rewards in this kawaii NFT universe ✨
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isConnected ? (
                <Button 
                  size="lg" 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn-glow text-lg px-8"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              ) : (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="btn-glow text-lg px-8 gap-2">
                      View My Cats <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  {!hasClaimed && (
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={claimTokens}
                      className="text-lg px-8"
                    >
                      Claim 100 KITTY 🎁
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Floating Cat Cards */}
          <div className="mt-16 flex justify-center gap-4 overflow-hidden">
            {myKitties.slice(0, 3).map((kitty, i) => (
              <motion.div
                key={kitty.tokenId.toString()}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className={cn(
                  "w-48 md:w-56",
                  i === 1 ? "float" : "float animation-delay-300"
                )}
              >
                <CatCard kitty={kitty} showStats={false} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-display text-3xl md:text-4xl font-bold text-center mb-12"
          >
            What can you do?
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="kawaii-card p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="kawaii-card p-8 md:p-12 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">Ready to start?</h2>
            <p className="text-muted-foreground mb-6">Connect your wallet and enter the DigiCats universe!</p>
            <Link to="/marketplace">
              <Button size="lg" className="btn-glow">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
