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

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 pb-24 md:pb-32">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center py-12 md:py-20 lg:py-24"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 backdrop-blur-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-all px-4 py-2 text-sm">
                <Zap className="h-4 w-4 mr-2" />
                Tokenized Stocks On Robinhood Chain
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
            >
              Earn Yield on{" "}
              <span className="bg-gradient-to-r from-accent via-emerald-400 to-accent bg-clip-text text-transparent">
                Real Stocks
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              Provide one-sided liquidity to 16 tokenized stocks on Robinhood Chain using only ETH or USDG. Earn competitive yields with zero complexity.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-base font-semibold"
                onClick={() => (window.location.href = "/stocks")}
              >
                Provide Liquidity
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-accent/30 text-accent hover:bg-accent/10 px-8 py-6 text-base font-semibold"
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 py-12 md:py-20 mb-12 md:mb-20"
        >
          {[
            { icon: DollarSign, label: "Total Liquidity", value: "$5.4B" },
            { icon: TrendingUp, label: "Average APY", value: "17.1%" },
            { icon: BarChart3, label: "Listed Stocks", value: "16" },
          ].map((stat, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="glass-card p-6 md:p-8 text-center border border-white/10 hover:border-accent/30 transition-colors">
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <stat.icon className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
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
          className="py-12 md:py-20"
        >
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Why D.O.S. Stocks
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-300">
              Simple, efficient, and profitable
            </motion.p>
          </div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
            {[
              {
                icon: Zap,
                title: "One-Sided Deposits",
                description: "Deposit only ETH or USDG. No need to manage multiple tokens.",
              },
              {
                icon: TrendingUp,
                title: "High Yields",
                description: "Earn 15-20% APY across diverse tokenized stock positions.",
              },
              {
                icon: Lock,
                title: "Non-Custodial",
                description: "Your keys, your assets. All trades execute on-chain.",
              },
              {
                icon: BarChart3,
                title: "Real-Time Quotes",
                description: "Live stock prices and performance metrics updated continuously.",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="glass-card p-6 md:p-7 border border-white/10 hover:border-accent/30 transition-colors h-full">
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-accent/10 flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm text-gray-300 mt-1">{feature.description}</p>
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
          className="py-16 md:py-24 text-center"
        >
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to start earning?
            </h2>
            <p className="text-lg text-gray-300">
              Browse our collection of tokenized stocks and start providing liquidity today.
            </p>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-base font-semibold"
              onClick={() => (window.location.href = "/stocks")}
            >
              View All Stocks
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
