"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ChainOverview } from "@/components/cross-chain/chain-overview"
import { BridgeInterface } from "@/components/cross-chain/bridge-interface"
import { CrossChainPools } from "@/components/cross-chain/cross-chain-pools"
import { ArbitrageOpportunities } from "@/components/cross-chain/arbitrage-opportunities"
import { ChainAnalytics } from "@/components/cross-chain/chain-analytics"
import { ErrorBoundary } from "@/components/error-boundary"
import { Network, Zap, TrendingUp, Globe } from "lucide-react"

export default function CrossChainPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-black text-white">
      <ErrorBoundary>
        <StickyHeader />
      </ErrorBoundary>

      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Cross-Chain Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gold to-gold-light bg-clip-text text-transparent flex items-center gap-3">
              <Globe className="w-8 h-8 text-gold" />
              Cross-Chain Hub
            </h1>
            <p className="text-gray-400 mt-1">Multi-chain liquidity management and arbitrage opportunities</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-gold/30 text-gold">
              <Network className="w-3 h-3 mr-1" />8 Chains Connected
            </Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              <Zap className="w-3 h-3 mr-1" />
              Auto-Bridge Active
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              $12.4M Cross-Chain TVL
            </Badge>
          </div>
        </div>

        {/* Network Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { name: "Ethereum", status: "active", tvl: 4200000, color: "border-blue-500/30 text-blue-400" },
            { name: "Base", status: "active", tvl: 2800000, color: "border-blue-600/30 text-blue-300" },
            { name: "Arbitrum", status: "active", tvl: 1900000, color: "border-black/30 text-black" },
            { name: "Polygon", status: "active", tvl: 1600000, color: "border-accent/30 text-accent" },
            { name: "Optimism", status: "active", tvl: 1200000, color: "border-red-500/30 text-red-400" },
            { name: "Avalanche", status: "active", tvl: 800000, color: "border-red-600/30 text-red-300" },
            { name: "BSC", status: "maintenance", tvl: 0, color: "border-yellow-500/30 text-yellow-400" },
            { name: "Fantom", status: "inactive", tvl: 0, color: "border-gray-500/30 text-gray-400" },
          ].map((chain, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-sm font-medium text-white mb-1">{chain.name}</div>
                  <Badge variant="outline" className={`text-xs mb-2 ${chain.color}`}>
                    {chain.status}
                  </Badge>
                  <div className="text-xs text-gray-400">
                    {chain.tvl > 0 ? `$${(chain.tvl / 1000000).toFixed(1)}M` : "—"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cross-Chain Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="bridge" className="data-[state=active]:bg-gray-700">
              Bridge
            </TabsTrigger>
            <TabsTrigger value="pools" className="data-[state=active]:bg-gray-700">
              Cross-Chain Pools
            </TabsTrigger>
            <TabsTrigger value="arbitrage" className="data-[state=active]:bg-gray-700">
              Arbitrage
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ErrorBoundary>
              <ChainOverview />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="bridge" className="mt-6">
            <ErrorBoundary>
              <BridgeInterface />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="pools" className="mt-6">
            <ErrorBoundary>
              <CrossChainPools />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="arbitrage" className="mt-6">
            <ErrorBoundary>
              <ArbitrageOpportunities />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <ErrorBoundary>
              <ChainAnalytics />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
