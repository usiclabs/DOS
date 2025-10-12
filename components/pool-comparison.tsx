"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react"

interface Pool {
  id: string
  name: string
  apr: number
  tvl: number
  volume24h: number
  profitScore: number
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

  const aprComparison = compareMetric(pool1.apr, pool2.apr)
  const tvlComparison = compareMetric(pool1.tvl, pool2.tvl)
  const volumeComparison = compareMetric(pool1.volume24h, pool2.volume24h)
  const scoreComparison = compareMetric(pool1.profitScore, pool2.profitScore)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Pool Comparison</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          {/* Pool 1 */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold">{pool1.name}</h3>
              <Badge variant={scoreComparison.winner === 1 ? "default" : "secondary"}>Score: {pool1.profitScore}</Badge>
            </div>
            <div className="space-y-2">
              <MetricCard label="APR" value={`${pool1.apr.toFixed(2)}%`} isWinner={aprComparison.winner === 1} />
              <MetricCard
                label="TVL"
                value={`$${(pool1.tvl / 1000000).toFixed(2)}M`}
                isWinner={tvlComparison.winner === 1}
              />
              <MetricCard
                label="24h Volume"
                value={`$${(pool1.volume24h / 1000).toFixed(0)}K`}
                isWinner={volumeComparison.winner === 1}
              />
            </div>
          </div>

          {/* Comparison */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="space-y-2 text-center text-sm">
              <ComparisonDiff label="APR" comparison={aprComparison} />
              <ComparisonDiff label="TVL" comparison={tvlComparison} />
              <ComparisonDiff label="Volume" comparison={volumeComparison} />
            </div>
          </div>

          {/* Pool 2 */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold">{pool2.name}</h3>
              <Badge variant={scoreComparison.winner === 2 ? "default" : "secondary"}>Score: {pool2.profitScore}</Badge>
            </div>
            <div className="space-y-2">
              <MetricCard label="APR" value={`${pool2.apr.toFixed(2)}%`} isWinner={aprComparison.winner === 2} />
              <MetricCard
                label="TVL"
                value={`$${(pool2.tvl / 1000000).toFixed(2)}M`}
                isWinner={tvlComparison.winner === 2}
              />
              <MetricCard
                label="24h Volume"
                value={`$${(pool2.volume24h / 1000).toFixed(0)}K`}
                isWinner={volumeComparison.winner === 2}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MetricCard({ label, value, isWinner }: { label: string; value: string; isWinner: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${isWinner ? "border-primary bg-primary/5" : ""}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

function ComparisonDiff({ label, comparison }: { label: string; comparison: { winner: number; diff: number } }) {
  if (comparison.winner === 0) return <div className="text-muted-foreground">Equal {label}</div>

  return (
    <div className="flex items-center gap-1">
      {comparison.winner === 1 ? (
        <TrendingUp className="h-4 w-4 text-green-500" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-500" />
      )}
      <span className={comparison.winner === 1 ? "text-green-500" : "text-red-500"}>{comparison.diff.toFixed(1)}%</span>
    </div>
  )
}
