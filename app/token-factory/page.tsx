"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TokenDeployModal } from "@/components/token-deploy-modal"
import { Rocket, Coins, TrendingUp, Zap, ArrowLeft, Sparkles, Shield, Clock } from "lucide-react"
import Link from "next/link"
import { DeusTicker } from "@/components/deus-ticker"
import { StickyHeader } from "@/components/sticky-header"
import { motion } from "framer-motion"

export default function TokenFactoryPage() {
  const [deployModalOpen, setDeployModalOpen] = useState(false)

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
