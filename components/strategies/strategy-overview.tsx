"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Bot, TrendingUp, Zap, Target, Plus, Settings } from "lucide-react"

interface StrategyCategory {
  name: string
  aum: number
  strategies: number
  avgApy: number
  risk: "low" | "medium" | "high"
  color: string
}

export function StrategyOverview() {
  const [performanceData, setPerformanceData] = useState([])
  const [categoryData, setCategoryData] = useState<StrategyCategory[]>([])
  const [timeframe, setTimeframe] = useState("30d")

  useEffect(() => {
    // Mock performance data
    const mockPerformanceData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalValue: 89400000 + Math.random() * 5000000 - 2500000,
      yield: Math.random() * 2000 + 1000,
      fees: Math.random() * 500 + 200,
    }))

    const mockCategoryData: StrategyCategory[] = [
      {
        name: "Yield Farming",
        aum: 32400000,
        strategies: 5,
        avgApy: 22.4,
        risk: "medium",
        color: "#10B981",
      },
      {
        name: "Liquidity Mining",
        aum: 28900000,
        strategies: 4,
        avgApy: 18.7,
        risk: "low",
        color: "#3B82F6",
      },
      {
        name: "Arbitrage Bots",
        aum: 15600000,
        strategies: 2,
        avgApy: 15.2,
        risk: "low",
        color: "#8B5CF6",
      },
      {
        name: "Delta Neutral",
        aum: 12500000,
        strategies: 1,
        avgApy: 12.8,
        risk: "low",
        color: "#F59E0B",
      },
    ]

    setPerformanceData(mockPerformanceData)
    setCategoryData(mockCategoryData)
  }, [timeframe])

  const totalAUM = categoryData.reduce((sum, cat) => sum + cat.aum, 0)
  const totalStrategies = categoryData.reduce((sum, cat) => sum + cat.strategies, 0)
  const avgAPY = categoryData.reduce((sum, cat) => sum + cat.avgApy * (cat.aum / totalAUM), 0)

  return (
    <div className="space-y-6">
      {/* Strategy Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Strategy Performance</CardTitle>
              <div className="flex gap-2">
                {["7d", "30d", "90d", "1y"].map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe(period)}
                    className={timeframe === period ? "bg-green-600 hover:bg-green-700" : "text-gray-400"}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-3xl font-bold text-white">${(totalAUM / 1000000).toFixed(1)}M</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +24.5% MTD
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                      formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Total Value"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalValue"
                      stroke="#10B981"
                      fill="url(#strategyGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="strategyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Strategy Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="aum"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `$${(value / 1000000).toFixed(1)}M`,
                        props.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="text-gray-300">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{category.avgApy.toFixed(1)}%</div>
                      <div className="text-gray-400 text-xs">${(category.aum / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryData.map((category, index) => (
          <Card key={index} className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    category.risk === "low"
                      ? "border-green-500/30 text-green-400"
                      : category.risk === "medium"
                        ? "border-yellow-500/30 text-yellow-400"
                        : "border-red-500/30 text-red-400"
                  }`}
                >
                  {category.risk.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-white">{category.name}</h3>
                <div className="text-2xl font-bold text-green-400">{category.avgApy.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">APY</div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{category.strategies} strategies</span>
                  <span>${(category.aum / 1000000).toFixed(1)}M AUM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Performing Strategies */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Top Performing Strategies</CardTitle>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Strategy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "DEUS Yield Maximizer",
                type: "Yield Farming",
                apy: 28.4,
                aum: 18200000,
                risk: "Medium",
                status: "Active",
                performance: "+15.2%",
              },
              {
                name: "Multi-Chain Arbitrage",
                type: "Arbitrage",
                apy: 19.7,
                aum: 12800000,
                risk: "Low",
                status: "Active",
                performance: "+12.8%",
              },
              {
                name: "Stable Yield Optimizer",
                type: "Delta Neutral",
                apy: 16.3,
                aum: 15600000,
                risk: "Low",
                status: "Active",
                performance: "+8.9%",
              },
              {
                name: "LP Token Compounder",
                type: "Liquidity Mining",
                apy: 24.1,
                aum: 9400000,
                risk: "Medium",
                status: "Active",
                performance: "+18.7%",
              },
            ].map((strategy, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-white">{strategy.name}</h4>
                      <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                        {strategy.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                        {strategy.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          strategy.risk === "Low"
                            ? "border-green-500/30 text-green-400"
                            : "border-yellow-500/30 text-yellow-400"
                        }`}
                      >
                        {strategy.risk} Risk
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span>AUM: ${(strategy.aum / 1000000).toFixed(1)}M</span>
                      <span>30d Performance: {strategy.performance}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-green-400">{strategy.apy}%</div>
                    <div className="text-xs text-gray-400">Current APY</div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-4">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-amber-900/20 border-blue-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            AI Strategy Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Optimization Opportunity</span>
              </div>
              <p className="text-sm text-gray-300">
                Consider rebalancing DEUS Yield Maximizer to capture 3.2% additional APY in current market conditions.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">New Opportunity</span>
              </div>
              <p className="text-sm text-gray-300">
                High-yield farming opportunity detected on Arbitrum with 31.5% APY and low impermanent loss risk.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Market Trend</span>
              </div>
              <p className="text-sm text-gray-300">
                Liquidity mining rewards increasing across Base ecosystem. Consider increasing allocation by 15%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
