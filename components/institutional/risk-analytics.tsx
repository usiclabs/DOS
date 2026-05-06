"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Shield, AlertTriangle, TrendingDown, Activity, Target, Zap } from "lucide-react"

interface RiskDataPoint {
  date: string
  var95: number
  var99: number
  expectedShortfall: number
  volatility: number
  beta: number
}

interface CorrelationDataPoint {
  asset: string
  correlation: number
  exposure: number
}

interface StressTestResult {
  scenario: string
  impact: number
  probability: number
}

export function RiskAnalytics() {
  const [riskData, setRiskData] = useState<RiskDataPoint[]>([])
  const [correlationData, setCorrelationData] = useState<CorrelationDataPoint[]>([])
  const [stressTestResults, setStressTestResults] = useState<StressTestResult[]>([])

  useEffect(() => {
    // Mock risk analytics data
    const mockRiskData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      var95: -(Math.random() * 5000000 + 2000000),
      var99: -(Math.random() * 8000000 + 4000000),
      expectedShortfall: -(Math.random() * 10000000 + 6000000),
      volatility: Math.random() * 0.3 + 0.1,
      beta: Math.random() * 0.5 + 0.5,
    }))

    const mockCorrelationData = [
      { asset: "ETH", correlation: 0.85, exposure: 45000000 },
      { asset: "BTC", correlation: 0.72, exposure: 32000000 },
      { asset: "DEUS", correlation: 1.0, exposure: 89000000 },
      { asset: "USDC", correlation: 0.15, exposure: 28000000 },
      { asset: "LINK", correlation: 0.68, exposure: 18000000 },
    ]

    const mockStressTests = [
      { scenario: "Market Crash (-50%)", impact: -124000000, probability: 0.05 },
      { scenario: "DeFi Exploit", impact: -45000000, probability: 0.15 },
      { scenario: "Regulatory Shock", impact: -67000000, probability: 0.25 },
      { scenario: "Liquidity Crisis", impact: -89000000, probability: 0.1 },
    ]

    setRiskData(mockRiskData)
    setCorrelationData(mockCorrelationData)
    setStressTestResults(mockStressTests)
  }, [])

  const currentVaR = -3200000
  const riskScore = 7.2
  const portfolioVolatility = 0.185

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">VaR (95%, 1d)</p>
                <p className="text-2xl font-bold text-white">${(Math.abs(currentVaR) / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-red-400">Maximum expected loss</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">Risk Score</p>
                <p className="text-2xl font-bold text-white">{riskScore}/10</p>
                <p className="text-xs text-yellow-400">Moderate Risk</p>
              </div>
              <Shield className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Portfolio Volatility</p>
                <p className="text-2xl font-bold text-white">{(portfolioVolatility * 100).toFixed(1)}%</p>
                <p className="text-xs text-blue-400">30-day annualized</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analytics Tabs */}
      <Tabs defaultValue="var" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="var" className="data-[state=active]:bg-gray-700">
            VaR Analysis
          </TabsTrigger>
          <TabsTrigger value="correlation" className="data-[state=active]:bg-gray-700">
            Correlation
          </TabsTrigger>
          <TabsTrigger value="stress" className="data-[state=active]:bg-gray-700">
            Stress Tests
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="data-[state=active]:bg-gray-700">
            Scenarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="var" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Value at Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={riskData}>
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
                        formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "VaR"]}
                      />
                      <Area type="monotone" dataKey="var95" stroke="#EF4444" fill="url(#varGradient)" strokeWidth={2} />
                      <Area
                        type="monotone"
                        dataKey="var99"
                        stroke="#DC2626"
                        fill="url(#var99Gradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="varGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="var99Gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="text-sm text-gray-400">VaR 95% (1d)</div>
                    <div className="text-xl font-bold text-red-400">
                      ${(Math.abs(currentVaR) / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-xs text-gray-500">1.3% of portfolio</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="text-sm text-gray-400">Expected Shortfall</div>
                    <div className="text-xl font-bold text-red-400">
                      ${(Math.abs(currentVaR * 1.5) / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-xs text-gray-500">Tail risk estimate</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="text-sm text-gray-400">Confidence Level</div>
                    <div className="text-xl font-bold text-green-400">95%</div>
                    <div className="text-xs text-gray-500">Statistical confidence</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Asset Correlation Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlationData.map((asset, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">{asset.asset}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            asset.correlation > 0.8
                              ? "border-red-500/30 text-red-400"
                              : asset.correlation > 0.5
                                ? "border-yellow-500/30 text-yellow-400"
                                : "border-green-500/30 text-green-400"
                          }`}
                        >
                          {asset.correlation > 0.8 ? "High" : asset.correlation > 0.5 ? "Medium" : "Low"} Correlation
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">{asset.correlation.toFixed(2)}</div>
                        <div className="text-xs text-gray-400">${(asset.exposure / 1000000).toFixed(1)}M exposure</div>
                      </div>
                    </div>
                    <Progress value={asset.correlation * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stress" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Stress Test Results</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Run New Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stressTestResults.map((test, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <span className="font-medium text-white">{test.scenario}</span>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                          {(test.probability * 100).toFixed(0)}% probability
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-400">
                          ${(Math.abs(test.impact) / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-xs text-gray-400">
                          {((Math.abs(test.impact) / 247800000) * 100).toFixed(1)}% of portfolio
                        </div>
                      </div>
                    </div>
                    <Progress value={(Math.abs(test.impact) / 247800000) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Monte Carlo Scenarios</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Run Simulation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="text-sm text-gray-400">Simulations Run</div>
                    <div className="text-2xl font-bold text-white">10,000</div>
                    <div className="text-xs text-gray-500">Monte Carlo iterations</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="text-sm text-gray-400">Confidence Interval</div>
                    <div className="text-2xl font-bold text-white">95%</div>
                    <div className="text-xs text-gray-500">Statistical confidence</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="text-sm text-gray-400">Time Horizon</div>
                    <div className="text-2xl font-bold text-white">30d</div>
                    <div className="text-xs text-gray-500">Forecast period</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Scenario Outcomes</h4>
                  {[
                    { scenario: "Best Case (95th percentile)", outcome: "+$45.2M", probability: "5%" },
                    { scenario: "Optimistic (75th percentile)", outcome: "+$18.7M", probability: "25%" },
                    { scenario: "Expected (50th percentile)", outcome: "+$2.1M", probability: "50%" },
                    { scenario: "Pessimistic (25th percentile)", outcome: "-$12.4M", probability: "25%" },
                    { scenario: "Worst Case (5th percentile)", outcome: "-$38.9M", probability: "5%" },
                  ].map((scenario, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-blue-400" />
                          <span className="font-medium text-white">{scenario.scenario}</span>
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                            {scenario.probability} probability
                          </Badge>
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            scenario.outcome.startsWith("+") ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {scenario.outcome}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
