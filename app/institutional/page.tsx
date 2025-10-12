"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { PortfolioOverview } from "@/components/institutional/portfolio-overview"
import { RiskAnalytics } from "@/components/institutional/risk-analytics"
import { PerformanceAttribution } from "@/components/institutional/performance-attribution"
import { LiquidityAnalysis } from "@/components/institutional/liquidity-analysis"
import { ComplianceMonitor } from "@/components/institutional/compliance-monitor"
import { ReportingCenter } from "@/components/institutional/reporting-center"
import { APIManagement } from "@/components/institutional/api-management"
import { WhiteLabelSettings } from "@/components/institutional/white-label-settings"
import { ErrorBoundary } from "@/components/error-boundary"
import { Building2, Shield, TrendingUp, BarChart3, FileText, Crown, Zap } from "lucide-react"

export default function InstitutionalPage() {
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
        {/* Institutional Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-400" />
              Institutional Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Enterprise-grade DeFi portfolio management and analytics</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
              <Crown className="w-3 h-3 mr-1" />
              Premium Tier
            </Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              <Shield className="w-3 h-3 mr-1" />
              SOC2 Compliant
            </Badge>
            <Badge variant="outline" className="border-accent text-accent">
              <Zap className="w-3 h-3 mr-1" />
              API Access
            </Badge>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Total AUM</p>
                  <p className="text-2xl font-bold text-white">$247.8M</p>
                  <p className="text-xs text-green-400">+12.5% MTD</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300">Active Strategies</p>
                  <p className="text-2xl font-bold text-white">47</p>
                  <p className="text-xs text-green-400">+3 this week</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/20 to-accent/10 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-accent-light">Risk Score</p>
                  <p className="text-2xl font-bold text-white">7.2/10</p>
                  <p className="text-xs text-yellow-400">Moderate</p>
                </div>
                <Shield className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-300">Compliance Score</p>
                  <p className="text-2xl font-bold text-white">98.7%</p>
                  <p className="text-xs text-green-400">Excellent</p>
                </div>
                <FileText className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700 text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-gray-700 text-xs">
              Risk Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-gray-700 text-xs">
              Performance
            </TabsTrigger>
            <TabsTrigger value="liquidity" className="data-[state=active]:bg-gray-700 text-xs">
              Liquidity
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-gray-700 text-xs">
              Compliance
            </TabsTrigger>
            <TabsTrigger value="reporting" className="data-[state=active]:bg-gray-700 text-xs">
              Reporting
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-gray-700 text-xs">
              API
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700 text-xs">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ErrorBoundary>
              <PortfolioOverview />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <ErrorBoundary>
              <RiskAnalytics />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <ErrorBoundary>
              <PerformanceAttribution />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="liquidity" className="mt-6">
            <ErrorBoundary>
              <LiquidityAnalysis />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <ErrorBoundary>
              <ComplianceMonitor />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="reporting" className="mt-6">
            <ErrorBoundary>
              <ReportingCenter />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <ErrorBoundary>
              <APIManagement />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <ErrorBoundary>
              <WhiteLabelSettings />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
