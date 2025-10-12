"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, TrendingUp, Zap } from "lucide-react"

const crossChainPools = [
  {
    id: 1,
    name: "ETH/USDC",
    chains: ["Ethereum", "Arbitrum", "Polygon"],
    totalLiquidity: "$45.2M",
    apy: "12.4%",
    volume24h: "$2.1M",
    fees24h: "$8,420",
  },
  {
    id: 2,
    name: "WBTC/ETH",
    chains: ["Ethereum", "Base", "Optimism"],
    totalLiquidity: "$28.7M",
    apy: "8.9%",
    volume24h: "$1.8M",
    fees24h: "$6,230",
  },
  {
    id: 3,
    name: "USDC/USDT",
    chains: ["Ethereum", "Arbitrum", "Polygon", "Base"],
    totalLiquidity: "$67.3M",
    apy: "5.2%",
    volume24h: "$4.2M",
    fees24h: "$12,100",
  },
]

export function CrossChainPools() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cross-Chain Pools</h2>
          <p className="text-muted-foreground">Manage liquidity across multiple chains</p>
        </div>
        <Button>
          <Zap className="mr-2 h-4 w-4" />
          Auto-Rebalance
        </Button>
      </div>

      <div className="grid gap-4">
        {crossChainPools.map((pool) => (
          <Card key={pool.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pool.name}</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {pool.apy}
                </Badge>
              </div>
              <CardDescription>Available on {pool.chains.length} chains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Liquidity</p>
                  <p className="font-semibold">{pool.totalLiquidity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="font-semibold">{pool.volume24h}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Fees</p>
                  <p className="font-semibold text-green-600">{pool.fees24h}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chains</p>
                  <div className="flex gap-1">
                    {pool.chains.slice(0, 3).map((chain) => (
                      <Badge key={chain} variant="outline" className="text-xs">
                        {chain.slice(0, 3)}
                      </Badge>
                    ))}
                    {pool.chains.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{pool.chains.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Rebalance
                </Button>
                <Button size="sm">Manage Position</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
