"use client"

import { useState, useEffect } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { ErrorState } from "@/components/error-state"
import { Wallet, DollarSign, TrendingUp, ExternalLink, Sparkles } from "lucide-react"
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

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (current) => `${prefix}${Math.floor(current).toLocaleString()}${suffix}`)

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
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

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-orange-950/10 to-black p-4 md:p-6">
        {/* Floating gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="flex items-start justify-between flex-col md:flex-row gap-4">
              <div className="flex-1">
                <motion.div
                  className="inline-flex items-center gap-2 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Sparkles className="w-6 h-6 text-orange-400" />
                  <span className="text-orange-400 font-semibold">Treasury Overview</span>
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                  DEUS Treasury
                </h1>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl">
                  Real-time holdings and total value of the DEUS treasury wallet on Base chain
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="glass-card border-green-500/30 text-green-300 px-4 py-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Live Data
                </Badge>
                <Badge variant="outline" className="glass-card border-orange-500/30 text-orange-300 px-4 py-2">
                  Base Chain
                </Badge>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="glass-card backdrop-blur-xl border-green-500/20 hover:border-green-500/40 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center text-gray-300">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                    </motion.div>
                    Total Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl md:text-4xl font-bold text-green-300">
                    {data && <AnimatedNumber value={data.totalUsdValue} prefix="$" />}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">USD value of all holdings</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="glass-card backdrop-blur-xl border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center text-gray-300">
                    <Wallet className="h-5 w-5 mr-2 text-orange-400" />
                    Treasury Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg md:text-xl font-bold text-orange-300 font-mono">
                    {formatAddress(data?.address || "")}
                  </div>
                  <a
                    href={`https://basescan.org/address/${data?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-orange-300 flex items-center mt-2 transition-colors group"
                  >
                    View on Basescan{" "}
                    <ExternalLink className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="glass-card backdrop-blur-xl border-white/20 hover:border-white/40 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center text-gray-300">
                    <TrendingUp className="h-5 w-5 mr-2 text-white" />
                    Total Holdings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {data && <AnimatedNumber value={data.holdings.length} />}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">Unique tokens</div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.6, delay: 0.2 }}>
            <TreasuryContribution />
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.6, delay: 0.3 }}>
            <Card className="glass-card backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-400" />
                      Token Holdings
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">All tokens held by the treasury wallet</p>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 px-3 py-1">
                    {data?.holdings.length || 0} Tokens
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-accent/20 hover:bg-transparent">
                        <TableHead className="text-gray-300 font-semibold">Token</TableHead>
                        <TableHead className="text-gray-300 font-semibold">Symbol</TableHead>
                        <TableHead className="text-gray-300 text-right font-semibold">Balance</TableHead>
                        <TableHead className="text-gray-300 text-right font-semibold">USD Value</TableHead>
                        <TableHead className="text-gray-300 text-center font-semibold">Contract</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.holdings.map((holding, index) => (
                        <motion.tr
                          key={holding.address}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-accent/20 hover:bg-white/5 transition-colors group"
                        >
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
                              className="text-gray-400 hover:text-white transition-colors inline-flex items-center font-mono text-sm group"
                            >
                              {formatAddress(holding.address)}
                              <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </a>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {data?.holdings.map((holding, index) => (
                    <motion.div
                      key={holding.address}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
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
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-4 rounded-xl backdrop-blur-xl border-white/10"
          >
            <div className="flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
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
