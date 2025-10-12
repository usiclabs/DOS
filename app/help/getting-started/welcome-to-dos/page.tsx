"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Target, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export default function WelcomeToDOSPage() {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center space-x-4">
            <Link href="/help">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help
              </Button>
            </Link>
            <Badge variant="outline" className="border-accent/30 text-accent">
              Getting Started
            </Badge>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Welcome to D.O.S.</h1>
              <p className="text-xl text-muted-foreground">
                Learn the basics of the DEUS Operating System platform and start your DeFi journey
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  3 min read
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Beginner
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">What is D.O.S.?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The DEUS Operating System (D.O.S.) is a comprehensive DeFi platform designed to simplify and
                    optimize your interaction with decentralized finance. Built around the DEUS token ecosystem, D.O.S.
                    provides intelligent tools for liquidity provision, portfolio management, and automated trading
                    strategies.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Key Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Target className="h-6 w-6 text-accent" />
                        <h3 className="text-lg font-medium text-white">Smart Pool Discovery</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Find the most profitable DEUS liquidity pools with real-time analytics and AI-powered
                        recommendations.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-6 w-6 text-accent" />
                        <h3 className="text-lg font-medium text-white">Portfolio Management</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Track your DEUS positions, monitor performance, and optimize your liquidity deployment
                        strategies.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-6 w-6 text-accent" />
                        <h3 className="text-lg font-medium text-white">AI-Powered Insights</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Leverage advanced AI algorithms to make informed decisions and minimize risks in volatile
                        markets.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-6 w-6 text-accent" />
                        <h3 className="text-lg font-medium text-white">Educational Resources</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Access comprehensive guides, tutorials, and market analysis to improve your DeFi knowledge.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Getting Started</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Connect Your Wallet</h4>
                        <p className="text-sm text-muted-foreground">
                          Start by connecting your MetaMask or other compatible wallet to access the platform.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Explore DEUS Pools</h4>
                        <p className="text-sm text-muted-foreground">
                          Browse available liquidity pools and analyze their performance metrics and potential returns.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Deploy Liquidity</h4>
                        <p className="text-sm text-muted-foreground">
                          Use our one-click deployment feature to add liquidity to your chosen pools and start earning.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Monitor & Optimize</h4>
                        <p className="text-sm text-muted-foreground">
                          Track your positions, harvest rewards, and adjust your strategy based on AI recommendations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Next Steps</h2>
                  <p className="text-muted-foreground">
                    Ready to dive deeper? Here are some recommended articles to continue your D.O.S. journey:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/getting-started/connecting-wallet">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Connecting Your Wallet</h4>
                          <p className="text-sm text-muted-foreground">Step-by-step wallet connection guide</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/getting-started/pool-discovery">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Understanding Pool Discovery</h4>
                          <p className="text-sm text-muted-foreground">How to find profitable DEUS pools</p>
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
