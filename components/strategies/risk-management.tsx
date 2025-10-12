"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, TrendingDown, Zap, Settings } from "lucide-react"

const riskMetrics = [
  {
    category: "Portfolio Risk",
    current: 15.2,
    limit: 20.0,
    status: "healthy",
    description: "Overall portfolio volatility",
  },
  {
    category: "Concentration Risk",
    current: 18.5,
    limit: 25.0,
    status: "warning",
    description: "Single asset exposure limit",
  },
  {
    category: "Liquidity Risk",
    current: 8.3,
    limit: 15.0,
    status: "healthy",
    description: "Illiquid position exposure",
  },
  {
    category: "Counterparty Risk",
    current: 22.1,
    limit: 30.0,
    status: "healthy",
    description: "Protocol dependency risk",
  },
]

const riskAlerts = [
  {
    id: 1,
    type: "Position Limit",
    message: "ETH position approaching 20% concentration limit",
    severity: "warning",
    timestamp: "5 minutes ago",
    action: "Consider rebalancing",
  },
  {
    id: 2,
    type: "Volatility Spike",
    message: "DEUS/WETH pool volatility increased by 45%",
    severity: "alert",
    timestamp: "12 minutes ago",
    action: "Review position sizing",
  },
  {
    id: 3,
    type: "Liquidity Drop",
    message: "Available liquidity in Arbitrum pool decreased",
    severity: "info",
    timestamp: "1 hour ago",
    action: "Monitor closely",
  },
]

const automatedControls = [
  {
    name: "Stop Loss",
    enabled: true,
    threshold: "-5%",
    description: "Automatic position closure on losses",
  },
  {
    name: "Position Sizing",
    enabled: true,
    threshold: "Kelly 50%",
    description: "Dynamic position size optimization",
  },
  {
    name: "Correlation Limits",
    enabled: true,
    threshold: "0.8 max",
    description: "Prevent over-correlated positions",
  },
  {
    name: "Drawdown Protection",
    enabled: false,
    threshold: "-10%",
    description: "Portfolio-level drawdown limits",
  },
]

export function RiskManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Management</h2>
          <p className="text-muted-foreground">Comprehensive risk monitoring and automated controls</p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Configure Limits
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-yellow-600">6.8</p>
              <Shield className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-sm text-muted-foreground">Medium risk level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Value at Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-red-600">-$12.4K</p>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground">95% confidence, 1 day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-orange-600">3</p>
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-sm text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Auto Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-green-600">3/4</p>
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Systems active</p>
          </CardContent>
        </Card>
      </div>

      {riskAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Alerts</CardTitle>
            <CardDescription>Active risk notifications requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className={
                    alert.severity === "alert"
                      ? "border-red-200 bg-red-50"
                      : alert.severity === "warning"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-blue-200 bg-blue-50"
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{alert.type}</p>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">Recommended: {alert.action}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            alert.severity === "alert"
                              ? "destructive"
                              : alert.severity === "warning"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {alert.severity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Risk Metrics Dashboard</CardTitle>
          <CardDescription>Current risk levels across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {riskMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{metric.category}</h4>
                    <Badge
                      variant={
                        metric.status === "healthy"
                          ? "default"
                          : metric.status === "warning"
                            ? "secondary"
                            : "destructive"
                      }
                      className={metric.status === "healthy" ? "bg-green-100 text-green-800" : ""}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{metric.current}%</span>
                    <span className="text-muted-foreground"> / {metric.limit}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
                <Progress value={(metric.current / metric.limit) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automated Risk Controls</CardTitle>
          <CardDescription>Configure automatic risk management systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automatedControls.map((control, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${control.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                  <div>
                    <h4 className="font-medium">{control.name}</h4>
                    <p className="text-sm text-muted-foreground">{control.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={control.enabled ? "default" : "outline"}
                    className={control.enabled ? "bg-green-100 text-green-800" : ""}
                  >
                    {control.enabled ? "Active" : "Disabled"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Threshold: {control.threshold}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stress Testing</CardTitle>
            <CardDescription>Portfolio performance under adverse scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Market Crash (-30%)</span>
                <span className="font-semibold text-red-600">-$45.2K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Liquidity Crisis</span>
                <span className="font-semibold text-red-600">-$28.7K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Protocol Hack</span>
                <span className="font-semibold text-red-600">-$15.3K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Regulatory Shock</span>
                <span className="font-semibold text-red-600">-$22.1K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Limits</CardTitle>
            <CardDescription>Current position and exposure limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Max Single Position</span>
                <span className="font-semibold">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Protocol Exposure</span>
                <span className="font-semibold">40%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Daily Loss</span>
                <span className="font-semibold">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Leverage</span>
                <span className="font-semibold">3x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
