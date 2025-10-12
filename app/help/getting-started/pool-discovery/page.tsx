"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, TrendingUp, DollarSign, Users, BarChart3, AlertTriangle, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function PoolDiscoveryPage() {
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
              <h1 className="text-4xl font-bold text-white mb-4">Understanding Pool Discovery</h1>
              <p className="text-xl text-muted-foreground">
                Master the art of finding profitable DEUS liquidity pools with our advanced discovery tools
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  5 min read
                </Badge>
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                  Intermediate
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">What is Pool Discovery?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Pool Discovery is DEUS's intelligent system for finding and analyzing liquidity pools across
                    decentralized exchanges. It aggregates data from multiple DEXs, analyzes performance metrics, and
                    presents the most profitable opportunities for DEUS token holders.
                  </p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Key Metrics to Understand</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <TrendingUp className="h-6 w-6 text-green-400" />
                        <h3 className="text-lg font-medium text-white">APR (Annual Percentage Rate)</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        The yearly return you can expect from providing liquidity to a pool, including trading fees and
                        rewards.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Low APR:</span>
                          <span className="text-red-400">0-20%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Medium APR:</span>
                          <span className="text-yellow-400">20-50%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">High APR:</span>
                          <span className="text-green-400">50%+</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <DollarSign className="h-6 w-6 text-blue-400" />
                        <h3 className="text-lg font-medium text-white">TVL (Total Value Locked)</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        The total amount of assets locked in the pool. Higher TVL generally indicates more stability and
                        trust.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Small Pool:</span>
                          <span className="text-red-400">&lt;$100K</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Medium Pool:</span>
                          <span className="text-yellow-400">$100K-$1M</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Large Pool:</span>
                          <span className="text-green-400">$1M+</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <BarChart3 className="h-6 w-6 text-orange-400" />
                        <h3 className="text-lg font-medium text-white">24h Volume</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        The trading volume in the last 24 hours. Higher volume means more trading fees for liquidity
                        providers.
                      </p>
                      <Alert className="border-accent/30 bg-accent/10">
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription className="text-white">
                          Look for pools with consistent volume, not just one-time spikes.
                        </AlertDescription>
                      </Alert>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Users className="h-6 w-6 text-orange-400" />
                        <h3 className="text-lg font-medium text-white">Active LPs</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        The number of active liquidity providers in the pool. More LPs can indicate a healthier, more
                        distributed pool.
                      </p>
                      <div className="text-sm text-muted-foreground">
                        Optimal range: 50-500 active LPs for balanced competition and stability.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Using the Discovery Interface</h2>

                  <div className="space-y-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Step 1: Access Pool Discovery</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Navigate to the "Pools" section from the main dashboard. You'll see a comprehensive list of
                        available DEUS pools.
                      </p>
                      <div className="p-3 bg-black/30 rounded border border-white/10">
                        <code className="text-sm text-accent">Dashboard → Pools → Discovery</code>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Step 2: Apply Filters</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use the filtering system to narrow down pools based on your preferences:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">APR Range</h4>
                          <div className="text-xs text-muted-foreground">Filter by minimum APR threshold</div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">TVL Range</h4>
                          <div className="text-xs text-muted-foreground">Set minimum pool size requirements</div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">Risk Level</h4>
                          <div className="text-xs text-muted-foreground">Choose your risk tolerance</div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">Token Pairs</h4>
                          <div className="text-xs text-muted-foreground">Select specific DEUS pairs</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Step 3: Analyze Pool Details</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Click on any pool to view detailed analytics:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>• Historical performance charts</li>
                        <li>• Fee structure and reward distribution</li>
                        <li>• Impermanent loss projections</li>
                        <li>• Liquidity depth and price impact</li>
                        <li>• Recent transaction history</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">AI-Powered Recommendations</h2>
                  <div className="p-6 bg-gradient-to-r from-accent/20 to-orange-500/20 rounded-lg border border-accent/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-accent-foreground font-bold text-sm">AI</span>
                      </div>
                      <h3 className="text-lg font-medium text-white">Smart Pool Suggestions</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our AI analyzes your portfolio, risk tolerance, and market conditions to suggest optimal DEUS
                      pools:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-black/30 rounded border border-white/10">
                        <h4 className="text-sm font-medium text-white mb-2">Conservative</h4>
                        <p className="text-xs text-muted-foreground">
                          Stable pairs with consistent returns and lower impermanent loss risk.
                        </p>
                      </div>
                      <div className="p-4 bg-black/30 rounded border border-white/10">
                        <h4 className="text-sm font-medium text-white mb-2">Balanced</h4>
                        <p className="text-xs text-muted-foreground">
                          Medium-risk pools with good APR and manageable volatility.
                        </p>
                      </div>
                      <div className="p-4 bg-black/30 rounded border border-white/10">
                        <h4 className="text-sm font-medium text-white mb-2">Aggressive</h4>
                        <p className="text-xs text-muted-foreground">
                          High-yield opportunities with higher risk and potential rewards.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Risk Assessment</h2>
                  <Alert className="border-yellow-500/30 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-white">
                      <strong>Important:</strong> Always assess risks before providing liquidity. Higher APRs often come
                      with higher risks.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Risk Factors to Consider</h3>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>
                          • <strong className="text-white">Impermanent Loss:</strong> Price divergence between paired
                          tokens
                        </li>
                        <li>
                          • <strong className="text-white">Smart Contract Risk:</strong> Protocol vulnerabilities
                        </li>
                        <li>
                          • <strong className="text-white">Liquidity Risk:</strong> Ability to exit positions
                        </li>
                        <li>
                          • <strong className="text-white">Market Risk:</strong> Overall market volatility
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Risk Mitigation Strategies</h3>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>
                          • <strong className="text-white">Diversification:</strong> Spread across multiple pools
                        </li>
                        <li>
                          • <strong className="text-white">Position Sizing:</strong> Don't over-allocate to single pools
                        </li>
                        <li>
                          • <strong className="text-white">Regular Monitoring:</strong> Track performance and adjust
                        </li>
                        <li>
                          • <strong className="text-white">Exit Strategy:</strong> Set clear profit/loss targets
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Next Steps</h2>
                  <p className="text-muted-foreground">
                    Ready to deploy liquidity to your chosen pools? Learn how to make your first deployment:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/getting-started/first-deployment">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Your First Deployment</h4>
                          <p className="text-sm text-muted-foreground">Step-by-step guide to deploying liquidity</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/pools/risk-assessment">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Advanced Risk Assessment</h4>
                          <p className="text-sm text-muted-foreground">Deep dive into pool risk analysis</p>
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
