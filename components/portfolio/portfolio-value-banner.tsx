"use client"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Wallet, Target, Percent } from "lucide-react"

interface PortfolioSummary {
  totalValue: number
  totalPnl: number
  totalFeesEarned: number
  totalImpermanentLoss: number
  positionCount: number
  avgApr: number
  ethBalance: number
  ethValue: number
  tokenCount: number
}

interface PortfolioResponse {
  summary: PortfolioSummary
  positions: any[]
  tokens: any[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PortfolioValueBannerProps {
  address: string | undefined
}

export function PortfolioValueBanner({ address }: PortfolioValueBannerProps) {
  const { data, error, isLoading, mutate } = useSWR<PortfolioResponse>(
    address ? `/api/portfolio/${address}` : null,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes instead of 30 seconds
      revalidateOnFocus: false, // Don't refetch on window focus
      dedupingInterval: 120000, // Dedupe requests within 2 minutes
      revalidateOnReconnect: false, // Don't refetch on reconnect
    },
  )

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPercent = (num: number) => {
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
  }

  if (!address) return null

  if (isLoading) {
    return (
      <Card className="glass-card backdrop-blur-xl mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2 text-accent" />
            <span className="text-muted-foreground">Loading portfolio data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="glass-card backdrop-blur-xl mb-6 border-red-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-red-500/10">
                <DollarSign className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-red-400">Failed to load portfolio data</p>
                <p className="text-xs text-muted-foreground">Unable to fetch your portfolio value</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              className="glass-card hover:bg-white/10 transition-all duration-300 bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { summary } = data
  const pnlPercentage = summary.totalValue > 0 ? (summary.totalPnl / (summary.totalValue - summary.totalPnl)) * 100 : 0
  const isProfitable = summary.totalPnl >= 0

  return (
    <Card className="glass-card backdrop-blur-xl mb-6 hover:bg-white/5 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Total Portfolio Value */}
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-accent/20 backdrop-blur-sm">
              <DollarSign className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-bold text-white">{formatNumber(summary.totalValue)}</h2>
                <Badge
                  variant="outline"
                  className={
                    isProfitable
                      ? "border-green-500/30 text-green-400 bg-green-500/10"
                      : "border-red-500/30 text-red-400 bg-red-500/10"
                  }
                >
                  {isProfitable ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {formatNumber(Math.abs(summary.totalPnl))} ({formatPercent(pnlPercentage)})
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Wallet className="h-4 w-4 text-accent" />
                <p className="text-xs text-muted-foreground">Positions</p>
              </div>
              <p className="text-lg font-semibold text-white">{summary.positionCount}</p>
            </div>

            <div className="h-12 w-px bg-border"></div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Percent className="h-4 w-4 text-accent" />
                <p className="text-xs text-muted-foreground">Avg APR</p>
              </div>
              <p className="text-lg font-semibold text-accent-foreground">{summary.avgApr.toFixed(1)}%</p>
            </div>

            <div className="h-12 w-px bg-border"></div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Target className="h-4 w-4 text-green-400" />
                <p className="text-xs text-muted-foreground">Fees Earned</p>
              </div>
              <p className="text-lg font-semibold text-green-400">{formatNumber(summary.totalFeesEarned)}</p>
            </div>

            <div className="h-12 w-px bg-border"></div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => mutate()}
              className="hover:bg-white/10 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Stats */}
          <div className="md:hidden flex items-center space-x-3">
            <Badge variant="outline" className="glass-card border-accent/30 text-accent-foreground">
              {summary.positionCount} positions
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => mutate()}
              className="hover:bg-white/10 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Additional Details Row */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">ETH Balance</p>
              <p className="font-medium text-white">{summary.ethBalance.toFixed(4)} ETH</p>
            </div>
            <div>
              <p className="text-muted-foreground">Token Count</p>
              <p className="font-medium text-white">{summary.tokenCount} tokens</p>
            </div>
            <div>
              <p className="text-muted-foreground">IL Impact</p>
              <p className="font-medium text-red-400">-{formatNumber(summary.totalImpermanentLoss)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Net P&L</p>
              <p className={`font-medium ${isProfitable ? "text-green-400" : "text-red-400"}`}>
                {formatNumber(Math.abs(summary.totalPnl))}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
