"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { TrendingUp, Droplets, Activity, Sparkles } from "lucide-react"
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

  const topPools = (() => {
    const validPools = pools.filter((pool) => pool.netApy > 0 && pool.liquidity > 1000)

    const deusPools = validPools.filter((pool) => pool.isDeusPool).sort((a, b) => b.netApy - a.netApy)

    const creatorPools = validPools.filter((pool: any) => pool.isCreatorCoin)

    const nonDeusPools = validPools
      .filter((pool: any) => !pool.isDeusPool && !pool.isCreatorCoin)
      .sort((a, b) => b.netApy - a.netApy)

    const selectedDeusPools = deusPools.slice(0, 3)
    const selectedCreatorPools = creatorPools.slice(0, 2)
    const selectedNonDeusPools = nonDeusPools.slice(0, 2)

    return [...selectedDeusPools, ...selectedCreatorPools, ...selectedNonDeusPools]
  })()

  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      handleNext()
    }, 8500) // Increased auto-advance interval from 5000ms to 8500ms for better metric review time
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

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50
    const swipeVelocityThreshold = 500

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      if (info.offset.x > 0) {
        handlePrev()
      } else {
        handleNext()
      }
    }
  }

  if (topPools.length === 0) return null

  const currentPool = topPools[currentIndex]
  const isCreatorCoin = (currentPool as any).isCreatorCoin
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num.toFixed(0)}`
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
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
      scale: 0.95,
    }),
  }

  return (
    <div className="relative w-full mb-6 md:mb-8">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 rounded-2xl md:rounded-3xl" />

        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative h-[600px] md:h-[540px] rounded-2xl md:rounded-3xl overflow-hidden group"
        >
          <div className="absolute inset-0 rounded-2xl md:rounded-3xl p-[1px] bg-gradient-to-r from-orange-500/30 via-red-500/30 to-orange-500/30 group-hover:from-orange-500/50 group-hover:via-red-500/50 group-hover:to-orange-500/50 transition-all duration-700" />

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 160, damping: 30 },
                opacity: { duration: 0.6, ease: "easeInOut" },
                scale: { duration: 0.6, ease: "easeInOut" },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <div className="absolute inset-0">
                {/* Primary background - banner image or blurred token image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${
                      currentPool.bannerImage ||
                      currentPool.tokenImages?.base ||
                      "/placeholder.svg?height=600&width=1200"
                    })`,
                    filter: currentPool.bannerImage ? "blur(12px)" : "blur(50px)",
                    transform: "scale(1.15)",
                    opacity: currentPool.bannerImage ? 0.35 : 0.25,
                  }}
                />
                {/* Gradient overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-6 md:p-10 md:pb-12">
                {/* Top section */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 md:gap-6">
                    <div className="flex items-center -space-x-3 md:-space-x-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="relative w-14 h-14 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-black/50 backdrop-blur-xl bg-white/10 overflow-hidden shadow-2xl shadow-orange-500/20"
                      >
                        <img
                          src={currentPool.tokenImages?.base || "/placeholder.svg?height=96&width=96"}
                          alt={currentPool.baseToken.symbol}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=96&width=96"
                          }}
                        />
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="relative w-14 h-14 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-black/50 backdrop-blur-xl bg-white/10 overflow-hidden shadow-2xl shadow-orange-500/20"
                      >
                        <img
                          src={currentPool.tokenImages?.quote || "/placeholder.svg?height=96&width=96"}
                          alt={currentPool.quoteToken.symbol}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=96&width=96"
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* Pool info */}
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-3"
                      >
                        {currentPool.baseToken.symbol}/{currentPool.quoteToken.symbol}
                      </motion.h3>
                      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 backdrop-blur-sm text-xs md:text-base px-3 py-1 md:px-4 md:py-1.5">
                          {currentPool.dexId.toUpperCase()}
                        </Badge>
                        {isCreatorCoin && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg shadow-purple-500/30 text-xs md:text-base px-3 py-1 md:px-4 md:py-1.5">
                            <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                            Creator Coin
                          </Badge>
                        )}
                        {currentPool.isDeusPool && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/30 text-xs md:text-base px-3 py-1 md:px-4 md:py-1.5">
                            <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                            DEUS Pool
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-white border-white/30 backdrop-blur-sm text-xs md:text-base px-3 py-1 md:px-4 md:py-1.5"
                        >
                          {currentPool.feeTier}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center section - Hero APY */}
                <div className="flex-1 flex items-center justify-center py-6 md:py-8">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center"
                  >
                    <div className="text-sm md:text-lg text-gray-300 mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                      Net APY
                    </div>
                    <motion.div
                      className="text-7xl md:text-[8rem] font-black mb-4 md:mb-6"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                      animate={{
                        textShadow: [
                          "0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.3)",
                          "0 0 35px rgba(74, 222, 128, 0.7), 0 0 70px rgba(74, 222, 128, 0.4)",
                          "0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.3)",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                      <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                        {currentPool.netApy.toFixed(1)}%
                      </span>
                    </motion.div>
                    <p className="text-gray-300 text-sm md:text-xl font-medium px-4">
                      Earn fees while providing liquidity
                    </p>
                  </motion.div>
                </div>

                {/* Bottom section - Metrics and CTA */}
                <div className="space-y-4 md:space-y-5">
                  <div className="grid grid-cols-3 gap-3 md:gap-6">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="backdrop-blur-xl bg-white/5 rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/10 hover:border-orange-500/50 hover:bg-white/10 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-500 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-xs md:text-sm mb-1 md:mb-2">
                        <Droplets className="w-3.5 h-3.5 md:w-5 md:h-5" />
                        <span>TVL</span>
                      </div>
                      <div className="text-lg md:text-3xl font-bold text-white truncate">
                        {formatNumber(currentPool.liquidity)}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="backdrop-blur-xl bg-white/5 rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/10 hover:border-orange-500/50 hover:bg-white/10 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-500 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-xs md:text-sm mb-1 md:mb-2">
                        <Activity className="w-3.5 h-3.5 md:w-5 md:h-5" />
                        <span>24h Vol</span>
                      </div>
                      <div className="text-lg md:text-3xl font-bold text-white truncate">
                        {formatNumber(currentPool.volume24h)}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="backdrop-blur-xl bg-white/5 rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/10 hover:border-green-500/50 hover:bg-white/10 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-500 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-xs md:text-sm mb-1 md:mb-2">
                        <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5" />
                        <span>Fee APR</span>
                      </div>
                      <div className="text-lg md:text-3xl font-bold text-green-400 truncate">
                        {currentPool.feeApr.toFixed(1)}%
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Button
                      size="lg"
                      onClick={handleDeploy}
                      className="relative w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base md:text-xl h-14 md:h-16 rounded-xl md:rounded-2xl shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/80 transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] group"
                    >
                      <span className="relative flex items-center justify-center">
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                        Deploy Liquidity Now
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 md:gap-3 mt-5 md:mt-8">
        {topPools.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => handleDotClick(index)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`h-2 md:h-2.5 rounded-full transition-all duration-400 ${
              index === currentIndex
                ? "bg-gradient-to-r from-orange-500 to-red-500 w-8 md:w-10 shadow-lg shadow-orange-500/50"
                : "bg-white/40 w-2 md:w-2.5 hover:bg-white/60 hover:w-4 md:hover:w-5"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
