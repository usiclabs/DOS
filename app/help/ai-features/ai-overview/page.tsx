"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Brain, TrendingUp, Shield, Zap, Target, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function AIOverviewPage() {
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
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">AI Agent Overview</h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Discover how DEUS AI analyzes markets and provides intelligent trading insights
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  4 min read
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  Intermediate
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-4 md:p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">What is the DEUS AI Agent?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The DEUS AI Agent is an advanced machine learning system designed to analyze market conditions,
                    identify profitable opportunities, and provide personalized recommendations for liquidity providers.
                    It continuously monitors the DEUS ecosystem, evaluating thousands of data points to help you make
                    informed decisions.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Core Capabilities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-6 w-6 text-accent flex-shrink-0" />
                        <h3 className="text-base md:text-lg font-medium text-white">Market Analysis</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Real-time analysis of DEUS market trends, volume patterns, and liquidity flows across all pools.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="h-6 w-6 text-accent flex-shrink-0" />
                        <h3 className="text-base md:text-lg font-medium text-white">Pool Recommendations</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Personalized pool suggestions based on your risk tolerance, capital, and investment goals.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-6 w-6 text-accent flex-shrink-0" />
                        <h3 className="text-base md:text-lg font-medium text-white">Risk Assessment</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automated risk scoring for DEUS pools considering volatility, liquidity depth, and historical
                        performance.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Zap className="h-6 w-6 text-accent flex-shrink-0" />
                        <h3 className="text-base md:text-lg font-medium text-white">Opportunity Alerts</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Instant notifications when high-yield DEUS opportunities emerge or market conditions change.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-6 w-6 text-accent flex-shrink-0" />
                        <h3 className="text-base md:text-lg font-medium text-white">Performance Tracking</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Continuous monitoring of your DEUS positions with optimization suggestions to maximize returns.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-6 w-6 text-accent flex-shrink-0" />
                        <h3 className="text-base md:text-lg font-medium text-white">Predictive Analytics</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Forecasting DEUS price movements and pool performance using historical data and market signals.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">How It Works</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        1
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Data Collection</h4>
                        <p className="text-sm text-muted-foreground">
                          The AI continuously collects data from DEUS pools, including prices, volumes, liquidity
                          depths, fee earnings, and on-chain activity across the Base network.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        2
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Pattern Recognition</h4>
                        <p className="text-sm text-muted-foreground">
                          Advanced algorithms identify patterns in DEUS market behavior, correlations between tokens,
                          and emerging trends that human traders might miss.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        3
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Risk Evaluation</h4>
                        <p className="text-sm text-muted-foreground">
                          Each DEUS opportunity is scored based on multiple risk factors including impermanent loss
                          potential, smart contract security, and market volatility.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        4
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Personalized Recommendations</h4>
                        <p className="text-sm text-muted-foreground">
                          Based on your risk profile and investment goals, the AI generates tailored DEUS pool
                          recommendations with expected returns and risk assessments.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Getting Started with AI</h2>
                  <p className="text-muted-foreground">
                    To start using the DEUS AI Agent, simply connect your wallet and navigate to any pool listing. The
                    AI will automatically analyze opportunities and display recommendations. You can customize your risk
                    tolerance in Settings to receive more personalized suggestions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/pools" className="flex-1">
                      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        Explore AI Recommendations
                      </Button>
                    </Link>
                    <Link href="/help/ai-features/risk-tolerance" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        Configure Risk Profile
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Next Steps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/ai-features/ai-recommendations">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Personalized Recommendations</h4>
                          <p className="text-sm text-muted-foreground">
                            Learn how to get tailored DEUS investment advice
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/ai-features/market-analysis">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Market Analysis</h4>
                          <p className="text-sm text-muted-foreground">Understanding AI market insights</p>
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
