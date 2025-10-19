"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { ErrorState } from "@/components/error-state"
import { Wallet, DollarSign, TrendingUp, ExternalLink } from "lucide-react"
import { TreasuryContribution } from "@/components/treasury-contribution"

interface TokenHolding {
  address: string
  name: string
  symbol: string
  balance: string
  decimals: number
  logo?: string
  usdValue: number
}

interface TreasuryData {
  address: string
  totalUsdValue: number
  holdings: TokenHolding[]
  lastUpdated: string
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function TreasuryPage() {
  const [data, setData] = useState<TreasuryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTreasury = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/treasury", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch treasury data: ${response.status}`)
        }

        const treasuryData = await response.json()
        setData(treasuryData)
        setError(null)
      } catch (err) {
        console.error("[v0] Treasury fetch error:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTreasury()
    const interval = setInterval(fetchTreasury, 120000) // Update every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>

        <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black p-6">
          <div className="max-w-7xl mx-auto">
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>

        <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black p-6">
          <div className="max-w-7xl mx-auto">
            <ErrorState title="Treasury Unavailable" message={error} onRetry={() => window.location.reload()} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
                DEUS Treasury
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed">
                Live holdings and total value of the DEUS treasury wallet on Base chain
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="outline" className="glass-card border-green-500/30 text-green-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Live Data
                </Badge>
                <Badge variant="outline" className="glass-card border-orange-500/30 text-orange-300">
                  Base Chain
                </Badge>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className="glass-card backdrop-blur-xl hover:bg-white/5 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-gray-300">
                  <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-green-300">{formatCurrency(data?.totalUsdValue || 0)}</div>
                <div className="text-sm text-gray-400 mt-1">USD value of all holdings</div>
              </CardContent>
            </Card>

            <Card className="glass-card backdrop-blur-xl hover:bg-white/5 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-gray-300">
                  <Wallet className="h-4 w-4 mr-2 text-orange-400" />
                  Treasury Address
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-orange-300 font-mono">{formatAddress(data?.address || "")}</div>
                <a
                  href={`https://basescan.org/address/${data?.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white flex items-center mt-1 transition-colors"
                >
                  View on Basescan <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </CardContent>
            </Card>

            <Card className="glass-card backdrop-blur-xl hover:bg-white/5 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-gray-300">
                  <TrendingUp className="h-4 w-4 mr-2 text-white" />
                  Total Holdings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-white">{data?.holdings.length || 0}</div>
                <div className="text-sm text-gray-400 mt-1">Unique tokens</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <TreasuryContribution />
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="glass-card backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold text-white">Token Holdings</CardTitle>
                <p className="text-sm text-gray-400">All tokens held by the treasury wallet</p>
              </CardHeader>
              <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-accent/20 hover:bg-transparent">
                        <TableHead className="text-gray-300">Token</TableHead>
                        <TableHead className="text-gray-300">Symbol</TableHead>
                        <TableHead className="text-gray-300 text-right">Balance</TableHead>
                        <TableHead className="text-gray-300 text-right">USD Value</TableHead>
                        <TableHead className="text-gray-300 text-center">Contract</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.holdings.map((holding, index) => (
                        <TableRow key={holding.address} className="border-accent/20 hover:bg-white/5 transition-colors">
                          <TableCell className="font-medium text-white">{holding.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="glass-card border-orange-500/30 text-orange-300">
                              {holding.symbol}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-gray-300 font-mono">{holding.balance}</TableCell>
                          <TableCell className="text-right text-green-300 font-bold">
                            {formatCurrency(holding.usdValue)}
                          </TableCell>
                          <TableCell className="text-center">
                            <a
                              href={`https://basescan.org/token/${holding.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-white transition-colors inline-flex items-center font-mono text-sm"
                            >
                              {formatAddress(holding.address)}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:hidden space-y-3">
                  {data?.holdings.map((holding) => (
                    <motion.div
                      key={holding.address}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-4 rounded-lg border-white/5 hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-base">{holding.name}</h3>
                          <Badge
                            variant="outline"
                            className="glass-card border-orange-500/30 text-orange-300 mt-1 text-xs"
                          >
                            {holding.symbol}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-green-300 font-bold text-base">{formatCurrency(holding.usdValue)}</div>
                          <div className="text-gray-400 text-xs mt-1">USD Value</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Balance</span>
                          <span className="text-gray-300 font-mono">{holding.balance}</span>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <a
                            href={`https://basescan.org/token/${holding.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors inline-flex items-center text-xs font-mono"
                          >
                            {formatAddress(holding.address)}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-4 rounded-xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "N/A"}</span>
              </div>
              <span>Data refreshes every 2 minutes</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
