"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Wallet, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function WalletIssuesPage() {
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
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Wallet Connection Issues</h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Resolving wallet connectivity problems with DEUS platform
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  3 min read
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Beginner
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-4 md:p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Common Wallet Issues</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Wallet className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-orange-400">Wallet Won't Connect</h4>
                          <p className="text-sm text-muted-foreground">
                            MetaMask or other wallet extension doesn't respond when clicking "Connect Wallet".
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Solutions:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Refresh the page and try connecting again</li>
                              <li>Make sure your wallet extension is unlocked</li>
                              <li>Check that you're using a supported browser (Chrome, Firefox, Brave)</li>
                              <li>Disable other wallet extensions that might conflict</li>
                              <li>Clear browser cache and cookies</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <RefreshCw className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-orange-400">Wrong Network</h4>
                          <p className="text-sm text-muted-foreground">
                            Your wallet is connected to the wrong network (not Base).
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Solutions:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Click the network switcher in your wallet</li>
                              <li>Select "Base" from the network list</li>
                              <li>If Base isn't listed, add it manually with these details:</li>
                            </ul>
                            <div className="mt-2 p-2 bg-black/40 rounded text-xs font-mono">
                              <div>Network Name: Base</div>
                              <div>RPC URL: https://mainnet.base.org</div>
                              <div>Chain ID: 8453</div>
                              <div>Currency Symbol: ETH</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-orange-400">Wallet Disconnects Randomly</h4>
                          <p className="text-sm text-muted-foreground">
                            Your wallet connection drops unexpectedly while using DEUS platform.
                          </p>
                          <div className="mt-2 p-3 bg-muted/20 rounded">
                            <p className="text-sm text-white font-medium mb-1">Solutions:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                              <li>Update your wallet extension to the latest version</li>
                              <li>Check your internet connection stability</li>
                              <li>Disable browser extensions that might interfere</li>
                              <li>Try using a different browser</li>
                              <li>Reconnect your wallet after each disconnect</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Supported Wallets</h2>
                  <p className="text-muted-foreground">DEUS platform supports the following wallet providers:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <h4 className="font-medium text-white mb-1">MetaMask</h4>
                      <p className="text-xs text-muted-foreground">Most popular Ethereum wallet</p>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <h4 className="font-medium text-white mb-1">Coinbase Wallet</h4>
                      <p className="text-xs text-muted-foreground">Integrated with Coinbase exchange</p>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <h4 className="font-medium text-white mb-1">WalletConnect</h4>
                      <p className="text-xs text-muted-foreground">Connect mobile wallets</p>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <h4 className="font-medium text-white mb-1">Rainbow</h4>
                      <p className="text-xs text-muted-foreground">User-friendly mobile wallet</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Still Can't Connect?</h2>
                  <p className="text-muted-foreground">
                    If you've tried all solutions and still can't connect your wallet to DEUS platform, please contact
                    our support team with details about your wallet type and browser.
                  </p>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Contact Support</Button>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/getting-started/connecting-wallet">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Connecting Your Wallet</h4>
                          <p className="text-sm text-muted-foreground">Step-by-step wallet connection guide</p>
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
