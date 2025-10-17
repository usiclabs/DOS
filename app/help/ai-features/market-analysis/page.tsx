"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, TrendingUp, Activity, PieChart } from "lucide-react"
import Link from "next/link"

export default function MarketAnalysisPage() {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-black p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Link href="/help">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help
              </Button>
            </Link>
            <Badge variant="outline" className="border-accent/30 text-accent w-fit">
              AI Features
            </Badge>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Market Analysis</h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Understanding AI-powered insights for the DEUS ecosystem
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  6 min read
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  Intermediate
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-4 md:p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">AI Market Insights</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The DEUS AI continuously analyzes market data to provide actionable insights about the DEUS
                    ecosystem, helping you make informed decisions about liquidity provision and trading strategies.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Key Analysis Metrics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-6 w-6 text-accent flex-shrink-0" />
                        <h3 className="text-base md:text-lg font-medium text-white">Volume Trends</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        24h, 7d, and 30d trading volume analysis across all DEUS pools to identify liquidity hotspots.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-6 w-6 text-accent flex-shrink-0" />
                        <h3 className="text-base md:text-lg font-medium text-white">Price Movements</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        DEUS token price trends, volatility patterns, and correlation with major crypto assets.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-6 w-6 text-accent flex-shrink-0" />
                        <h3 className="text-base md:text-lg font-medium text-white">Liquidity Depth</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total value locked (TVL) changes and liquidity distribution across DEUS pool tiers.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <PieChart className="h-6 w-6 text-accent flex-shrink-0" />
                        <h3 className="text-base md:text-lg font-medium text-white">Market Sentiment</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        On-chain activity indicators showing DEUS holder behavior and market confidence levels.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Reading Market Signals</h2>
                  <p className="text-muted-foreground">
                    The AI identifies key market signals that can impact your DEUS positions:
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="font-medium text-green-400 mb-2">Bullish Signals</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                        <li>Increasing DEUS trading volume across multiple pools</li>
                        <li>Growing TVL in major DEUS liquidity pairs</li>
                        <li>Rising fee generation and LP profitability</li>
                        <li>Positive correlation with broader DeFi market trends</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <h4 className="font-medium text-red-400 mb-2">Bearish Signals</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                        <li>Declining DEUS pool volumes and liquidity exits</li>
                        <li>Increased price volatility and impermanent loss risk</li>
                        <li>Reduced fee earnings compared to historical averages</li>
                        <li>Negative sentiment in broader crypto markets</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Using Analysis for Decisions</h2>
                  <p className="text-muted-foreground">
                    Apply AI market insights to optimize your DEUS trading strategy:
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Entry Timing</h4>
                        <p className="text-sm text-muted-foreground">
                          Use volume and sentiment analysis to identify optimal times to enter DEUS pools.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Position Sizing</h4>
                        <p className="text-sm text-muted-foreground">
                          Adjust your DEUS liquidity amounts based on market volatility and risk indicators.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Exit Strategy</h4>
                        <p className="text-sm text-muted-foreground">
                          Monitor bearish signals to know when to reduce exposure or exit DEUS positions.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Rebalancing</h4>
                        <p className="text-sm text-muted-foreground">
                          Use trend analysis to shift between different DEUS pools as market conditions change.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Next Steps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/analytics">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">View Live Analytics</h4>
                          <p className="text-sm text-muted-foreground">Explore real-time DEUS market data</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/pools/pool-analytics">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Pool Analytics Guide</h4>
                          <p className="text-sm text-muted-foreground">Understanding pool metrics</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
