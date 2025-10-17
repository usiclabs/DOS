"use client"

import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { LiquidityAgent } from "@/components/liquidity-agent"
import { ErrorBoundary } from "@/components/error-boundary"
import { OnboardingModal } from "@/components/onboarding/onboarding-modal"
import { WelcomeBanner } from "@/components/onboarding/welcome-banner"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { useOnboarding } from "@/hooks/use-onboarding"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LiveDataIndicator } from "@/components/live-data-indicator"
import {
  Zap,
  Shield,
  Brain,
  Target,
  Layers,
  BarChart3,
  Rocket,
  Users,
  DollarSign,
  Activity,
  Sparkles,
  Trophy,
} from "lucide-react"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.5,
    },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 12,
      mass: 0.4,
    },
  },
}

export default function HomePage() {
  const { hasCompletedOnboarding, isOnboardingOpen, startOnboarding, completeOnboarding, closeOnboarding } =
    useOnboarding()

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <AIInsightsPanel />

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {!hasCompletedOnboarding && <WelcomeBanner onStartOnboarding={startOnboarding} />}

        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center py-8 md:py-16 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 blur-3xl" />
          <div className="max-w-5xl mx-auto relative">
            <motion.div variants={fadeInUp}>
              <Badge className="mb-8 glass-card text-accent-foreground border-accent/20 hover:border-accent/40 transition-all duration-300 px-4 py-2">
                <LiveDataIndicator size="sm" label="Live on Base" className="mr-2" />
                Base's Most Advanced Liquidity Hub
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">
                DEUS Operating System
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed font-medium"
            >
              AI-powered liquidity management that outperforms the competition by 3x
            </motion.p>

            <motion.p variants={fadeInUp} className="text-lg text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed">
              Join 1,247+ traders earning 127.8% average APR with institutional-grade AI strategies
            </motion.p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
            >
              <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="btn-premium text-white shadow-2xl hover:shadow-accent/25 transition-all duration-300 px-8 py-4 text-lg font-semibold bg-transparent"
                  onClick={() => (window.location.href = "/swap")}
                >
                  <Rocket className="h-5 w-5 mr-3" />
                  Launch Platform
                </Button>
              </motion.div>

              <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-card border-accent/30 text-accent-foreground hover:bg-accent/10 hover:border-accent/50 bg-transparent px-8 py-4 text-lg font-semibold"
                  onClick={() => (window.location.href = "/analytics")}
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  View Analytics
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {[
                { icon: Shield, title: "Audited Smart Contracts", subtitle: "Security first approach" },
                { icon: DollarSign, title: "$2.4M+ TVL Secured", subtitle: "Growing ecosystem" },
                { icon: Users, title: "1,247+ Active Users", subtitle: "Trusted by traders" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center space-y-3 p-6 glass-card rounded-xl"
                  style={{ willChange: "transform" }}
                >
                  <div className="p-3 rounded-full bg-accent/20 backdrop-blur-sm">
                    <stat.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <span className="text-white font-semibold">{stat.title}</span>
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
          className="mb-32"
        >
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Why DEUS Dominates</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Advanced features that put us ahead of the competition in the DeFi space
            </p>
          </div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                badge: "AI-Powered",
                title: "Intelligent Pool Discovery",
                description:
                  "Advanced AI algorithms identify the most profitable opportunities before the market catches on",
                successRate: 94.2,
                detail: "Real-time analysis of 500+ pools with predictive yield modeling and risk assessment",
              },
              {
                icon: Target,
                badge: "Exclusive",
                title: "Exotic Yield Strategies",
                description: "Access to unique liquidity pools and yield farming strategies unavailable elsewhere",
                successRate: 127.8,
                detail:
                  "Clanker integration for meme coin liquidity and exotic pair strategies with automated rebalancing",
                isApr: true,
              },
              {
                icon: Zap,
                badge: "Instant",
                title: "One-Click Deployment",
                description: "Deploy optimized liquidity positions with institutional-grade risk management",
                successRate: 100,
                detail: "Automated slippage protection and MEV-resistant execution with gas optimization",
                time: "<3 seconds",
              },
              {
                icon: Shield,
                badge: "Enterprise",
                title: "Advanced Risk Management",
                description: "Institutional-grade risk assessment and portfolio protection mechanisms",
                successRate: 96,
                detail: "Real-time impermanent loss protection and volatility hedging with automated alerts",
                rating: "A+ Rated",
              },
              {
                icon: Layers,
                badge: "Multi-DEX",
                title: "Omni-Liquidity Access",
                description: "Aggregate liquidity across all major DEXs for optimal execution and yields",
                successRate: 88,
                detail: "Uniswap V3, Aerodrome, BaseSwap, and more integrated with smart routing",
                dexCount: "15+ DEXs",
              },
              {
                icon: Activity,
                badge: "Real-time",
                title: "Live Performance Tracking",
                description: "Comprehensive analytics dashboard with real-time P&L and performance metrics",
                successRate: 100,
                detail: "Advanced charting, alerts, and portfolio optimization tools with mobile notifications",
                frequency: "Real-time",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={scaleIn} whileHover={{ scale: 1.02, y: -5 }}>
                <Card className="glass-card p-8 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 group h-full">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between mb-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="p-4 rounded-xl bg-accent/20 backdrop-blur-sm group-hover:bg-accent/30 transition-colors duration-300"
                      >
                        <feature.icon className="h-8 w-8 text-accent-foreground" />
                      </motion.div>
                      <Badge
                        variant="secondary"
                        className="bg-accent/20 text-accent-foreground border-accent/30 px-3 py-1"
                      >
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl text-white mb-4">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-300 text-lg leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-medium">
                          {feature.isApr
                            ? "Avg APR"
                            : feature.time
                              ? "Deploy Time"
                              : feature.rating
                                ? "Risk Score"
                                : feature.dexCount
                                  ? "DEX Coverage"
                                  : feature.frequency
                                    ? "Update Frequency"
                                    : "Success Rate"}
                        </span>
                        <span className={`font-bold text-lg ${feature.isApr ? "text-green-300" : "text-white"}`}>
                          {feature.time ||
                            feature.rating ||
                            feature.dexCount ||
                            feature.frequency ||
                            `${feature.successRate}${feature.isApr ? "%" : ".2%"}`}
                        </span>
                      </div>
                      <Progress value={feature.successRate} className="h-3 progress-enhanced" />
                      <p className="text-gray-400 leading-relaxed">{feature.detail}</p>
                    </div>
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
          className="mb-32"
        >
          <div className="text-center mb-16">
            <Badge className="mb-4 glass-card text-accent-foreground border-accent/20 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Platform Advantages
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Beyond The Competition</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Features that make D.O.S. the ultimate DeFi platform
            </p>
          </div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 gap-8">
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
                <Card className="glass-card p-8 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 group h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="p-4 rounded-xl bg-accent/20 backdrop-blur-sm group-hover:bg-accent/30 transition-colors duration-300"
                      >
                        <feature.icon className="h-8 w-8 text-accent-foreground" />
                      </motion.div>
                      <LiveDataIndicator size="sm" />
                    </div>
                    <CardTitle className="text-2xl text-white mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-300 text-lg leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-accent/20 text-accent-foreground border-accent/30">{feature.metric}</Badge>
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
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Built Different</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              What sets DEUS apart from every other platform in the DeFi ecosystem
            </p>
          </div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-10">
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
                <Card className="glass-card p-10 text-center hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 group h-full">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="p-6 rounded-full bg-accent/20 backdrop-blur-sm w-fit mx-auto mb-8 group-hover:bg-accent/30 transition-colors duration-300"
                  >
                    <item.icon className="h-12 w-12 text-accent-foreground" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-6 text-white">{item.title}</h3>
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">{item.description}</p>
                  <Badge
                    className={`${
                      item.badgeColor === "green"
                        ? "bg-green-500/20 text-green-200 border-green-500/30"
                        : item.badgeColor === "yellow"
                          ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
                          : "bg-accent/20 text-accent-foreground border-accent/30"
                    } px-4 py-2 text-sm font-semibold`}
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
