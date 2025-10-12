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
import { TrendingUp, TrendingDown, DollarSign, Target, Download } from "lucide-react"

export function PortfolioOverview() {
  const [timeframe, setTimeframe] = useState("1M")
  const [portfolioData, setPortfolioData] = useState([])
  const [allocationData, setAllocationData] = useState([])

  useEffect(() => {
    // Mock portfolio performance data
    const mockPortfolioData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalValue: 247800000 + Math.random() * 10000000 - 5000000,
      pnl: (Math.random() - 0.5) * 2000000,
      sharpeRatio: 1.2 + Math.random() * 0.8,
      maxDrawdown: -(Math.random() * 15),
    }))

    const mockAllocationData = [
      { name: "DeFi Protocols", value: 35, amount: 86730000, color: "#3B82F6" },
      { name: "Yield Farming", value: 28, amount: 69384000, color: "#10B981" },
      { name: "Liquidity Mining", value: 20, amount: 49560000, color: "#8B5CF6" },
      { name: "Arbitrage", value: 12, amount: 29736000, color: "#F59E0B" },
      { name: "Cash/Stables", value: 5, amount: 12390000, color: "#6B7280" },
    ]

    setPortfolioData(mockPortfolioData)
    setAllocationData(mockAllocationData)
  }, [timeframe])

  const currentValue = 247800000
  const dayChange = 3240000
  const dayChangePercent = (dayChange / currentValue) * 100

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Portfolio Performance</CardTitle>
              <div className="flex gap-2">
                {["1W", "1M", "3M", "1Y"].map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe(period)}
                    className={timeframe === period ? "bg-blue-600 hover:bg-blue-700" : "text-gray-400"}
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
                  <div className="text-3xl font-bold text-white">${(currentValue / 1000000).toFixed(1)}M</div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        dayChange >= 0 ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"
                      }
                    >
                      {dayChange >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {dayChange >= 0 ? "+" : ""}${(dayChange / 1000000).toFixed(2)}M (
                      {dayChangePercent >= 0 ? "+" : ""}
                      {dayChangePercent.toFixed(2)}%)
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioData}>
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
                      formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Portfolio Value"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalValue"
                      stroke="#3B82F6"
                      fill="url(#portfolioGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
            <CardTitle className="text-lg font-semibold">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${value}% ($${(props.payload.amount / 1000000).toFixed(1)}M)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {allocationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{item.value}%</div>
                      <div className="text-gray-400 text-xs">${(item.amount / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sharpe Ratio</p>
                <p className="text-xl font-bold text-white">1.85</p>
                <p className="text-xs text-green-400">Excellent</p>
              </div>
              <Target className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Max Drawdown</p>
                <p className="text-xl font-bold text-white">-8.2%</p>
                <p className="text-xs text-green-400">Low Risk</p>
              </div>
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Alpha (vs Market)</p>
                <p className="text-xl font-bold text-white">+4.7%</p>
                <p className="text-xs text-green-400">Outperforming</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Beta</p>
                <p className="text-xl font-bold text-white">0.73</p>
                <p className="text-xs text-blue-400">Low Correlation</p>
              </div>
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Top Performing Strategies</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "DEUS Yield Optimization", aum: 45200000, return: 18.7, risk: "Medium", status: "Active" },
              { name: "Multi-Chain Arbitrage", aum: 32100000, return: 15.2, risk: "Low", status: "Active" },
              { name: "LP Token Farming", aum: 28900000, return: 22.1, risk: "High", status: "Active" },
              { name: "Stable Coin Strategies", aum: 19800000, return: 8.9, risk: "Low", status: "Active" },
            ].map((strategy, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-white">{strategy.name}</h4>
                      <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                        {strategy.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          strategy.risk === "Low"
                            ? "border-green-500/30 text-green-400"
                            : strategy.risk === "Medium"
                              ? "border-yellow-500/30 text-yellow-400"
                              : "border-red-500/30 text-red-400"
                        }`}
                      >
                        {strategy.risk} Risk
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-400">
                      <span>AUM: ${(strategy.aum / 1000000).toFixed(1)}M</span>
                      <span>30d Return: +{strategy.return}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-400">+{strategy.return}%</div>
                    <div className="text-xs text-gray-400">30 days</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
