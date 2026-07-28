"use client"

import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Zap, Lock, BarChart3, DollarSign } from "lucide-react"

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20, mass: 0.5 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <main className="container mx-auto px-4 md:px-6 lg:px-8 pb-24 md:pb-32">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center py-16 md:py-28 lg:py-32"
        >
          <div className="max-w-5xl mx-auto space-y-10">
            <motion.div variants={fadeInUp} className="flex justify-center">
              <Badge className="mb-2 backdrop-blur-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-all px-4 py-2 text-sm font-medium">
                <Zap className="h-4 w-4 mr-2.5" />
                Tokenized Stocks On Robinhood Chain
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight"
            >
              Earn Yield on{" "}
              <span className="bg-gradient-to-r from-accent via-emerald-300 to-accent bg-clip-text text-transparent">
                Real Stocks
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Provide one-sided liquidity to tokenized stocks using only ETH or USDG. Earn 15-20% APY on Robinhood Chain with zero complexity.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
            >
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-10 py-7 text-lg font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all"
                onClick={() => (window.location.href = "/stocks")}
              >
                Start Earning
                <ArrowRight className="h-5 w-5 ml-2.5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-gray-400/30 text-gray-300 hover:bg-white/5 hover:border-accent/50 px-10 py-7 text-lg font-semibold transition-all"
                onClick={() => (window.location.href = "/analytics")}
              >
                View Analytics
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 py-12 md:py-24 mb-16 md:mb-32"
        >
          {[
            { icon: DollarSign, label: "Total Liquidity", value: "$5.4B" },
            { icon: TrendingUp, label: "Average APY", value: "17.1%" },
            { icon: BarChart3, label: "Listed Stocks", value: "16" },
          ].map((stat, index) => (
            <motion.div key={index} variants={fadeInUp} whileHover={{ y: -4 }}>
              <Card className="glass-card p-8 md:p-10 text-center border border-white/8 hover:border-accent/40 transition-all hover:shadow-lg hover:shadow-accent/10 backdrop-blur-xl">
                <CardContent className="space-y-5">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20">
                      <stat.icon className="h-7 w-7 text-accent" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400 mt-2">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="py-12 md:py-24"
        >
          <div className="text-center mb-16 md:mb-20">
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Why Choose D.O.S.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-400 font-light">
              Simple, efficient, and designed for maximum returns
            </motion.p>
          </div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Zap,
                title: "One-Sided Deposits",
                description: "Deposit only ETH or USDG. No need to manage multiple tokens or complex positions.",
              },
              {
                icon: TrendingUp,
                title: "High Yields",
                description: "Earn competitive 15-20% APY across diverse tokenized stock positions.",
              },
              {
                icon: Lock,
                title: "Non-Custodial",
                description: "Your keys, your assets. All transactions execute transparently on-chain.",
              },
              {
                icon: BarChart3,
                title: "Real-Time Quotes",
                description: "Live stock prices and performance metrics updated continuously for informed decisions.",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp} whileHover={{ y: -2 }}>
                <Card className="glass-card p-7 md:p-8 border border-white/8 hover:border-accent/40 transition-all hover:shadow-lg hover:shadow-accent/10 backdrop-blur-xl h-full">
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20 flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm text-gray-400 mt-2 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="py-20 md:py-32 text-center"
        >
          <div className="max-w-3xl mx-auto space-y-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to earn yield?
              </h2>
              <p className="text-xl text-gray-400 font-light">
                Browse our collection of tokenized stocks and start providing liquidity today. It takes less than a minute to get started.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-10 py-7 text-lg font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all"
                onClick={() => (window.location.href = "/stocks")}
              >
                Explore Stocks
                <ArrowRight className="h-5 w-5 ml-2.5" />
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
