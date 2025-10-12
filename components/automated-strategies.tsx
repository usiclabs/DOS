"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Shield, Zap, Target, Sparkles, ChevronRight, Info, CheckCircle2 } from "lucide-react"
import { DeployModal } from "@/components/deploy-modal"

interface Strategy {
  id: string
  name: string
  description: string
  icon: any
  color: string
  criteria: {
    minApy?: number
    maxVolatility?: number
    minTvl?: number
    deusOnly?: boolean
    priorityDex?: boolean
  }
  riskLevel: "low" | "medium" | "high"
  expectedApy: string
}

const strategies: Strategy[] = [
  {
    id: "max-yield",
    name: "Max Yield",
    description: "Highest APY pools regardless of risk. For experienced DeFi users seeking maximum returns.",
    icon: Zap,
    color: "yellow",
    criteria: { minApy: 20 },
    riskLevel: "high",
    expectedApy: "50-200%",
  },
  {
    id: "balanced",
    name: "Balanced Growth",
    description: "Optimal mix of yield and safety. Moderate volatility with strong APY potential.",
    icon: Target,
    color: "blue",
    criteria: { minApy: 15, maxVolatility: 15, minTvl: 10000 },
    riskLevel: "medium",
    expectedApy: "20-50%",
  },
  {
    id: "conservative",
    name: "Conservative",
    description: "Established pools with high TVL and low volatility. Prioritizes capital preservation.",
    icon: Shield,
    color: "green",
    criteria: { maxVolatility: 8, minTvl: 50000, priorityDex: true },
    riskLevel: "low",
    expectedApy: "10-25%",
  },
  {
    id: "deus-focus",
    name: "DEUS Ecosystem",
    description: "Focus on DEUS paired pools. Support the ecosystem while earning competitive yields.",
    icon: Sparkles,
    color: "orange",
    criteria: { deusOnly: true, minApy: 10 },
    riskLevel: "medium",
    expectedApy: "15-40%",
  },
]

export default function AutomatedStrategies() {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [matchingPools, setMatchingPools] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPool, setSelectedPool] = useState<any | null>(null)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)

  const executeStrategy = async (strategy: Strategy) => {
    setSelectedStrategy(strategy)
    setIsLoading(true)

    // Build query params based on strategy criteria
    const params = new URLSearchParams({
      limit: "10",
      sortBy: "netApy",
      sortOrder: "desc",
      ...(strategy.criteria.minApy && { minApy: strategy.criteria.minApy.toString() }),
      ...(strategy.criteria.maxVolatility && { maxVolatility: strategy.criteria.maxVolatility.toString() }),
      ...(strategy.criteria.minTvl && { minTvl: strategy.criteria.minTvl.toString() }),
      ...(strategy.criteria.deusOnly && { deusOnly: "true" }),
      ...(strategy.criteria.priorityDex && { priorityDexOnly: "true" }),
    })

    try {
      const response = await fetch(`/api/pools?${params}`)
      const data = await response.json()
      setMatchingPools(data.pools || [])
    } catch (error) {
      console.error("[v0] Strategy execution error:", error)
      setMatchingPools([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeploy = (pool: any) => {
    setSelectedPool(pool)
    setIsDeployModalOpen(true)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/20"
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/20"
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20"
    }
  }

  return (
    <>
      <Card className="glass-card border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-accent" />
            Automated Strategies
          </CardTitle>
          <CardDescription>One-click deployment to optimized pool selections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {strategies.map((strategy, index) => {
              const Icon = strategy.icon
              const isSelected = selectedStrategy?.id === strategy.id

              return (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? `border-${strategy.color}-500/50 shadow-lg shadow-${strategy.color}-500/20 bg-${strategy.color}-500/5`
                        : "border-white/10 hover:border-white/20"
                    }`}
                    onClick={() => executeStrategy(strategy)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg bg-${strategy.color}-500/10 border border-${strategy.color}-500/20`}
                          >
                            <Icon className={`h-5 w-5 text-${strategy.color}-400`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{strategy.name}</h3>
                            <Badge className={`text-xs mt-1 ${getRiskColor(strategy.riskLevel)}`}>
                              {strategy.riskLevel.toUpperCase()} RISK
                            </Badge>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className={`h-5 w-5 text-${strategy.color}-400`} />}
                      </div>
                      <p className="text-xs text-gray-300 mb-3">{strategy.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Expected APY</span>
                        <span className="font-semibold text-green-400">{strategy.expectedApy}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="inline-block"
                >
                  <Sparkles className="h-8 w-8 text-accent" />
                </motion.div>
                <p className="text-sm text-gray-300 mt-3">Finding optimal pools...</p>
              </motion.div>
            )}

            {!isLoading && matchingPools.length > 0 && selectedStrategy && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    Top {matchingPools.length} Opportunities
                  </h3>
                  <Badge className="bg-accent/20 text-accent">{selectedStrategy.name}</Badge>
                </div>

                {matchingPools.map((pool, index) => (
                  <motion.div
                    key={pool.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="glass-card p-4 rounded-lg border border-white/10 hover:border-accent/30 transition-all cursor-pointer"
                    onClick={() => handleDeploy(pool)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">
                          {pool.baseToken.symbol}/{pool.quoteToken.symbol}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Badge variant="outline" className="text-xs">
                            {pool.dexId}
                          </Badge>
                          <span>{pool.feeTier}</span>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="text-lg font-bold text-green-400">{pool.netApy.toFixed(2)}%</div>
                        <div className="text-xs text-gray-400">APY</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 border-t border-white/10"
                >
                  <div className="flex items-start gap-2 text-xs text-gray-400">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Click any pool to deploy liquidity. Pools are ranked by profitability score based on APY, TVL, and
                      risk factors.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {!isLoading && matchingPools.length === 0 && selectedStrategy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-400 text-sm"
              >
                No pools match the selected strategy criteria. Try a different strategy.
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <DeployModal pool={selectedPool} isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} />
    </>
  )
}
