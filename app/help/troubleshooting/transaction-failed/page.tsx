"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function TransactionFailedPage() {
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
            <Badge variant="outline" className="border-red-500/30 text-red-400 w-fit">
              Troubleshooting
            </Badge>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Transaction Failed</h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Common DEUS transaction issues and how to fix them
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  4 min read
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Beginner
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-4 md:p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Common Causes</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    DEUS transactions can fail for several reasons. Understanding the cause helps you resolve the issue
                    quickly and avoid future problems.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Troubleshooting Steps</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-red-400">Insufficient Gas</h4>
                          <p className="text-sm text-muted-foreground">
                            Your wallet doesn't have enough ETH to cover gas fees on Base network.
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Solution:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Add more ETH to your wallet for gas fees</li>
                              <li>Bridge ETH to Base network if needed</li>
                              <li>Wait for lower gas prices during off-peak hours</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-red-400">Slippage Too Low</h4>
                          <p className="text-sm text-muted-foreground">
                            DEUS token price moved beyond your slippage tolerance during the transaction.
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Solution:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Increase slippage tolerance to 1-3% for DEUS swaps</li>
                              <li>Try the transaction again during lower volatility</li>
                              <li>Use smaller trade amounts to reduce price impact</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-red-400">Token Approval Required</h4>
                          <p className="text-sm text-muted-foreground">
                            You need to approve DEUS or other tokens before the transaction can proceed.
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Solution:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Complete the token approval transaction first</li>
                              <li>Wait for approval confirmation before retrying</li>
                              <li>Check that you approved the correct contract address</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-red-400">Network Congestion</h4>
                          <p className="text-sm text-muted-foreground">
                            Base network is experiencing high traffic, causing transaction delays or failures.
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Solution:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Wait 5-10 minutes and try again</li>
                              <li>Increase gas price for faster confirmation</li>
                              <li>Check Base network status for ongoing issues</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-red-400">Insufficient Liquidity</h4>
                          <p className="text-sm text-muted-foreground">
                            The DEUS pool doesn't have enough liquidity to complete your trade at the current price.
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Solution:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Reduce your trade size to match available liquidity</li>
                              <li>Choose a different DEUS pool with higher TVL</li>
                              <li>Split large trades into smaller transactions</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Prevention Tips</h2>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-400">Best Practices</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                          <li>Always keep extra ETH in your wallet for gas fees</li>
                          <li>Set appropriate slippage tolerance (1-3% for DEUS)</li>
                          <li>Check DEUS pool liquidity before large trades</li>
                          <li>Approve tokens before attempting swaps or deposits</li>
                          <li>Monitor Base network status during high volatility</li>
                          <li>Use the platform's gas estimation feature</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Still Having Issues?</h2>
                  <p className="text-muted-foreground">
                    If your DEUS transaction continues to fail after trying these solutions, contact our support team
                    with your transaction hash for assistance.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Contact Support</Button>
                    <Link href="/help/troubleshooting/gas-optimization">
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        Gas Optimization Guide
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/troubleshooting/wallet-issues">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Wallet Connection Issues</h4>
                          <p className="text-sm text-muted-foreground">Resolving wallet connectivity problems</p>
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
