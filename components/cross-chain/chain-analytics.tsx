"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react"

const chainData = [
  {
    name: "Ethereum",
    tvl: "$142.5M",
    change24h: "+2.4%",
    positive: true,
    utilization: 78,
    gasPrice: "25 gwei",
    status: "optimal",
  },
  {
    name: "Arbitrum",
    tvl: "$89.2M",
    change24h: "+5.1%",
    positive: true,
    utilization: 65,
    gasPrice: "0.1 gwei",
    status: "optimal",
  },
  {
    name: "Polygon",
    tvl: "$67.8M",
    change24h: "-1.2%",
    positive: false,
    utilization: 82,
    gasPrice: "30 gwei",
    status: "high",
  },
  {
    name: "Base",
    tvl: "$45.3M",
    change24h: "+8.7%",
    positive: true,
    utilization: 45,
    gasPrice: "0.05 gwei",
    status: "optimal",
  },
]

export function ChainAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Chain Analytics</h2>
        <p className="text-muted-foreground">Performance metrics across all supported chains</p>
      </div>

      <div className="grid gap-4">
        {chainData.map((chain) => (
          <Card key={chain.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{chain.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={chain.status === "optimal" ? "default" : "destructive"}
                    className={chain.status === "optimal" ? "bg-green-100 text-green-800" : ""}
                  >
                    <Activity className="mr-1 h-3 w-3" />
                    {chain.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{chain.tvl}</p>
                    <div className={`flex items-center text-sm ${chain.positive ? "text-green-600" : "text-red-600"}`}>
                      {chain.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {chain.change24h}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilization</p>
                  <div className="space-y-2">
                    <p className="font-semibold">{chain.utilization}%</p>
                    <Progress value={chain.utilization} className="h-2" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gas Price</p>
                  <p className="font-semibold">{chain.gasPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Network Health</p>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${chain.status === "optimal" ? "bg-green-500" : "bg-yellow-500"}`}
                    />
                    <span className="text-sm capitalize">{chain.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cross-Chain Summary</CardTitle>
          <CardDescription>Aggregate metrics across all chains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">$344.8M</p>
              <p className="text-sm text-muted-foreground">Total TVL</p>
            </div>
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">67.5%</p>
              <p className="text-sm text-muted-foreground">Avg Utilization</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">+3.8%</p>
              <p className="text-sm text-muted-foreground">24h Change</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <p className="text-2xl font-bold">4/4</p>
              <p className="text-sm text-muted-foreground">Chains Online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
