"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, Award } from "lucide-react"

const attributionData = [
  {
    factor: "Asset Selection",
    contribution: 4.2,
    weight: 35,
    description: "Alpha from individual asset picks",
  },
  {
    factor: "Market Timing",
    contribution: 2.8,
    weight: 25,
    description: "Entry/exit timing decisions",
  },
  {
    factor: "Sector Allocation",
    contribution: 1.9,
    weight: 20,
    description: "DeFi sector weighting strategy",
  },
  {
    factor: "Risk Management",
    contribution: -0.5,
    weight: 15,
    description: "Hedging and position sizing",
  },
  {
    factor: "Transaction Costs",
    contribution: -0.8,
    weight: 5,
    description: "Gas fees and slippage impact",
  },
]

export function PerformanceAttribution() {
  const totalReturn = attributionData.reduce((sum, item) => sum + item.contribution, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance Attribution</h2>
        <p className="text-muted-foreground">Breakdown of return sources and risk factors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-green-600">+{totalReturn.toFixed(1)}%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alpha Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-blue-600">+2.4%</p>
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">vs benchmark</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Information Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">1.85</p>
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attribution Breakdown</CardTitle>
          <CardDescription>Individual factor contributions to portfolio performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attributionData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{item.factor}</h4>
                    <Badge
                      variant={item.contribution >= 0 ? "default" : "destructive"}
                      className={item.contribution >= 0 ? "bg-green-100 text-green-800" : ""}
                    >
                      {item.contribution >= 0 ? "+" : ""}
                      {item.contribution.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {item.contribution >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    {item.weight}% weight
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <Progress value={Math.abs(item.contribution) * 10} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk-Return Analysis</CardTitle>
          <CardDescription>Portfolio efficiency metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
              <p className="text-xl font-bold">2.14</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sortino Ratio</p>
              <p className="text-xl font-bold">3.28</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Drawdown</p>
              <p className="text-xl font-bold text-red-600">-4.2%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Volatility</p>
              <p className="text-xl font-bold">12.8%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
