"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Filter, Search, Target, Zap, Settings, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function AdvancedFilteringPage() {
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
              Pool Management
            </Badge>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Advanced Filtering</h1>
              <p className="text-xl text-muted-foreground">
                Master the advanced filtering system to find optimal DEUS trading opportunities
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  3 min read
                </Badge>
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                  Intermediate
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Filter Categories Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The DEUS advanced filtering system allows you to narrow down thousands of pools to find the perfect
                    opportunities that match your strategy and risk tolerance.
                  </p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Core Filter Types</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Target className="h-6 w-6 text-green-400" />
                        <h3 className="text-lg font-medium text-white">Performance Filters</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">APR Range</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2 bg-black/30 rounded border border-white/10 text-center">
                              <div className="text-white">Min: 20%</div>
                            </div>
                            <div className="p-2 bg-black/30 rounded border border-white/10 text-center">
                              <div className="text-white">Max: 100%</div>
                            </div>
                            <div className="p-2 bg-black/30 rounded border border-white/10 text-center">
                              <div className="text-white">Target: 45%</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Volume Metrics</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• 24h volume minimum</li>
                            <li>• Volume/TVL ratio</li>
                            <li>• Volume trend (7d/30d)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Filter className="h-6 w-6 text-blue-400" />
                        <h3 className="text-lg font-medium text-white">Risk Filters</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Risk Levels</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2 bg-green-500/20 rounded border border-green-500/30 text-center">
                              <div className="text-green-400">Low</div>
                            </div>
                            <div className="p-2 bg-yellow-500/20 rounded border border-yellow-500/30 text-center">
                              <div className="text-yellow-400">Medium</div>
                            </div>
                            <div className="p-2 bg-red-500/20 rounded border border-red-500/30 text-center">
                              <div className="text-red-400">High</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">IL Thresholds</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Maximum IL tolerance</li>
                            <li>• Historical IL range</li>
                            <li>• IL vs fees ratio</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Search className="h-6 w-6 text-purple-400" />
                        <h3 className="text-lg font-medium text-white">Token Filters</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Token Selection</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-black/30 rounded border border-white/10">
                              <div className="text-white">DEUS Pairs Only</div>
                            </div>
                            <div className="p-2 bg-black/30 rounded border border-white/10">
                              <div className="text-white">Stablecoin Pairs</div>
                            </div>
                            <div className="p-2 bg-black/30 rounded border border-white/10">
                              <div className="text-white">Blue Chip Pairs</div>
                            </div>
                            <div className="p-2 bg-black/30 rounded border border-white/10">
                              <div className="text-white">Custom Tokens</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Market Cap Filters</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Minimum market cap</li>
                            <li>• Token age requirements</li>
                            <li>• Liquidity depth minimums</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Settings className="h-6 w-6 text-orange-400" />
                        <h3 className="text-lg font-medium text-white">Protocol Filters</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">DEX Selection</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-black/30 rounded border border-white/10">
                              <div className="text-white">Uniswap V3</div>
                            </div>
                            <div className="p-2 bg-black/30 rounded border border-white/10">
                              <div className="text-white">SushiSwap</div>
                            </div>
                            <div className="p-2 bg-black/30 rounded border border-white/10">
                              <div className="text-white">Curve</div>
                            </div>
                            <div className="p-2 bg-black/30 rounded border border-white/10">
                              <div className="text-white">Balancer</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Network Filters</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Base network (recommended)</li>
                            <li>• Ethereum mainnet</li>
                            <li>• Polygon</li>
                            <li>• Arbitrum</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Smart Filter Presets</h2>
                  <div className="p-6 bg-gradient-to-r from-accent/20 to-blue-500/20 rounded-lg border border-accent/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <Zap className="h-6 w-6 text-accent" />
                      <h3 className="text-lg font-medium text-white">Pre-configured Strategies</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Save time with our expertly crafted filter presets for different investment strategies:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-black/30 rounded border border-white/10">
                        <h4 className="text-sm font-medium text-white mb-2">Conservative</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• APR: 15-35%</li>
                          <li>• Risk: Low only</li>
                          <li>• TVL: &gt;$500K</li>
                          <li>• IL: &lt;3%</li>
                        </ul>
                        <Button size="sm" className="w-full mt-3 bg-green-500/20 text-green-400 hover:bg-green-500/30">
                          Apply Preset
                        </Button>
                      </div>
                      <div className="p-4 bg-black/30 rounded border border-white/10">
                        <h4 className="text-sm font-medium text-white mb-2">Balanced</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• APR: 25-60%</li>
                          <li>• Risk: Low-Medium</li>
                          <li>• TVL: &gt;$200K</li>
                          <li>• IL: &lt;8%</li>
                        </ul>
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        >
                          Apply Preset
                        </Button>
                      </div>
                      <div className="p-4 bg-black/30 rounded border border-white/10">
                        <h4 className="text-sm font-medium text-white mb-2">Aggressive</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• APR: 50%+</li>
                          <li>• Risk: All levels</li>
                          <li>• TVL: &gt;$50K</li>
                          <li>• IL: No limit</li>
                        </ul>
                        <Button size="sm" className="w-full mt-3 bg-red-500/20 text-red-400 hover:bg-red-500/30">
                          Apply Preset
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Advanced Filter Techniques</h2>

                  <div className="space-y-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Combination Filtering</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Combine multiple filters for precise pool discovery:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Example: High-Yield Safe Pools</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">APR Range:</span>
                              <span className="text-white">40-70%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Risk Level:</span>
                              <span className="text-green-400">Low-Medium</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">TVL Minimum:</span>
                              <span className="text-white">$1M</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Volume/TVL:</span>
                              <span className="text-white">&gt;2%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max IL:</span>
                              <span className="text-white">5%</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Results: 3 Pools Found</h4>
                          <div className="space-y-2">
                            <div className="p-2 bg-black/30 rounded border border-white/10 text-xs">
                              <div className="flex justify-between">
                                <span className="text-white">DEUS/ETH</span>
                                <span className="text-green-400">45.2% APR</span>
                              </div>
                            </div>
                            <div className="p-2 bg-black/30 rounded border border-white/10 text-xs">
                              <div className="flex justify-between">
                                <span className="text-white">DEUS/USDC</span>
                                <span className="text-green-400">38.7% APR</span>
                              </div>
                            </div>
                            <div className="p-2 bg-black/30 rounded border border-white/10 text-xs">
                              <div className="flex justify-between">
                                <span className="text-white">DEUS/WETH</span>
                                <span className="text-green-400">52.1% APR</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Dynamic Filtering</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Set up filters that automatically adjust based on market conditions:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Market Condition Triggers</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>
                              • <strong className="text-white">Bull Market:</strong> Increase risk tolerance
                            </li>
                            <li>
                              • <strong className="text-white">Bear Market:</strong> Focus on stablecoins
                            </li>
                            <li>
                              • <strong className="text-white">High Volatility:</strong> Lower IL thresholds
                            </li>
                            <li>
                              • <strong className="text-white">Low Volatility:</strong> Seek higher APRs
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Auto-Adjustment Rules</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• VIX &gt; 30: Switch to conservative preset</li>
                            <li>• DEUS price +20%: Reduce DEUS exposure</li>
                            <li>• TVL drops 50%: Increase minimum TVL</li>
                            <li>• New pools: Require 30-day history</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Filter Optimization Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Best Practices</h3>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>
                          • <strong className="text-white">Start Broad:</strong> Begin with loose filters, then narrow
                          down
                        </li>
                        <li>
                          • <strong className="text-white">Regular Updates:</strong> Adjust filters weekly based on
                          performance
                        </li>
                        <li>
                          • <strong className="text-white">Backtesting:</strong> Test filter combinations on historical
                          data
                        </li>
                        <li>
                          • <strong className="text-white">Documentation:</strong> Keep notes on successful filter
                          combinations
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Common Mistakes</h3>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>
                          • <strong className="text-white">Over-filtering:</strong> Too restrictive criteria yield no
                          results
                        </li>
                        <li>
                          • <strong className="text-white">Ignoring Correlation:</strong> Not considering token
                          relationships
                        </li>
                        <li>
                          • <strong className="text-white">Static Filters:</strong> Not adapting to market changes
                        </li>
                        <li>
                          • <strong className="text-white">Chasing APR:</strong> Focusing only on highest returns
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Alert className="border-blue-500/30 bg-blue-500/10">
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription className="text-white">
                      <strong>Pro Tip:</strong> Save your successful filter combinations as custom presets for quick
                      access during market opportunities.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Next Steps</h2>
                  <p className="text-muted-foreground">
                    Now that you've mastered filtering, explore AI-powered recommendations and portfolio management:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/ai-features/ai-recommendations">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">AI Recommendations</h4>
                          <p className="text-sm text-muted-foreground">Let AI enhance your filtering strategies</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/getting-started/first-deployment">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Deploy to Filtered Pools</h4>
                          <p className="text-sm text-muted-foreground">
                            Start deploying to your filtered opportunities
                          </p>
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
