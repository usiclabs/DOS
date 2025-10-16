"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ClankerDeployModal } from "@/components/clanker-deploy-modal"
import { Rocket, Zap, ArrowLeft, Sparkles, Shield, Clock, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { DeusTicker } from "@/components/deus-ticker"
import { StickyHeader } from "@/components/sticky-header"
import { motion } from "framer-motion"
import { useWalletContext } from "@/contexts/wallet-context"

export default function ClankerDeployPage() {
  const [deployModalOpen, setDeployModalOpen] = useState(false)
  const { isConnected } = useWalletContext()

  const features = [
    {
      icon: Zap,
      title: "No Minimum Balance",
      description: "Deploy tokens without needing DEUS holdings - accessible to everyone",
      delay: 0.2,
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Users,
      title: "Clanker Network",
      description: "Leverage the Clanker SDK for seamless token deployment and instant liquidity",
      delay: 0.3,
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: TrendingUp,
      title: "Instant Trading",
      description: "Your token becomes immediately tradable on Base with automatic pool creation",
      delay: 0.4,
      gradient: "from-orange-500/20 to-red-500/20",
    },
  ]

  const steps = [
    {
      step: "1",
      title: "Configure Token",
      description: "Set your token name, symbol, supply, and optional metadata like description and social links",
      icon: Sparkles,
    },
    {
      step: "2",
      title: "Deploy via Clanker",
      description: "The Clanker SDK deploys your token contract and sets up initial configuration",
      icon: Rocket,
    },
    {
      step: "3",
      title: "Auto Pool Creation",
      description: "Liquidity pools are automatically created on supported DEXs for instant trading",
      icon: TrendingUp,
    },
    {
      step: "4",
      title: "Start Trading",
      description: "Your token is live and tradable on Base with full Clanker network support",
      icon: Zap,
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
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-blue-500/30 shadow-lg"
            >
              <Rocket className="h-8 w-8 text-blue-400" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">Clanker Token Deployer</h1>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                  FREE
                </span>
              </div>
              <p className="text-muted-foreground text-base md:text-lg">
                Deploy tokens on Base using the Clanker SDK - no minimum balance required
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
          <Card className="glass-card p-6 md:p-8 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 border-blue-500/30 mb-8 hover:border-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl">
            <div className="max-w-3xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Deploy Tokens with Clanker</h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    Create and deploy ERC20 tokens on Base using the Clanker SDK. No minimum DEUS balance required -
                    this deployer is free for everyone. Your token will be instantly tradable with automatic liquidity
                    pool creation.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setDeployModalOpen(true)}
                    disabled={!isConnected}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Rocket className="h-5 w-5 mr-2" />
                    {isConnected ? "Deploy Token" : "Connect Wallet First"}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto bg-transparent border-blue-500/30 hover:bg-blue-500/10"
                    asChild
                  >
                    <Link href="/token-factory">
                      <Shield className="h-5 w-5 mr-2" />
                      Premium Token Factory
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
                className={`glass-card p-6 bg-gradient-to-br ${feature.gradient} border-border hover:border-blue-500/30 transition-all duration-300 h-full backdrop-blur-sm`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: feature.delay + 0.2, type: "spring", stiffness: 200 }}
                  className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/20"
                >
                  <feature.icon className="h-6 w-6 text-blue-400" />
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
          <Card className="glass-card p-6 md:p-8 bg-muted/50 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
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
                  className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border hover:border-blue-500/30 transition-colors"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                    className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30"
                  >
                    <span className="text-sm font-bold text-blue-400">{item.step}</span>
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className="h-4 w-4 text-blue-400" />
                      <h4 className="font-medium text-white">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Comparison Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6"
        >
          <Card className="glass-card p-4 md:p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">Clanker vs Premium Token Factory</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  The Clanker deployer is free and accessible to everyone, while the Premium Token Factory requires 10M
                  DEUS but offers advanced features like custom DEUS liquidity pools and lopsided pool architecture.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 hover:bg-blue-500/10 bg-transparent"
                  asChild
                >
                  <Link href="/token-factory">
                    View Premium Features
                    <ArrowLeft className="h-3 w-3 ml-2 rotate-180" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <ClankerDeployModal open={deployModalOpen} onOpenChange={setDeployModalOpen} />
    </div>
  )
}
