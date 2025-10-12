"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { StrategyOverview } from "@/components/strategies/strategy-overview"
import { StrategyBuilder } from "@/components/strategies/strategy-builder"
import { ActiveStrategies } from "@/components/strategies/active-strategies"
import { PerformanceAnalytics } from "@/components/strategies/performance-analytics"
import { RiskManagement } from "@/components/strategies/risk-management"
import { ErrorBoundary } from "@/components/error-boundary"
import { Bot, Zap, TrendingUp, Shield, Target } from "lucide-react"

export default function StrategiesPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-black text-white">
      <ErrorBoundary>
        <StickyHeader />
      </ErrorBoundary>

      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6">
        {/* Strategies Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-green-200 to-green-400 bg-clip-text text-transparent flex items-center gap-3">
              <Bot className="w-8 h-8 text-green-400" />
              Automated Yield Strategies
            </h1>
            <p className="text-gray-400 mt-1">AI-powered yield optimization and automated portfolio management</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              <Zap className="w-3 h-3 mr-1" />
              12 Active Strategies
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              +18.7% Avg APY
            </Badge>
            <Badge variant="outline" className="border-accent text-accent">
              <Shield className="w-3 h-3 mr-1" />
              Risk Managed
            </Badge>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300">Total Strategy AUM</p>
                  <p className="text-2xl font-bold text-white">$89.4M</p>
                  <p className="text-xs text-green-400">+24.5% MTD</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Active Strategies</p>
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-xs text-blue-400">+3 this week</p>
                </div>
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/20 to-accent/10 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-accent-light">Avg Strategy APY</p>
                  <p className="text-2xl font-bold text-white">18.7%</p>
                  <p className="text-xs text-green-400">vs 12.3% market</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-300">Risk Score</p>
                  <p className="text-2xl font-bold text-white">6.8/10</p>
                  <p className="text-xs text-yellow-400">Moderate</p>
                </div>
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="builder" className="data-[state=active]:bg-gray-700">
              Strategy Builder
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-gray-700">
              Active Strategies
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700">
              Performance
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-gray-700">
              Risk Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ErrorBoundary>
              <StrategyOverview />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="builder" className="mt-6">
            <ErrorBoundary>
              <StrategyBuilder />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <ErrorBoundary>
              <ActiveStrategies />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <ErrorBoundary>
              <PerformanceAnalytics />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <ErrorBoundary>
              <RiskManagement />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
