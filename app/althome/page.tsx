"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShaderAnimation } from "@/components/ui/shader-lines"
import { ArrowRight, Rocket } from "lucide-react"
import Link from "next/link"

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
      duration: 0.8,
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
      duration: 0.6,
    },
  },
}

export default function AltHomePage() {
  return (
    <div className="min-h-screen w-full bg-background overflow-hidden flex flex-col">
      {/* Navigation Bar */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg tracking-tight">
            D.O.S
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/swap" className="text-gray-300 hover:text-white transition-colors text-sm">
              Platform
            </Link>
            <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors text-sm">
              Analytics
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Fills remaining viewport */}
      <section className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {/* Background shader effect */}
        <div className="absolute inset-0 z-0">
          <ShaderAnimation />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-5" />

        {/* Content container - Compact and centered */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-6 text-center space-y-6 md:space-y-8">
          {/* Badge */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex justify-center"
          >
            <Badge className="backdrop-blur-lg bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 px-4 py-2 text-xs md:text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Live on Base
            </Badge>
          </motion.div>

          {/* Main Heading - Optimized sizing */}
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent text-balance">
              Liquidity
              <br />
              Reimagined
            </span>
          </motion.h1>

          {/* Subtitle - Condensed */}
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-base md:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto font-light"
          >
            AI-powered liquidity management that outperforms traditional approaches by 3x
          </motion.p>

          {/* Description - Compact */}
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-gray-400 leading-relaxed max-w-xl mx-auto"
          >
            Unlock institutional-grade liquidity management with zero complexity. Advanced automation meets human control.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
          >
            <Link href="/swap">
              <Button
                size="lg"
                className="btn-premium text-white shadow-2xl hover:shadow-accent/30 transition-all duration-500 px-6 py-4 text-base font-semibold w-full sm:w-auto"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Launch Platform
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            <Link href="/analytics">
              <Button
                size="lg"
                variant="outline"
                className="glass-card border-accent/30 text-accent-foreground hover:bg-accent/10 hover:border-accent/50 bg-transparent px-6 py-4 text-base font-semibold transition-all duration-500 w-full sm:w-auto"
              >
                Explore Analytics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators - Compact layout */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-400 pt-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Non-custodial</span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Audited</span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>No KYC</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
