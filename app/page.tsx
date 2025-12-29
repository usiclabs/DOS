"use client"

import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { LiquidityAgent } from "@/components/liquidity-agent"
import { ErrorBoundary } from "@/components/error-boundary"
import { OnboardingModal } from "@/components/onboarding/onboarding-modal"
import { WelcomeBanner } from "@/components/onboarding/welcome-banner"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { FeaturedPoolsCarousel } from "@/components/featured-pools-carousel"
import { useOnboarding } from "@/hooks/use-onboarding"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LiveDataIndicator } from "@/components/live-data-indicator"
import useSWR from "swr"
import type { PoolData } from "@/lib/pool-data"
import { TrendingUp, Shield, Zap, Target, LineChart, Coins, ArrowUpRight, Sparkles, Lock, Users } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
      mass: 0.5,
    },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.4,
    },
  },
}

export default function HomePage() {
  const { hasCompletedOnboarding, isOnboardingOpen, startOnboarding, completeOnboarding, closeOnboarding } =
    useOnboarding()

  const { data: poolsData, isLoading: isLoadingPools } = useSWR<{ pools: PoolData[] }>(
    "/api/pools?limit=15&sortBy=netApy&sortOrder=desc",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
      refreshInterval: 600000,
    },
  )

  const pools = poolsData?.pools || []

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <AIInsightsPanel />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 pb-24 md:pb-12">
        {!hasCompletedOnboarding && <WelcomeBanner onStartOnboarding={startOnboarding} />}

        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center py-8 md:py-12 lg:py-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-3xl" />
          <div className="max-w-5xl mx-auto relative space-y-6 md:space-y-8 lg:space-y-10">
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 md:mb-8 lg:mb-10 backdrop-blur-lg bg-primary/20 text-primary-foreground border border-primary/30 hover:bg-primary/25 hover:border-primary/40 transition-all duration-500 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
                <LiveDataIndicator size="sm" label="Live on Base" className="mr-1.5 md:mr-2" />
                <span className="text-xs md:text-sm">Powering the Clanker Ecosystem</span>
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6 md:mb-8 lg:mb-10 text-white leading-tight tracking-tight px-2"
            >
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Maximize Yield.
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-primary-foreground to-white bg-clip-text text-transparent">
                Stabilize Prices.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-2xl lg:text-3xl text-gray-300 mb-4 md:mb-6 lg:mb-8 max-w-4xl mx-auto leading-relaxed font-medium px-2"
            >
              The intelligent liquidity layer for the <span className="text-primary font-bold">$CLANKER</span> ecosystem
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg lg:text-xl text-gray-400 mb-12 md:mb-16 lg:mb-20 max-w-3xl mx-auto leading-relaxed px-2"
            >
              AI-powered yield discovery that identifies profitable opportunities, strengthens token prices through
              strategic liquidity deployment, and generates passive income for the entire Farcaster community
            </motion.p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16 lg:mb-24 px-2"
            >
              <motion.div variants={scaleIn} whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  className="btn-premium text-white shadow-2xl hover:shadow-primary/30 transition-all duration-500 px-6 py-4 md:px-10 md:py-6 text-base md:text-lg lg:text-xl font-semibold bg-transparent w-full sm:w-auto min-h-[48px]"
                  onClick={() => (window.location.href = "/pools")}
                >
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  Discover Yield Opportunities
                </Button>
              </motion.div>

              <motion.div variants={scaleIn} whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-card border-primary/30 text-primary-foreground hover:bg-primary/10 hover:border-primary/50 bg-transparent px-6 py-4 md:px-10 md:py-6 text-base md:text-lg lg:text-xl font-semibold transition-all duration-500 w-full sm:w-auto min-h-[48px]"
                  onClick={() => (window.location.href = "/analytics")}
                >
                  <LineChart className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  View Ecosystem Analytics
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto px-2"
            >
              {[
                { icon: Coins, title: "$2.4M+ in $CLANKER Pools", subtitle: "Growing liquidity depth" },
                { icon: TrendingUp, title: "127.8% Average APR", subtitle: "Outperforming alternatives" },
                { icon: Users, title: "1,247+ Active LPs", subtitle: "Earning passive income" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ scale: 1.06, y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center space-y-3 md:space-y-4 p-6 md:p-8 glass-card rounded-2xl border border-primary/20"
                  style={{ willChange: "transform" }}
                >
                  <div className="p-3 md:p-4 rounded-full bg-primary/20 backdrop-blur-sm">
                    <stat.icon className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
                  </div>
                  <span className="text-white font-semibold text-base md:text-lg text-center">{stat.title}</span>
                  <span className="text-sm text-gray-400">{stat.subtitle}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-20 md:mb-32 lg:mb-40"
        >
          <div className="text-center mb-8 md:mb-12 px-2">
            <Badge className="mb-4 md:mb-6 glass-card text-primary-foreground border-primary/20 px-3 py-1 md:px-4 md:py-2 text-sm">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              Strategic Value Proposition
            </Badge>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white">
              Why Clanker Needs This Platform
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The missing infrastructure layer that transforms $CLANKER from a token into a thriving DeFi ecosystem
            </p>
          </div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                title: "Price Stabilization Through Liquidity",
                description:
                  "Our AI identifies optimal liquidity deployment strategies that reduce price volatility by 47% on average. Deep, well-managed liquidity pools create price stability that attracts institutional capital and builds long-term holder confidence.",
                metric: "47% less volatility",
                icon: Shield,
                gradient: "from-primary/20 to-accent/20",
              },
              {
                title: "Automated Yield Discovery",
                description:
                  "Real-time scanning of all $CLANKER pairs across Base to surface the highest-yield opportunities. Our algorithms analyze 50+ metrics per pool to identify sustainable APRs that reward liquidity providers while strengthening the ecosystem.",
                metric: "50+ metrics analyzed",
                icon: Target,
                gradient: "from-accent/20 to-primary/20",
              },
              {
                title: "Passive Income for Holders",
                description:
                  "Transform $CLANKER holders into active ecosystem participants earning 127.8% average APR. By making yield farming accessible and automated, we increase token utility and create sustainable demand beyond speculation.",
                metric: "127.8% avg APR",
                icon: Coins,
                gradient: "from-primary/20 to-accent/20",
              },
              {
                title: "Ecosystem Growth Engine",
                description:
                  "Every liquidity position deployed through our platform strengthens the entire $CLANKER ecosystem. Better liquidity attracts more traders, more volume generates more fees, and more fees reward liquidity providers—creating a virtuous growth cycle.",
                metric: "3x volume increase",
                icon: Zap,
                gradient: "from-accent/20 to-primary/20",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={scaleIn} whileHover={{ scale: 1.02, y: -5 }}>
                <Card
                  className={`glass-card p-6 md:p-8 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group h-full border border-primary/20 bg-gradient-to-br ${feature.gradient}`}
                >
                  <CardHeader className="pb-3 md:pb-4">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="p-3 md:p-4 rounded-xl bg-primary/30 backdrop-blur-sm group-hover:bg-primary/40 transition-colors duration-300"
                      >
                        <feature.icon className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
                      </motion.div>
                      <Badge className="bg-primary/30 text-primary-foreground border-primary/40 text-xs">
                        {feature.metric}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-white mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-300 text-base md:text-lg leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {isLoadingPools ? (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-20 md:mb-32 lg:mb-40"
          >
            <div className="text-center mb-8 md:mb-12 px-2">
              <Badge className="mb-4 md:mb-6 glass-card text-primary-foreground border-primary/20 px-3 py-1 md:px-4 md:py-2 text-sm">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Live Yield Opportunities
              </Badge>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white">
                Top $CLANKER Pools Right Now
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Real-time yield opportunities in the Clanker ecosystem, ranked by profitability
              </p>
            </div>
            <div className="relative w-full mb-6 md:mb-8">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl md:rounded-3xl" />
                <div className="relative h-[600px] md:h-[540px] rounded-2xl md:rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl p-[1px] bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30" />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          </motion.section>
        ) : pools.length > 0 ? (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-20 md:mb-32 lg:mb-40"
          >
            <div className="text-center mb-8 md:mb-12 px-2">
              <Badge className="mb-4 md:mb-6 glass-card text-primary-foreground border-primary/20 px-3 py-1 md:px-4 md:py-2 text-sm">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Live Yield Opportunities
              </Badge>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white">
                Top $CLANKER Pools Right Now
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Real-time yield opportunities in the Clanker ecosystem, ranked by profitability
              </p>
            </div>

            <FeaturedPoolsCarousel
              pools={pools}
              onDeployClick={(pool) => {
                window.location.href = `/pools?search=${pool.baseToken.symbol}`
              }}
            />
          </motion.section>
        ) : null}

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-16 md:mb-20 lg:mb-24"
        >
          <div className="text-center mb-12 md:mb-14 lg:mb-16 px-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-5 lg:mb-6 text-white">
              Strategic Acquisition Value
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Why this platform is essential infrastructure for Clanker's long-term success
            </p>
          </div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {[
              {
                icon: Lock,
                title: "Liquidity Moat",
                description:
                  "Control the liquidity layer and you control the ecosystem. This platform becomes the default interface for all $CLANKER liquidity management, creating a defensible competitive advantage.",
                badge: "Strategic Asset",
                badgeColor: "primary",
              },
              {
                icon: Users,
                title: "Community Retention",
                description:
                  "Transform passive holders into active ecosystem participants earning yield. Engaged users who earn income are 5x more likely to remain long-term community members.",
                badge: "User Stickiness",
                badgeColor: "accent",
              },
              {
                icon: ArrowUpRight,
                title: "Revenue Generation",
                description:
                  "Built-in monetization through protocol fees on every liquidity deployment. As the ecosystem grows, platform revenue scales automatically without additional overhead.",
                badge: "Sustainable Model",
                badgeColor: "primary",
              },
            ].map((item, index) => (
              <motion.div key={index} variants={scaleIn} whileHover={{ scale: 1.05, y: -10 }}>
                <Card className="glass-card p-8 md:p-10 text-center hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group h-full border border-primary/20">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="p-5 md:p-6 rounded-full bg-primary/20 backdrop-blur-sm w-fit mx-auto mb-6 md:mb-8 group-hover:bg-primary/30 transition-colors duration-300"
                  >
                    <item.icon className="h-10 w-10 md:h-12 md:w-12 text-primary-foreground" />
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">{item.title}</h3>
                  <p className="text-gray-300 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">{item.description}</p>
                  <Badge
                    className={`${
                      item.badgeColor === "accent"
                        ? "bg-accent/20 text-accent-foreground border-accent/30"
                        : "bg-primary/20 text-primary-foreground border-primary/30"
                    } px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-semibold`}
                  >
                    {item.badge}
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center py-12 md:py-16 lg:py-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl" />
          <div className="max-w-4xl mx-auto relative space-y-6 md:space-y-8 px-2">
            <Badge className="mb-4 md:mb-6 glass-card text-primary-foreground border-primary/20 px-3 py-1 md:px-4 md:py-2 text-sm">
              <LiveDataIndicator size="sm" className="mr-2" />
              Ready to Deploy
            </Badge>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 text-white">
              The Future of $CLANKER Liquidity
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12 leading-relaxed">
              Join the platform that's transforming how the Farcaster community earns yield and strengthens the Clanker
              ecosystem
            </p>
            <motion.div
              variants={scaleIn}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="btn-premium text-white shadow-2xl hover:shadow-primary/30 transition-all duration-500 px-8 py-5 md:px-12 md:py-7 text-lg md:text-xl lg:text-2xl font-semibold bg-transparent"
                onClick={() => (window.location.href = "/pools")}
              >
                <TrendingUp className="h-6 w-6 md:h-7 md:w-7 mr-3" />
                Start Earning Yield Today
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <LiquidityAgent
        onDeployRequest={(poolId, baseAmount, quoteAmount, slippage) => {
          console.log("AI Deploy Request:", { poolId, baseAmount, quoteAmount, slippage })
        }}
      />

      <OnboardingModal isOpen={isOnboardingOpen} onClose={closeOnboarding} onComplete={completeOnboarding} />
    </div>
  )
}
