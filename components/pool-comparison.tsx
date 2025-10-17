"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, TrendingDown, Zap, X } from "lucide-react"
import { motion } from "framer-motion"

interface Pool {
  id: string
  baseToken: { symbol: string }
  quoteToken: { symbol: string }
  netApy: number
  feeApr: number
  liquidity: number
  volume24h: number
  volatility: number
  dexId: string
  feeTier: string
}

interface PoolComparisonProps {
  pools: Pool[]
  isOpen: boolean
  onClose: () => void
}

export function PoolComparison({ pools, isOpen, onClose }: PoolComparisonProps) {
  if (pools.length < 2) return null

  const [pool1, pool2] = pools

  const compareMetric = (val1: number, val2: number) => {
    if (val1 > val2) return { winner: 1, diff: ((val1 - val2) / val2) * 100 }
    if (val2 > val1) return { winner: 2, diff: ((val2 - val1) / val1) * 100 }
    return { winner: 0, diff: 0 }
  }

  const calculateProfitScore = (pool: Pool) => {
    return pool.netApy * 0.5 + pool.feeApr * 0.3 - pool.volatility * 0.2
  }

  const pool1Score = calculateProfitScore(pool1)
  const pool2Score = calculateProfitScore(pool2)

  const apyComparison = compareMetric(pool1.netApy, pool2.netApy)
  const aprComparison = compareMetric(pool1.feeApr, pool2.feeApr)
  const tvlComparison = compareMetric(pool1.liquidity, pool2.liquidity)
  const volumeComparison = compareMetric(pool1.volume24h, pool2.volume24h)
  const volatilityComparison = compareMetric(pool2.volatility, pool1.volatility) // Lower is better
  const scoreComparison = compareMetric(pool1Score, pool2Score)

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl glass-card border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-accent" />
              Pool Comparison
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Pool 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card
              className={`glass-card ${scoreComparison.winner === 1 ? "border-green-500/50 shadow-lg shadow-green-500/20" : "border-white/10"}`}
            >
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg mb-2">
                    {pool1.baseToken.symbol}/{pool1.quoteToken.symbol}
                  </h3>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {pool1.dexId}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {pool1.feeTier}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <Badge
                      variant={scoreComparison.winner === 1 ? "default" : "secondary"}
                      className={
                        scoreComparison.winner === 1 ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : ""
                      }
                    >
                      Score: {pool1Score.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <MetricCard
                    label="Net APY"
                    value={`${pool1.netApy.toFixed(2)}%`}
                    isWinner={apyComparison.winner === 1}
                  />
                  <MetricCard
                    label="Fee APR"
                    value={`${pool1.feeApr.toFixed(2)}%`}
                    isWinner={aprComparison.winner === 1}
                  />
                  <MetricCard label="TVL" value={formatNumber(pool1.liquidity)} isWinner={tvlComparison.winner === 1} />
                  <MetricCard
                    label="24h Volume"
                    value={formatNumber(pool1.volume24h)}
                    isWinner={volumeComparison.winner === 1}
                  />
                  <MetricCard
                    label="Volatility"
                    value={`${pool1.volatility.toFixed(1)}%`}
                    isWinner={volatilityComparison.winner === 1}
                    lowerIsBetter
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comparison Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <ArrowRight className="h-8 w-8 text-accent" />
            </motion.div>
            <div className="space-y-4 text-center w-full">
              <ComparisonDiff label="APY" comparison={apyComparison} />
              <ComparisonDiff label="APR" comparison={aprComparison} />
              <ComparisonDiff label="TVL" comparison={tvlComparison} />
              <ComparisonDiff label="Volume" comparison={volumeComparison} />
              <ComparisonDiff label="Volatility" comparison={volatilityComparison} lowerIsBetter />
            </div>
          </motion.div>

          {/* Pool 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card
              className={`glass-card ${scoreComparison.winner === 2 ? "border-green-500/50 shadow-lg shadow-green-500/20" : "border-white/10"}`}
            >
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg mb-2">
                    {pool2.baseToken.symbol}/{pool2.quoteToken.symbol}
                  </h3>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {pool2.dexId}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {pool2.feeTier}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <Badge
                      variant={scoreComparison.winner === 2 ? "default" : "secondary"}
                      className={
                        scoreComparison.winner === 2 ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : ""
                      }
                    >
                      Score: {pool2Score.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <MetricCard
                    label="Net APY"
                    value={`${pool2.netApy.toFixed(2)}%`}
                    isWinner={apyComparison.winner === 2}
                  />
                  <MetricCard
                    label="Fee APR"
                    value={`${pool2.feeApr.toFixed(2)}%`}
                    isWinner={aprComparison.winner === 2}
                  />
                  <MetricCard label="TVL" value={formatNumber(pool2.liquidity)} isWinner={tvlComparison.winner === 2} />
                  <MetricCard
                    label="24h Volume"
                    value={formatNumber(pool2.volume24h)}
                    isWinner={volumeComparison.winner === 2}
                  />
                  <MetricCard
                    label="Volatility"
                    value={`${pool2.volatility.toFixed(1)}%`}
                    isWinner={volatilityComparison.winner === 2}
                    lowerIsBetter
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg"
        >
          <div className="text-center">
            <h4 className="font-semibold text-accent mb-2">Recommendation</h4>
            <p className="text-sm text-gray-300">
              {scoreComparison.winner === 1
                ? `${pool1.baseToken.symbol}/${pool1.quoteToken.symbol} offers better overall value with ${scoreComparison.diff.toFixed(1)}% higher profit score`
                : scoreComparison.winner === 2
                  ? `${pool2.baseToken.symbol}/${pool2.quoteToken.symbol} offers better overall value with ${scoreComparison.diff.toFixed(1)}% higher profit score`
                  : "Both pools have similar profit potential"}
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

function MetricCard({
  label,
  value,
  isWinner,
  lowerIsBetter = false,
}: {
  label: string
  value: string
  isWinner: boolean
  lowerIsBetter?: boolean
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-lg border p-3 transition-all duration-300 ${
        isWinner ? "border-green-500/50 bg-green-500/10 shadow-lg shadow-green-500/20" : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400">{label}</div>
          <div className={`text-lg font-semibold ${isWinner ? "text-green-400" : ""}`}>{value}</div>
        </div>
        {isWinner && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function ComparisonDiff({
  label,
  comparison,
  lowerIsBetter = false,
}: {
  label: string
  comparison: { winner: number; diff: number }
  lowerIsBetter?: boolean
}) {
  if (comparison.winner === 0)
    return (
      <div className="p-2 rounded-lg bg-white/5">
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <div className="text-sm text-gray-300">Equal</div>
      </div>
    )

  const isLeftWinner = comparison.winner === 1
  const color = isLeftWinner ? "green" : "red"

  return (
    <div className="p-2 rounded-lg bg-white/5">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="flex items-center justify-center gap-2">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {isLeftWinner ? (
            <TrendingUp className={`h-4 w-4 text-${color}-400`} />
          ) : (
            <TrendingDown className={`h-4 w-4 text-${color}-400`} />
          )}
        </motion.div>
        <span className={`text-sm font-semibold text-${color}-400`}>{comparison.diff.toFixed(1)}%</span>
      </div>
    </div>
  )
}
