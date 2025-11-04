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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LiveDataIndicator } from "@/components/live-data-indicator"
import useSWR from "swr"
import type { PoolData } from "@/lib/pool-data"
import { Shield, Brain, BarChart3, Rocket, Users, DollarSign, Sparkles, Trophy } from "lucide-react"

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
      dedupingInterval: 300000, // Dedupe for 5 minutes instead of 1 minute
      refreshInterval: 600000, // Refresh every 10 minutes
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
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 blur-3xl" />
          <div className="max-w-5xl mx-auto relative space-y-6 md:space-y-8 lg:space-y-10">
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 md:mb-8 lg:mb-10 backdrop-blur-lg bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
                <LiveDataIndicator size="sm" label="Live on Base" className="mr-1.5 md:mr-2" />
                <span className="text-xs md:text-sm">Base's Most Advanced Liquidity Hub</span>
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6 md:mb-8 lg:mb-10 text-white leading-tight tracking-tight px-2"
            >
              <span className="bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">
                DEUS Operating System
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-2xl lg:text-3xl text-gray-300 mb-4 md:mb-6 lg:mb-8 max-w-4xl mx-auto leading-relaxed font-medium px-2"
            >
              AI-powered liquidity management that outperforms the competition by 3x
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg lg:text-xl text-gray-400 mb-12 md:mb-16 lg:mb-20 max-w-3xl mx-auto leading-relaxed px-2"
            >
              Join 1,247+ traders earning 127.8% average APR with institutional-grade AI strategies
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
                  className="btn-premium text-white shadow-2xl hover:shadow-accent/30 transition-all duration-500 px-6 py-4 md:px-10 md:py-6 text-base md:text-lg lg:text-xl font-semibold bg-transparent w-full sm:w-auto min-h-[48px]"
                  onClick={() => (window.location.href = "/swap")}
                >
                  <Rocket className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  Launch Platform
                </Button>
              </motion.div>

              <motion.div variants={scaleIn} whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-card border-accent/30 text-accent-foreground hover:bg-accent/10 hover:border-accent/50 bg-transparent px-6 py-4 md:px-10 md:py-6 text-base md:text-lg lg:text-xl font-semibold transition-all duration-500 w-full sm:w-auto min-h-[48px]"
                  onClick={() => (window.location.href = "/analytics")}
                >
                  <BarChart3 className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  View Analytics
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
                { icon: Shield, title: "Audited Smart Contracts", subtitle: "Security first approach" },
                { icon: DollarSign, title: "$2.4M+ TVL Secured", subtitle: "Growing ecosystem" },
                { icon: Users, title: "1,247+ Active Users", subtitle: "Trusted by traders" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ scale: 1.06, y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center space-y-3 md:space-y-4 p-6 md:p-8 glass-card rounded-2xl"
                  style={{ willChange: "transform" }}
                >
                  <div className="p-3 md:p-4 rounded-full bg-accent/20 backdrop-blur-sm">
                    <stat.icon className="h-6 w-6 md:h-7 md:w-7 text-accent-foreground" />
                  </div>
                  <span className="text-white font-semibold text-base md:text-lg">{stat.title}</span>
                  <span className="text-sm text-gray-400">{stat.subtitle}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
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
              <Badge className="mb-4 md:mb-6 glass-card text-accent-foreground border-accent/20 px-3 py-1 md:px-4 md:py-2 text-sm">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Top LP Opportunities
              </Badge>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white">
                Featured Liquidity Pools
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Discover the highest-yielding liquidity opportunities on Base chain
              </p>
            </div>
            {/* Loading skeleton */}
            <div className="relative w-full mb-6 md:mb-8">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 rounded-2xl md:rounded-3xl" />
                <div className="relative h-[600px] md:h-[540px] rounded-2xl md:rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl p-[1px] bg-gradient-to-r from-orange-500/30 via-red-500/30 to-orange-500/30" />
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
              <Badge className="mb-4 md:mb-6 glass-card text-accent-foreground border-accent/20 px-3 py-1 md:px-4 md:py-2 text-sm">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Top LP Opportunities
              </Badge>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white">
                Featured Liquidity Pools
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Discover the highest-yielding liquidity opportunities on Base chain
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
          className="mb-20 md:mb-32 lg:mb-40"
        >
          <div className="text-center mb-8 md:mb-12 px-2">
            <Badge className="mb-4 md:mb-6 glass-card text-accent-foreground border-accent/20 px-3 py-1 md:px-4 md:py-2 text-sm">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              Platform Advantages
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-5 lg:mb-6 text-white">
              Beyond The Competition
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Features that make D.O.S. the ultimate DeFi platform
            </p>
          </div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                title: "Real-Time AI Insights",
                description: "Get instant notifications about profitable opportunities before anyone else",
                metric: "94% accuracy",
                icon: Brain,
              },
              {
                title: "Social Trading",
                description: "Copy strategies from top performers and build your reputation",
                metric: "1,247 traders",
                icon: Users,
              },
              {
                title: "Gamified Experience",
                description: "Earn XP, unlock achievements, and compete on leaderboards",
                metric: "Level up system",
                icon: Trophy,
              },
              {
                title: "Advanced Analytics",
                description: "Professional-grade charts and metrics for data-driven decisions",
                metric: "Real-time data",
                icon: BarChart3,
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={scaleIn} whileHover={{ scale: 1.02, y: -5 }}>
                <Card className="glass-card p-6 md:p-8 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 group h-full">
                  <CardHeader className="pb-3 md:pb-4">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="p-3 md:p-4 rounded-xl bg-accent/20 backdrop-blur-sm group-hover:bg-accent/30 transition-colors duration-300"
                      >
                        <feature.icon className="h-7 w-7 md:h-8 md:w-8 text-accent-foreground" />
                      </motion.div>
                      <LiveDataIndicator size="sm" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-white mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-300 text-base md:text-lg leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-sm">
                      {feature.metric}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-16 md:mb-20 lg:mb-24"
        >
          <div className="text-center mb-12 md:mb-14 lg:mb-16 px-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-5 lg:mb-6 text-white">
              Built Different
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              What sets DEUS apart from every other platform in the DeFi ecosystem
            </p>
          </div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {[
              {
                icon: Brain,
                title: "AI-First Architecture",
                description:
                  "Every decision powered by machine learning algorithms trained on billions of data points from across DeFi",
                badge: "Patent Pending",
                badgeColor: "accent",
              },
              {
                icon: Shield,
                title: "Institutional Security",
                description:
                  "Bank-grade security protocols with multi-signature wallets and comprehensive insurance coverage",
                badge: "Audited",
                badgeColor: "green",
              },
              {
                icon: Rocket,
                title: "Unmatched Performance",
                description:
                  "127.8% average APR with 94.2% success rate - numbers that speak for themselves in the market",
                badge: "Market Leading",
                badgeColor: "yellow",
              },
            ].map((item, index) => (
              <motion.div key={index} variants={scaleIn} whileHover={{ scale: 1.05, y: -10 }}>
                <Card className="glass-card p-8 md:p-10 text-center hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 group h-full">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="p-5 md:p-6 rounded-full bg-accent/20 backdrop-blur-sm w-fit mx-auto mb-6 md:mb-8 group-hover:bg-accent/30 transition-colors duration-300"
                  >
                    <item.icon className="h-10 w-10 md:h-12 md:w-12 text-accent-foreground" />
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">{item.title}</h3>
                  <p className="text-gray-300 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">{item.description}</p>
                  <Badge
                    className={`${
                      item.badgeColor === "green"
                        ? "bg-green-500/20 text-green-200 border-green-500/30"
                        : item.badgeColor === "yellow"
                          ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
                          : "bg-accent/20 text-accent-foreground border-accent/30"
                    } px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-semibold`}
                  >
                    {item.badge}
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
