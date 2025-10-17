"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Zap, TrendingDown, Clock } from "lucide-react"
import Link from "next/link"

export default function GasOptimizationPage() {
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
              Troubleshooting
            </Badge>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Gas Fee Optimization</h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Tips for reducing DEUS transaction costs on Base network
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  5 min read
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  Intermediate
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-4 md:p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Understanding Gas Fees</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Gas fees are the cost of executing DEUS transactions on the Base network. While Base offers
                    significantly lower fees than Ethereum mainnet, optimizing your transactions can save even more.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Optimization Strategies</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Clock className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-green-400">Time Your Transactions</h4>
                          <p className="text-sm text-muted-foreground">
                            Gas prices fluctuate based on network activity. Execute DEUS transactions during off-peak
                            hours for lower fees.
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Best Times (UTC):</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Late night: 2 AM - 6 AM (lowest activity)</li>
                              <li>Early morning: 6 AM - 9 AM (moderate activity)</li>
                              <li>Avoid: 2 PM - 6 PM (highest activity)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <TrendingDown className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-blue-400">Batch Your Operations</h4>
                          <p className="text-sm text-muted-foreground">
                            Combine multiple DEUS actions into single transactions when possible to save on gas.
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Examples:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Deploy liquidity to multiple DEUS pools at once</li>
                              <li>Harvest rewards from all positions together</li>
                              <li>Approve multiple tokens in one transaction</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Zap className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-purple-400">Use Gas Estimation</h4>
                          <p className="text-sm text-muted-foreground">
                            The DEUS platform provides gas estimates before transactions. Review these to avoid
                            overpaying.
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Tips:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Don't set gas price too high - platform estimates are accurate</li>
                              <li>For non-urgent DEUS transactions, use "Slow" gas option</li>
                              <li>Monitor gas prices with the platform's gas tracker</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Base Network Advantages</h2>
                  <p className="text-muted-foreground">
                    Base network offers significantly lower gas fees compared to Ethereum mainnet:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Ethereum Mainnet</h4>
                      <p className="text-2xl font-bold text-red-400">$5-50</p>
                      <p className="text-xs text-muted-foreground mt-1">Average DEUS swap cost</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Base Network</h4>
                      <p className="text-2xl font-bold text-green-400">$0.10-1</p>
                      <p className="text-xs text-muted-foreground mt-1">Average DEUS swap cost</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Transaction Types & Costs</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-white font-medium">DEUS Token Swap</span>
                      <span className="text-sm text-green-400">~$0.10-0.30</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-white font-medium">Add Liquidity</span>
                      <span className="text-sm text-green-400">~$0.20-0.50</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-white font-medium">Remove Liquidity</span>
                      <span className="text-sm text-green-400">~$0.20-0.50</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-white font-medium">Token Approval</span>
                      <span className="text-sm text-green-400">~$0.05-0.15</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-white font-medium">Harvest Rewards</span>
                      <span className="text-sm text-green-400">~$0.15-0.40</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * Costs are approximate and vary based on network congestion
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Advanced Tips</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Keep a small ETH balance on Base for gas fees (0.01-0.05 ETH is usually sufficient)</li>
                    <li>Use the platform's gas tracker to monitor real-time Base network fees</li>
                    <li>For large DEUS transactions, the percentage cost of gas is lower</li>
                    <li>Consider transaction urgency - non-urgent operations can wait for lower gas prices</li>
                    <li>Failed transactions still consume gas - double-check parameters before confirming</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/troubleshooting/transaction-failed">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Transaction Failed</h4>
                          <p className="text-sm text-muted-foreground">Common DEUS transaction issues</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/troubleshooting/network-switching">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Network Switching</h4>
                          <p className="text-sm text-muted-foreground">How to switch to Base network</p>
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
