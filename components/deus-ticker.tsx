"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart3,
  AlertCircle,
  Wifi,
  WifiOff,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTickerStore } from "@/lib/ticker-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { AnimatePresence, motion } from "framer-motion"
import { getTokenAddress } from "@/lib/constants"
import { DeployModal } from "@/components/deploy-modal"
import { useToast } from "@/hooks/use-toast"

const DEUS_CONTRACT_ADDRESS = "0xECE5d962d17901ef200Da050C7c74AB45C96Db07"

export function DeusTicker() {
  const [isPaused, setIsPaused] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedPool, setSelectedPool] = useState<any>(null)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { data: tickerData, isLoading, error, fetchTicker } = useTickerStore()
  const isMobile = useIsMobile()
  const { toast } = useToast()

  useEffect(() => {
    fetchTicker()

    const interval = setInterval(() => {
      fetchTicker()
    }, 300000) // Increased interval from 60s to 5 minutes to reduce API calls

    return () => clearInterval(interval)
  }, [fetchTicker])

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toFixed(2)
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString()
  }

  const getStatusIcon = () => {
    if (isLoading) return <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse" />
    if (error || !tickerData || tickerData?.status === "error") return <WifiOff className="h-4 w-4 text-red-400" />
    if (tickerData?.status === "degraded") return <AlertCircle className="h-4 w-4 text-yellow-400" />
    return <Wifi className="h-4 w-4 text-green-400" />
  }

  const getStatusText = () => {
    if (isLoading) return "Loading live data..."
    if (error || !tickerData) return "No live data available"
    if (tickerData?.status === "error") return "Data unavailable"
    if (tickerData?.status === "degraded") return `Last update: ${formatTime(tickerData.lastUpdatedISO)}`
    return "Live"
  }

  const handlePairClick = (pair: any) => {
    const baseAddress = pair.baseAddress || getTokenAddress(pair.base)
    const quoteAddress = pair.quoteAddress || getTokenAddress(pair.quote)

    if (!baseAddress || !quoteAddress) {
      return
    }

    let detectedPairingToken: "DEUS" | "ETH" | "USDC" | "ZORA" = "ETH"
    const quoteSymbol = pair.quote.toUpperCase()
    if (quoteSymbol === "DEUS") detectedPairingToken = "DEUS"
    else if (quoteSymbol === "USDC") detectedPairingToken = "USDC"
    else if (quoteSymbol === "ZORA") detectedPairingToken = "ZORA"
    else if (quoteSymbol === "WETH" || quoteSymbol === "ETH") detectedPairingToken = "ETH"

    const poolData = {
      id: `${pair.base}-${pair.quote}`,
      pairAddress: pair.pairAddress || "0x0000000000000000000000000000000000000000",
      baseToken: {
        address: baseAddress,
        symbol: pair.base,
        name: pair.base,
      },
      quoteToken: {
        address: quoteAddress,
        symbol: pair.quote,
        name: pair.quote,
      },
      dexId: pair.dexId || "uniswap",
      priceUsd: tickerData?.priceUsd || 0,
      volume24h: tickerData?.volume24hUsd || 0,
      liquidity: pair.liquidity?.usd || tickerData?.liquidityUsd || 0,
      feeApr: pair.apy24h || 0,
      netApy: pair.apy24h || 0,
      feeTier: pair.feeTier || "0.3%",
      poolType: "v3" as const,
      isDeusPool: pair.base === "DEUS" || pair.quote === "DEUS",
      volatility: 10,
      detectedPairingToken,
    }

    setSelectedPool(poolData)
    setIsDeployModalOpen(true)
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(DEUS_CONTRACT_ADDRESS)
      setIsCopied(true)
      toast({
        title: "Contract Address Copied",
        description: `${DEUS_CONTRACT_ADDRESS} copied to clipboard`,
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy contract address",
        variant: "destructive",
      })
    }
  }

  if (!tickerData || tickerData.priceUsd === 0) {
    return (
      <div className="fixed top-20 left-0 right-0 z-40 w-full bg-black/30 backdrop-blur-xl border-y border-white/20 shadow-[0_1px_0_0_rgba(255,255,255,0.1),0_-1px_0_0_rgba(255,255,255,0.1),0_4px_20px_rgba(0,0,0,0.5)] py-2 pointer-events-none">
        <div className="flex items-center justify-center px-4 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
            <span className="text-xs">• $DEUS live data will appear when available</span>
          </div>
        </div>
      </div>
    )
  }

  const tickerItems = [
    {
      icon: <DollarSign className="h-4 w-4" />,
      label: "$DEUS",
      value: `$${tickerData.priceUsd.toFixed(6)}`, // Increased decimal places from 4 to 6
    },
    {
      icon: tickerData.change24hPct >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
      label: "24h",
      value: `${tickerData.change24hPct >= 0 ? "+" : ""}${tickerData.change24hPct.toFixed(2)}%`,
      className: tickerData.change24hPct >= 0 ? "text-green-400" : "text-red-400",
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: "Vol(24h)",
      value: `$${formatNumber(tickerData.volume24hUsd)}`,
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: "Liquidity",
      value: `$${formatNumber(tickerData.liquidityUsd)}`,
    },
    ...(tickerData.fdvUsd
      ? [
          {
            icon: <DollarSign className="h-4 w-4" />,
            label: "FDV",
            value: `$${formatNumber(tickerData.fdvUsd)}`,
          },
        ]
      : []),
    ...(tickerData.holders
      ? [
          {
            icon: <Users className="h-4 w-4" />,
            label: "Holders",
            value: formatNumber(tickerData.holders),
          },
        ]
      : []),
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: "Top Pairs",
      value:
        tickerData.topPairs.length > 0
          ? tickerData.topPairs
              .slice(0, 2)
              .map((p) => `${p.base}/${p.quote}`)
              .join(", ")
          : "No pairs available",
    },
  ]

  return (
    <>
      <div className="fixed top-20 left-0 right-0 z-40 w-full bg-black/25 backdrop-blur-lg border-y border-white/8 shadow-[0_2px_16px_rgba(0,0,0,0.2)] py-2 overflow-hidden pointer-events-none">
        <div className="flex items-center justify-between px-4 mb-1">
          <div className="flex items-center space-x-2 text-xs">
            {getStatusIcon()}
            <span className="text-gray-400">{getStatusText()}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors pointer-events-auto"
            aria-label={showDetails ? "Hide ticker details" : "View ticker details"}
          >
            {showDetails ? "Hide Details" : "View Details"}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tickerData?.priceUsd}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center space-x-8 ${!isPaused ? "animate-marquee" : ""}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Duplicate items for seamless loop */}
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
                <span className={`flex items-center space-x-1 ${item.className || "text-white"}`}>
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}:</span>
                  <span className="text-sm font-bold">{item.value}</span>
                </span>
                {index < tickerItems.length * 2 - 1 && <span className="text-gray-400">•</span>}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[calc(5rem+3rem)] left-0 right-0 z-40 w-full bg-black/30 backdrop-blur-xl border-b border-white/20 overflow-hidden pointer-events-auto"
          >
            <div className="p-4">
              <div className="container mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">$DEUS Token Details</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="flex items-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-200 pointer-events-auto"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-xs">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="text-xs">Copy Contract</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Price</div>
                    <div className="text-lg font-bold text-white">${tickerData.priceUsd.toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">24h Change</div>
                    <div
                      className={`text-lg font-bold ${tickerData.change24hPct >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {tickerData.change24hPct >= 0 ? "+" : ""}
                      {tickerData.change24hPct.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Market Cap</div>
                    <div className="text-lg font-bold text-white">
                      {tickerData.marketCapUsd ? `$${formatNumber(tickerData.marketCapUsd)}` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">24h Volume</div>
                    <div className="text-lg font-bold text-white">${formatNumber(tickerData.volume24hUsd)}</div>
                  </div>
                </div>

                {tickerData.topPairs.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-400 mb-2">Top Trading Pairs</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {tickerData.topPairs.map((pair, index) => (
                        <button
                          key={index}
                          onClick={() => handlePairClick(pair)}
                          className="bg-white/5 border border-white/10 p-3 rounded backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200 active:scale-95 text-left cursor-pointer pointer-events-auto"
                        >
                          <div className="font-medium text-white">
                            {pair.base}/{pair.quote}
                          </div>
                          <div className="text-sm text-gray-400">
                            {pair.dexId && <span className="capitalize">{pair.dexId}</span>}
                            {pair.apy24h && <span className="ml-2">APY: {pair.apy24h.toFixed(1)}%</span>}
                          </div>
                          <div className="text-xs text-green-400 mt-1 animate-pulse drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
                            Tap to deploy liquidity →
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeployModal pool={selectedPool} isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} />
    </>
  )
}
