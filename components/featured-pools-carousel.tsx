"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { ChevronLeft, ChevronRight, TrendingUp, Droplets, Activity, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PoolData } from "@/lib/pool-data"

interface FeaturedPoolsCarouselProps {
  pools: PoolData[]
  onDeployClick?: (pool: PoolData) => void
}

export function FeaturedPoolsCarousel({ pools, onDeployClick }: FeaturedPoolsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 20 })
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 20 })

  // Get top 5 pools by Net APY
  const topPools = pools
    .filter((pool) => pool.netApy > 0 && pool.liquidity > 1000)
    .sort((a, b) => b.netApy - a.netApy)
    .slice(0, 5)

  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [currentIndex, isHovered])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height
    mouseX.set(x * 20)
    mouseY.set(y * 20)
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % topPools.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + topPools.length) % topPools.length)
  }

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const handleDeploy = () => {
    if (onDeployClick && topPools[currentIndex]) {
      onDeployClick(topPools[currentIndex])
    }
  }

  if (topPools.length === 0) return null

  const currentPool = topPools[currentIndex]
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num.toFixed(0)}`
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  }

  return (
    <div className="relative w-full mb-6 md:mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 animate-gradient-shift rounded-2xl md:rounded-3xl" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(235,90,60,0.1),transparent_50%)] animate-pulse" />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.1),transparent_50%)] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(220,38,38,0.1),transparent_50%)] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          mouseX.set(0)
          mouseY.set(0)
        }}
        className="relative h-[500px] md:h-[550px] rounded-2xl md:rounded-3xl overflow-hidden group"
      >
        <div className="absolute inset-0 rounded-2xl md:rounded-3xl p-[2px] bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-gradient-shift blur-xl opacity-50" />
        </div>

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
            className="absolute inset-0"
          >
            <motion.div
              className="absolute inset-0"
              style={{
                x: smoothMouseX,
                y: smoothMouseY,
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center blur-3xl scale-110 opacity-30"
                style={{
                  backgroundImage: `url(${currentPool.tokenImages?.base || "/placeholder.svg?height=500&width=500"})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
            </motion.div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-4 md:p-12">
              {/* Top section */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="flex items-center -space-x-3 md:-space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="relative w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-black/50 backdrop-blur-xl bg-white/10 overflow-hidden shadow-2xl shadow-orange-500/20"
                    >
                      <img
                        src={currentPool.tokenImages?.base || "/placeholder.svg?height=80&width=80"}
                        alt={currentPool.baseToken.symbol}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      className="relative w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-black/50 backdrop-blur-xl bg-white/10 overflow-hidden shadow-2xl shadow-orange-500/20"
                    >
                      <img
                        src={currentPool.tokenImages?.quote || "/placeholder.svg?height=80&width=80"}
                        alt={currentPool.quoteToken.symbol}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Pool info */}
                  <div>
                    <motion.h3
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl md:text-4xl font-bold text-white mb-1 md:mb-2"
                    >
                      {currentPool.baseToken.symbol}/{currentPool.quoteToken.symbol}
                    </motion.h3>
                    <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 backdrop-blur-sm text-xs md:text-sm px-2 py-0.5">
                          {currentPool.dexId.toUpperCase()}
                        </Badge>
                      </motion.div>
                      {currentPool.isDeusPool && (
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.3 }}
                        >
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/30 text-xs md:text-sm px-2 py-0.5">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            >
                              <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                            </motion.div>
                            DEUS Pool
                          </Badge>
                        </motion.div>
                      )}
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.6 }}
                      >
                        <Badge
                          variant="outline"
                          className="text-white border-white/30 backdrop-blur-sm text-xs md:text-sm px-2 py-0.5"
                        >
                          {currentPool.feeTier}
                        </Badge>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center section - Hero APY */}
              <div className="flex-1 flex items-center justify-center py-4 md:py-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-xs md:text-base text-gray-300 mb-2 md:mb-3 flex items-center justify-center gap-1.5 md:gap-2">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                    Net APY
                  </div>
                  <motion.div
                    className="text-6xl md:text-9xl font-black mb-3 md:mb-6 relative"
                    whileHover={{ scale: 1.05 }}
                    animate={{
                      textShadow: [
                        "0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.3), 0 0 60px rgba(74, 222, 128, 0.2)",
                        "0 0 30px rgba(74, 222, 128, 0.7), 0 0 60px rgba(74, 222, 128, 0.4), 0 0 90px rgba(74, 222, 128, 0.3)",
                        "0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.3), 0 0 60px rgba(74, 222, 128, 0.2)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  >
                    <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(74,222,128,0.6)]">
                      {currentPool.netApy.toFixed(1)}%
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear", repeatDelay: 2 }}
                    />
                  </motion.div>
                  <p className="text-gray-300 text-xs md:text-lg font-medium px-4">
                    Earn fees while providing liquidity
                  </p>
                </motion.div>
              </div>

              {/* Bottom section - Metrics and CTA */}
              <div className="space-y-3 md:space-y-5">
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="backdrop-blur-xl bg-white/5 rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-white/10 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 hover:bg-white/10 cursor-pointer"
                  >
                    <div className="flex items-center gap-1 md:gap-2 text-gray-400 text-[10px] md:text-sm mb-0.5 md:mb-1">
                      <Droplets className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">TVL</span>
                    </div>
                    <div className="text-base md:text-2xl font-bold text-white truncate">
                      {formatNumber(currentPool.liquidity)}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="backdrop-blur-xl bg-white/5 rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-white/10 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 hover:bg-white/10 cursor-pointer"
                  >
                    <div className="flex items-center gap-1 md:gap-2 text-gray-400 text-[10px] md:text-sm mb-0.5 md:mb-1">
                      <Activity className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">24h Vol</span>
                    </div>
                    <div className="text-base md:text-2xl font-bold text-white truncate">
                      {formatNumber(currentPool.volume24h)}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="backdrop-blur-xl bg-white/5 rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-white/10 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:bg-white/10 cursor-pointer"
                  >
                    <div className="flex items-center gap-1 md:gap-2 text-gray-400 text-[10px] md:text-sm mb-0.5 md:mb-1">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Fee APR</span>
                    </div>
                    <div className="text-base md:text-2xl font-bold text-green-400 truncate">
                      {currentPool.feeApr.toFixed(1)}%
                    </div>
                  </motion.div>
                </div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                  <Button
                    size="lg"
                    onClick={handleDeploy}
                    className="relative w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm md:text-lg h-12 md:h-16 rounded-xl md:rounded-2xl shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear", repeatDelay: 1 }}
                    />
                    <span className="relative flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      </motion.div>
                      Deploy Liquidity Now
                    </span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 backdrop-blur-xl bg-white/10 hover:bg-orange-500/30 border border-white/20 hover:border-orange-500/50 rounded-full w-10 h-10 md:w-12 md:h-12 z-10 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-orange-500/30"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 backdrop-blur-xl bg-white/10 hover:bg-orange-500/30 border border-white/20 hover:border-orange-500/50 rounded-full w-10 h-10 md:w-12 md:h-12 z-10 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-orange-500/30"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </Button>

        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
          {topPools.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => handleDotClick(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-orange-500 to-red-500 w-6 md:w-8 shadow-lg shadow-orange-500/50"
                  : "bg-white/40 w-1.5 md:w-2 hover:bg-white/60 hover:w-3 md:hover:w-4"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
