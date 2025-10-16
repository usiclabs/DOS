"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TokenDeployModal } from "@/components/token-deploy-modal"
import { Rocket, Coins, TrendingUp, Zap, ArrowLeft, Sparkles, Shield, Clock, Lock } from "lucide-react"
import Link from "next/link"
import { DeusTicker } from "@/components/deus-ticker"
import { StickyHeader } from "@/components/sticky-header"
import { motion } from "framer-motion"
import { useWalletContext } from "@/contexts/wallet-context"
import { DEUS_TOKEN_ADDRESS } from "@/lib/constants"

const MINIMUM_DEUS_BALANCE = 10_000_000 // 10 million DEUS (1% of supply)

export default function TokenFactoryPage() {
  const [deployModalOpen, setDeployModalOpen] = useState(false)
  const [deusBalance, setDeusBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const { address, isConnected } = useWalletContext()

  useEffect(() => {
    async function checkBalance() {
      if (!isConnected || !address) {
        setIsLoading(false)
        setHasAccess(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/wallet/balances/${address}`)
        if (response.ok) {
          const data = await response.json()
          const deusToken = data.tokens?.find((t: any) => t.address.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase())
          const balance = deusToken?.balance || 0
          setDeusBalance(balance)
          setHasAccess(balance >= MINIMUM_DEUS_BALANCE)
        }
      } catch (error) {
        console.error("[v0] Error checking DEUS balance:", error)
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkBalance()
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <DeusTicker />
        <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="relative p-8 md:p-12 bg-black border-2 border-orange-500/30 text-center overflow-hidden shadow-2xl">
              <motion.div
                className="absolute inset-0 opacity-40"
                animate={{
                  background: [
                    "radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 50%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)",
                    "radial-gradient(circle at 50% 80%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)",
                    "radial-gradient(circle at 50% 20%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)",
                  ],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />

              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-orange-500/60 rounded-full blur-sm"
                  initial={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: ["-10%", "110%"],
                    x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1.5, 0.5],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 3,
                    ease: "easeInOut",
                  }}
                />
              ))}

              <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-orange-500/40 rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-orange-500/40 rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-orange-500/40 rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-orange-500/40 rounded-br-3xl" />

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="relative h-32 w-32 rounded-3xl bg-gradient-to-br from-orange-500/40 to-orange-600/20 flex items-center justify-center mx-auto mb-8 border-2 border-orange-500/60 shadow-2xl z-10"
              >
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-orange-500/40 blur-xl"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.6, 0.3, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-orange-400/30 blur-2xl"
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: [0.4, 0.1, 0.4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />

                <motion.div
                  className="absolute inset-0 rounded-3xl border-4 border-orange-500/50"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  style={{
                    borderTopColor: "transparent",
                    borderRightColor: "transparent",
                  }}
                />
                <motion.div
                  className="absolute inset-2 rounded-3xl border-2 border-orange-400/40"
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  style={{
                    borderBottomColor: "transparent",
                    borderLeftColor: "transparent",
                  }}
                />

                <motion.div
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Lock className="h-16 w-16 text-orange-500 relative z-10 drop-shadow-2xl" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="relative z-10"
              >
                <motion.h2
                  className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-orange-400 to-white bg-clip-text text-transparent drop-shadow-lg"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                >
                  Connect Your Wallet
                </motion.h2>

                <motion.p
                  className="text-gray-300 text-lg md:text-xl mb-6 max-w-2xl mx-auto font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  Please connect your wallet to access the Token Factory.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="h-5 w-5 text-orange-400" />
                  </motion.div>
                  <span className="text-base text-orange-400 font-bold tracking-wide">EXCLUSIVE FEATURE</span>
                </motion.div>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <DeusTicker />
        <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="p-8 md:p-12 bg-gradient-to-br from-accent/10 via-background to-accent/5 border-accent/30 text-center">
              <div className="h-20 w-20 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6 border border-accent/30">
                <div className="h-8 w-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Checking Access...</h2>
              <p className="text-muted-foreground text-base md:text-lg">Verifying your DEUS token balance</p>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <DeusTicker />
        <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="p-8 md:p-12 bg-gradient-to-br from-red-500/10 via-background to-red-500/5 border-red-500/30 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-20 w-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/30"
              >
                <Lock className="h-10 w-10 text-red-500" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Access Restricted</h2>
              <p className="text-gray-200 text-base md:text-lg mb-6 max-w-2xl mx-auto">
                The Token Factory requires a minimum balance of{" "}
                <span className="text-orange-400 font-bold">{MINIMUM_DEUS_BALANCE.toLocaleString()} $DEUS</span> (1% of
                supply) to access.
              </p>
              <div className="bg-background/50 rounded-xl p-6 mb-6 max-w-md mx-auto border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Your Balance:</span>
                  <span className="text-lg font-semibold text-white">{deusBalance.toLocaleString()} $DEUS</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-300">Required:</span>
                  <span className="text-lg font-semibold text-orange-400">
                    {MINIMUM_DEUS_BALANCE.toLocaleString()} $DEUS
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((deusBalance / MINIMUM_DEUS_BALANCE) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-red-500 to-accent"
                  />
                </div>
                <p className="text-xs text-gray-300 mt-2">
                  {((deusBalance / MINIMUM_DEUS_BALANCE) * 100).toFixed(2)}% of requirement
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
                  <Link href="/swap">
                    <Coins className="h-5 w-5 mr-2" />
                    Buy $DEUS
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-accent/30 hover:bg-accent/10 bg-transparent"
                  asChild
                >
                  <Link href="/">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: Coins,
      title: "Flexible Token Options",
      description: "Use an existing ERC20 token or deploy a new one with custom name, symbol, and supply",
      delay: 0.2,
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: TrendingUp,
      title: "Auto Pool Creation",
      description: "Automatically creates a Uniswap V3 pool paired with DEUS and adds your initial liquidity",
      delay: 0.3,
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: Zap,
      title: "Instant Trading",
      description: "Your token becomes immediately tradable for all DEUS holders on Uniswap V3",
      delay: 0.4,
      gradient: "from-orange-500/20 to-red-500/20",
    },
  ]

  const steps = [
    {
      step: "1",
      title: "Choose Your Token",
      description: "Use an existing token address or deploy a new token with your specifications",
      icon: Coins,
    },
    {
      step: "2",
      title: "Create Pool",
      description: "The system creates a Uniswap V3 pool paired with DEUS for your token",
      icon: Sparkles,
    },
    {
      step: "3",
      title: "Add Initial Liquidity",
      description: "Your specified amounts of DEUS and your token are added to the pool",
      icon: TrendingUp,
    },
    {
      step: "4",
      title: "Start Trading",
      description: "Your token is now live and tradable on Uniswap V3 for all DEUS holders",
      icon: Rocket,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <DeusTicker />

      <div className="container mx-auto px-4 py-8 pt-20 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-accent/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center border border-accent/30 shadow-lg"
            >
              <Rocket className="h-8 w-8 text-accent" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Token Factory</h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Deploy tokens and create DEUS liquidity pools instantly on Base
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 md:p-8 bg-gradient-to-br from-accent/10 via-background to-accent/5 border-accent/30 mb-8 hover:border-accent/50 transition-all duration-300 shadow-xl hover:shadow-2xl">
            <div className="max-w-3xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Create DEUS Liquidity Pools</h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    Create a Uniswap V3 liquidity pool paired with DEUS using an existing token or by deploying a new
                    one. Your pool will be instantly tradable for all DEUS holders on the Base network.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setDeployModalOpen(true)}
                    size="lg"
                    className="w-full sm:w-auto bg-accent hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Rocket className="h-5 w-5 mr-2" />
                    Create Pool
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto bg-transparent border-accent/30 hover:bg-accent/10"
                    asChild
                  >
                    <Link href="/pools">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      View Existing Pools
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card
                className={`p-6 bg-gradient-to-br ${feature.gradient} border-border hover:border-accent/30 transition-all duration-300 h-full backdrop-blur-sm`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: feature.delay + 0.2, type: "spring", stiffness: 200 }}
                  className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 border border-accent/20"
                >
                  <feature.icon className="h-6 w-6 text-accent" />
                </motion.div>
                <h3 className="font-semibold text-white mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 md:p-8 bg-muted/50 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-white">How It Works</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {steps.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-accent/30 transition-colors"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                    className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 border border-accent/30"
                  >
                    <span className="text-sm font-bold text-accent">{item.step}</span>
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className="h-4 w-4 text-accent" />
                      <h4 className="font-medium text-white">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6"
        >
          <Card className="p-4 md:p-6 bg-accent/5 border-accent/20">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Secure & Decentralized</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All token deployments and pool creations happen directly on-chain through Uniswap V3 smart contracts.
                  Your tokens are fully decentralized and tradable immediately after deployment.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <TokenDeployModal open={deployModalOpen} onOpenChange={setDeployModalOpen} />
    </div>
  )
}
