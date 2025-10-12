"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, Award, BarChart3 } from "lucide-react"

const performanceMetrics = [
  {
    strategy: "Yield Maximizer Pro",
    totalReturn: 24.8,
    monthlyReturn: 2.1,
    sharpeRatio: 1.85,
    maxDrawdown: -3.2,
    winRate: 78.5,
    status: "active",
  },
  {
    strategy: "Risk Parity DeFi",
    totalReturn: 18.4,
    monthlyReturn: 1.6,
    sharpeRatio: 2.12,
    maxDrawdown: -2.1,
    winRate: 82.3,
    status: "active",
  },
  {
    strategy: "Momentum Arbitrage",
    totalReturn: 31.2,
    monthlyReturn: 2.8,
    sharpeRatio: 1.67,
    maxDrawdown: -5.8,
    winRate: 71.2,
    status: "paused",
  },
  {
    strategy: "Stable Yield Focus",
    totalReturn: 12.6,
    monthlyReturn: 1.1,
    sharpeRatio: 2.45,
    maxDrawdown: -1.4,
    winRate: 89.7,
    status: "active",
  },
]

const benchmarkComparison = [
  { metric: "Total Return", strategy: 24.8, benchmark: 18.2, outperformance: 6.6 },
  { metric: "Volatility", strategy: 12.4, benchmark: 16.8, outperformance: -4.4 },
  { metric: "Sharpe Ratio", strategy: 1.85, benchmark: 1.32, outperformance: 0.53 },
  { metric: "Max Drawdown", strategy: -3.2, benchmark: -8.7, outperformance: 5.5 },
]

export function PerformanceAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        <p className="text-muted-foreground">Comprehensive strategy performance analysis and benchmarking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Portfolio Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-green-600">+24.8%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">YTD performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">1.85</p>
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-purple-600">78.5%</p>
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-muted-foreground">Profitable trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-red-600">-3.2%</p>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground">Peak to trough</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Strategy Performance Breakdown</CardTitle>
          <CardDescription>Individual strategy metrics and performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceMetrics.map((strategy, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{strategy.strategy}</h4>
                    <Badge
                      variant={strategy.status === "active" ? "default" : "secondary"}
                      className={strategy.status === "active" ? "bg-green-100 text-green-800" : ""}
                    >
                      {strategy.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">+{strategy.totalReturn}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Return</p>
                    <p className="font-semibold">+{strategy.monthlyReturn}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                    <p className="font-semibold">{strategy.sharpeRatio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Drawdown</p>
                    <p className="font-semibold text-red-600">{strategy.maxDrawdown}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="font-semibold">{strategy.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Performance</p>
                    <Progress value={strategy.winRate} className="h-2 mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benchmark Comparison</CardTitle>
          <CardDescription>Performance vs DeFi market benchmark (DeFi Pulse Index)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarkComparison.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{item.metric}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Strategy: {item.strategy}%</span>
                      <span>Benchmark: {item.benchmark}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={item.outperformance > 0 ? "default" : "destructive"}
                    className={item.outperformance > 0 ? "bg-green-100 text-green-800" : ""}
                  >
                    {item.outperformance > 0 ? "+" : ""}
                    {item.outperformance}%
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.outperformance > 0 ? "Outperforming" : "Underperforming"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
            <CardDescription>Portfolio risk analysis and volatility measures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Value at Risk (95%)</span>
                <span className="font-semibold">-2.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Expected Shortfall</span>
                <span className="font-semibold">-4.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Beta (vs DeFi market)</span>
                <span className="font-semibold">0.78</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Correlation</span>
                <span className="font-semibold">0.65</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tracking Error</span>
                <span className="font-semibold">8.4%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Return Attribution</CardTitle>
            <CardDescription>Sources of portfolio returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Yield Farming</span>
                <span className="font-semibold text-green-600">+12.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Arbitrage</span>
                <span className="font-semibold text-green-600">+8.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Liquidity Mining</span>
                <span className="font-semibold text-green-600">+5.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Asset Appreciation</span>
                <span className="font-semibold text-green-600">+3.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Transaction Costs</span>
                <span className="font-semibold text-red-600">-5.0%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
