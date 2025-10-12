"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Shield, AlertTriangle, TrendingDown, Settings, Zap } from "lucide-react"

interface RiskMetrics {
  portfolioValue: number
  totalExposure: number
  maxDrawdown: number
  sharpeRatio: number
  var95: number // Value at Risk 95%
  marginUtilization: number
  liquidationRisk: "low" | "medium" | "high"
}

export function RiskManager() {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    portfolioValue: 15420,
    totalExposure: 8750,
    maxDrawdown: -12.5,
    sharpeRatio: 1.85,
    var95: -890,
    marginUtilization: 65,
    liquidationRisk: "low",
  })

  const [autoStopLoss, setAutoStopLoss] = useState(true)
  const [maxPositionSize, setMaxPositionSize] = useState("25")
  const [maxDailyLoss, setMaxDailyLoss] = useState("500")
  const [riskAlerts, setRiskAlerts] = useState(true)

  const exposurePercentage = (riskMetrics.totalExposure / riskMetrics.portfolioValue) * 100

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-400 border-green-500/30"
      case "medium":
        return "text-yellow-400 border-yellow-500/30"
      case "high":
        return "text-red-400 border-red-500/30"
      default:
        return "text-gray-400 border-gray-500/30"
    }
  }

  const getProgressColor = (value: number, threshold: number) => {
    if (value < threshold * 0.5) return "bg-green-500"
    if (value < threshold * 0.8) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Risk Management
          </CardTitle>
          <Badge variant="outline" className={getRiskColor(riskMetrics.liquidationRisk)}>
            {riskMetrics.liquidationRisk.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Risk Metrics Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Portfolio Value</span>
                <span className="text-white font-mono">${riskMetrics.portfolioValue.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">Total Exposure</span>
                <span className="text-white font-mono">${riskMetrics.totalExposure.toLocaleString()}</span>
              </div>
              <Progress value={exposurePercentage} className="h-2" />
              <div className="text-xs text-gray-400 mt-1">{exposurePercentage.toFixed(1)}% of portfolio</div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">Margin Utilization</span>
                <span className="text-white font-mono">{riskMetrics.marginUtilization}%</span>
              </div>
              <Progress value={riskMetrics.marginUtilization} className="h-2" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Max Drawdown</span>
                <span className="text-red-400 font-mono">{riskMetrics.maxDrawdown}%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Sharpe Ratio</span>
                <span className="text-green-400 font-mono">{riskMetrics.sharpeRatio}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">VaR (95%)</span>
                <span className="text-red-400 font-mono">${riskMetrics.var95}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Active Alerts
          </h4>

          <div className="space-y-2">
            <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400">High correlation detected between DEUS positions</span>
              </div>
            </div>

            <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400">AI suggests reducing leverage on ETH position</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Risk Controls
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-stop-loss" className="text-sm text-gray-300">
                Auto Stop Loss
              </Label>
              <Switch id="auto-stop-loss" checked={autoStopLoss} onCheckedChange={setAutoStopLoss} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="risk-alerts" className="text-sm text-gray-300">
                Risk Alerts
              </Label>
              <Switch id="risk-alerts" checked={riskAlerts} onCheckedChange={setRiskAlerts} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Max Position Size (%)</Label>
                <Input
                  value={maxPositionSize}
                  onChange={(e) => setMaxPositionSize(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Max Daily Loss ($)</Label>
                <Input
                  value={maxDailyLoss}
                  onChange={(e) => setMaxDailyLoss(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Emergency Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Close All Positions
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
            >
              <Shield className="w-4 h-4 mr-2" />
              Hedge Portfolio
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
