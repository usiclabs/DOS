"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Droplets, AlertTriangle, TrendingUp, Clock } from "lucide-react"

const liquidityMetrics = [
  {
    asset: "ETH",
    totalLiquidity: "$45.2M",
    availableLiquidity: "$38.7M",
    utilizationRate: 85.6,
    avgSlippage: "0.12%",
    status: "healthy",
  },
  {
    asset: "USDC",
    totalLiquidity: "$67.8M",
    availableLiquidity: "$52.1M",
    utilizationRate: 76.8,
    avgSlippage: "0.08%",
    status: "healthy",
  },
  {
    asset: "WBTC",
    totalLiquidity: "$28.4M",
    availableLiquidity: "$19.2M",
    utilizationRate: 92.3,
    avgSlippage: "0.25%",
    status: "warning",
  },
  {
    asset: "DEUS",
    totalLiquidity: "$12.6M",
    availableLiquidity: "$8.9M",
    utilizationRate: 70.6,
    avgSlippage: "0.18%",
    status: "healthy",
  },
]

export function LiquidityAnalysis() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Liquidity Analysis</h2>
          <p className="text-muted-foreground">Real-time liquidity monitoring and optimization</p>
        </div>
        <Button>
          <Droplets className="mr-2 h-4 w-4" />
          Optimize Liquidity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">$154.0M</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">+5.2% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">$118.9M</p>
              <Droplets className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">77.2% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Slippage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">0.16%</p>
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-muted-foreground">Last 24h average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Medium
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">1 asset at risk</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Liquidity Breakdown</CardTitle>
          <CardDescription>Individual asset liquidity metrics and utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liquidityMetrics.map((asset, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-lg">{asset.asset}</h4>
                    <Badge
                      variant={asset.status === "healthy" ? "default" : "destructive"}
                      className={
                        asset.status === "healthy" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {asset.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{asset.totalLiquidity}</p>
                    <p className="text-sm text-muted-foreground">Total Liquidity</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="font-semibold">{asset.availableLiquidity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Utilization</p>
                    <p className="font-semibold">{asset.utilizationRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Slippage</p>
                    <p className="font-semibold">{asset.avgSlippage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${asset.status === "healthy" ? "bg-green-500" : "bg-yellow-500"}`}
                      />
                      <span className="text-sm capitalize">{asset.status}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilization Rate</span>
                    <span>{asset.utilizationRate}%</span>
                  </div>
                  <Progress value={asset.utilizationRate} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
