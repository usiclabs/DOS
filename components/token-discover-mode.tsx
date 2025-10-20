"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  X,
  Heart,
  Loader2,
  Sparkles,
  BarChart3,
  Droplets,
  Zap,
  Users,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWalletContext } from "@/contexts/wallet-context"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import { supportsEIP5792, sendCalls, waitForCallsConfirmation } from "@/lib/eip5792"
import Image from "next/image"

interface TokenCard {
  symbol: string
  name: string
  address: string
  priceUsd: number
  priceChange24h: number
  volume24h: number
  liquidity: number
  avgApy: number
  image?: string
  pools: {
    pairAddress: string
    quoteToken: string
    dexId: string
    apy: number
    liquidity: number
  }[]
  isDeusPool: boolean
  isTrending?: boolean
  isCreatorCoin?: boolean
  creator?: {
    address: string
    name?: string
    avatar?: string
  }
  holders?: number
}

export function TokenDiscoverMode() {
  const { toast } = useToast()
  const { address } = useWalletContext()
  const [tokens, setTokens] = useState<TokenCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const TOKENS_PER_PAGE = 15

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async (page = 0) => {
    setIsLoading(true)
    try {
      const [poolsResponse, trendingResponse, creatorsResponse] = await Promise.all([
        fetch("/api/pools?limit=100&sortBy=netApy"),
        fetch("/api/trending-tokens"),
        fetch("/api/zora/creators?limit=100"), // Increased limit to get more creator coins
      ])

      if (!poolsResponse.ok) throw new Error("Failed to fetch pools")

      const poolsData = await poolsResponse.json()
      const pools = poolsData.pools || []

      console.log("[v0] Fetched", pools.length, "pools from API")

      const tokenMap = new Map<string, TokenCard>()

      pools.forEach((pool: any) => {
        const token = pool.baseToken
        // Try multiple sources for token image
        const tokenImage = pool.info?.imageUrl || token.image || pool.baseToken?.logoURI || null

        if (!tokenMap.has(token.address)) {
          tokenMap.set(token.address, {
            symbol: token.symbol,
            name: token.name,
            address: token.address,
            priceUsd: pool.priceUsd,
            priceChange24h: pool.priceChange24h,
            volume24h: 0,
            liquidity: 0,
            avgApy: 0,
            image: tokenImage,
            pools: [],
            isDeusPool: pool.isDeusPool,
            isTrending: false,
            isCreatorCoin: false,
          })
        }

        const tokenCard = tokenMap.get(token.address)!
        // Update image if we found a better one
        if (!tokenCard.image && tokenImage) {
          tokenCard.image = tokenImage
        }
        tokenCard.volume24h += pool.volume24h
        tokenCard.liquidity += pool.liquidity
        tokenCard.pools.push({
          pairAddress: pool.pairAddress,
          quoteToken: pool.quoteToken.symbol,
          dexId: pool.dexId,
          apy: pool.netApy,
          liquidity: pool.liquidity,
        })
      })

      console.log("[v0] Created token map with", tokenMap.size, "unique tokens")

      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json()
        const trendingTokens = trendingData.tokens || []

        console.log("[v0] Adding", trendingTokens.length, "trending tokens to discovery")

        trendingTokens.forEach((token: any) => {
          if (tokenMap.has(token.address.toLowerCase())) {
            const existingToken = tokenMap.get(token.address.toLowerCase())!
            existingToken.isTrending = true
            // Update image if trending token has one
            if (token.image && !existingToken.image) {
              existingToken.image = token.image
            }
            return
          }

          tokenMap.set(token.address.toLowerCase(), {
            symbol: token.symbol,
            name: token.name,
            address: token.address,
            priceUsd: token.priceUsd,
            priceChange24h: token.priceChange24h,
            volume24h: token.volume24h,
            liquidity: token.liquidity,
            avgApy: 0,
            image: token.image,
            pools: token.pairs.map((pair: any) => ({
              pairAddress: pair.pairAddress,
              quoteToken: pair.quoteToken,
              dexId: pair.dexId,
              apy: 0,
              liquidity: pair.liquidity,
            })),
            isDeusPool: false,
            isTrending: true,
            isCreatorCoin: false,
          })
        })
      }

      if (creatorsResponse.ok) {
        const creatorsData = await creatorsResponse.json()
        const creatorCoins = creatorsData.coins || []

        console.log("[v0] Processing", creatorCoins.length, "creator coins for discovery")

        creatorCoins.forEach((coin: any) => {
          const estimatedApy =
            coin.metrics.liquidity > 0 ? (coin.metrics.volume24h / coin.metrics.liquidity) * 365 * 100 : 0

          const creatorImage = coin.mediaContent?.previewImage?.medium || coin.image || null

          if (estimatedApy > 5 || coin.trending || coin.metrics.volume24h > 1000) {
            tokenMap.set(coin.address.toLowerCase(), {
              symbol: coin.symbol,
              name: coin.name,
              address: coin.address,
              priceUsd: coin.metrics.price,
              priceChange24h: coin.metrics.priceChange24h,
              volume24h: coin.metrics.volume24h,
              liquidity: coin.metrics.liquidity,
              avgApy: estimatedApy,
              image: creatorImage,
              pools: coin.poolAddress
                ? [
                    {
                      pairAddress: coin.poolAddress,
                      quoteToken: coin.quoteToken || "ETH",
                      dexId: "Zora",
                      apy: estimatedApy,
                      liquidity: coin.metrics.liquidity,
                    },
                  ]
                : [],
              isDeusPool: false,
              isTrending: coin.trending,
              isCreatorCoin: true,
              creator: coin.creator,
              holders: coin.metrics.holders,
            })
          }
        })

        console.log("[v0] Added", tokenMap.size - pools.length, "creator coins to discovery")
      }

      const tokenCards = Array.from(tokenMap.values())
        .filter((token) => {
          const hasAnyPool = token.pools.length > 0
          const hasSomeLiquidity = token.pools.some((p) => p.liquidity > 1) || token.liquidity > 1
          return hasAnyPool && hasSomeLiquidity
        })
        .map((token) => ({
          ...token,
          avgApy:
            token.pools.length > 0 ? token.pools.reduce((sum, p) => sum + p.apy, 0) / token.pools.length : token.avgApy,
        }))
        .sort((a, b) => {
          if (a.isDeusPool && !b.isDeusPool) return -1
          if (!a.isDeusPool && b.isDeusPool) return 1
          if (a.isCreatorCoin && a.avgApy > 50 && (!b.isCreatorCoin || b.avgApy <= 50)) return -1
          if (b.isCreatorCoin && b.avgApy > 50 && (!a.isCreatorCoin || a.avgApy <= 50)) return 1
          if (a.isTrending && !b.isTrending) return -1
          if (!a.isTrending && b.isTrending) return 1
          return b.volume24h - a.volume24h
        })

      const startIndex = page * TOKENS_PER_PAGE
      const endIndex = startIndex + TOKENS_PER_PAGE
      const paginatedTokens = tokenCards.slice(startIndex, endIndex)

      setTokens(page === 0 ? paginatedTokens : [...tokens, ...paginatedTokens])
      setHasMore(endIndex < tokenCards.length)
      setCurrentPage(page)

      console.log(
        "[v0] Loaded page",
        page + 1,
        "with",
        paginatedTokens.length,
        "tokens (",
        tokenCards.length,
        "total available)",
      )
    } catch (error) {
      console.error("[v0] Failed to fetch tokens:", error)
      toast({
        title: "Failed to Load Tokens",
        description: "Could not fetch token data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (currentIndex >= tokens.length - 2 && hasMore && !isLoading) {
      console.log("[v0] Loading more tokens...")
      fetchTokens(currentPage + 1)
    }
  }, [currentIndex, tokens.length, hasMore, isLoading, currentPage])

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const swipeThreshold = 100

    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        await handleBuy()
      } else {
        handleSkip()
      }
    }
  }

  const handleSkip = () => {
    setIsExpanded(false)
    setCurrentIndex((prev) => prev + 1)
    x.set(0)
  }

  const handleBuy = async () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to buy tokens",
        variant: "destructive",
      })
      return
    }

    const token = tokens[currentIndex]
    if (!token) return

    setIsBuying(true)

    try {
      console.log("[v0] Auto-buying 0.00001 ETH worth of", token.symbol)

      const uniswapPools = token.pools.filter((p) => p.dexId.toLowerCase().includes("uniswap"))
      const wethPools = token.pools.filter((p) => p.quoteToken === "WETH" || p.quoteToken === "ETH")
      const deusPools = token.pools.filter((p) => p.quoteToken === "DEUS")

      let selectedPool = uniswapPools.find(
        (p) => (p.quoteToken === "WETH" || p.quoteToken === "ETH") && p.liquidity > 10,
      )

      if (!selectedPool) {
        selectedPool = uniswapPools.find((p) => p.quoteToken === "DEUS" && p.liquidity > 10)
      }

      if (!selectedPool) {
        selectedPool = wethPools.find((p) => p.liquidity > 10)
      }

      if (!selectedPool) {
        selectedPool = deusPools.find((p) => p.liquidity > 10)
      }

      if (!selectedPool && token.pools.length > 0) {
        selectedPool = token.pools.reduce((best, current) => (current.liquidity > best.liquidity ? current : best))
      }

      if (!selectedPool) {
        console.error("[v0] No valid pool found for token")
        toast({
          title: "Not Available on Uniswap",
          description: (
            <div className="space-y-2">
              <p>{token.symbol} is available on other DEXs.</p>
              {token.pools.length > 0 && (
                <a
                  href={`https://dexscreener.com/base/${token.pools[0].pairAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm block"
                >
                  Trade on {token.pools[0].dexId} →
                </a>
              )}
            </div>
          ),
        })
        handleSkip()
        return
      }

      if (!selectedPool.dexId.toLowerCase().includes("uniswap") && !token.isCreatorCoin) {
        toast({
          title: "Available on " + selectedPool.dexId,
          description: (
            <div className="space-y-2">
              <p>{token.symbol} is not available on Uniswap V3.</p>
              <a
                href={`https://dexscreener.com/base/${selectedPool.pairAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm block"
              >
                Trade on {selectedPool.dexId} →
              </a>
            </div>
          ),
        })
        handleSkip()
        return
      }

      const baseTokenAddress =
        selectedPool.quoteToken === "DEUS"
          ? "0x73582df1cad3187cD0746b7A473d65c06386837e" // DEUS
          : "0x4200000000000000000000000000000000000006" // WETH

      console.log(
        "[v0] Using base token:",
        selectedPool.quoteToken,
        "from pool:",
        selectedPool.pairAddress,
        "on",
        selectedPool.dexId,
      )

      const supportsEIP5792Batch = await supportsEIP5792()
      console.log("[v0] Wallet supports EIP-5792:", supportsEIP5792Batch)

      const quoteResponse = await fetch("/api/swap/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromToken: baseTokenAddress,
          toToken: token.address,
          amount: "0.00001",
          userAddress: address,
          poolHint: selectedPool.pairAddress,
        }),
      })

      if (!quoteResponse.ok) {
        const errorData = await quoteResponse.json()

        if (errorData.error === "NO_LIQUIDITY") {
          toast({
            title: "No Liquidity Available",
            description: `${token.symbol} doesn't have enough liquidity for trading. Skipping to next token.`,
          })
          handleSkip()
          return
        }

        throw new Error(errorData.message || "Failed to get quote")
      }

      const quote = await quoteResponse.json()

      const executeResponse = await fetch("/api/swap/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote,
          userAddress: address,
          slippage: 0.5,
        }),
      })

      if (!executeResponse.ok) {
        const errorText = await executeResponse.text()
        console.error("[v0] Execute API error:", errorText)
        throw new Error("Failed to prepare transaction")
      }

      const txData = await executeResponse.json()

      if (!txData.transaction) {
        throw new Error("No transaction data in response")
      }

      const { transaction } = txData

      if (supportsEIP5792Batch) {
        console.log("[v0] Using EIP-5792 batch transaction...")

        try {
          const bundleId = await sendCalls({
            version: "1.0",
            chainId: "0x2105", // Base chain ID
            from: address,
            calls: [
              {
                to: transaction.to,
                value: transaction.value || "0x0",
                data: transaction.data,
              },
            ],
          })

          console.log("[v0] Batch transaction submitted:", bundleId)

          toast({
            title: "Transaction Submitted",
            description: "Waiting for confirmation...",
          })

          const status = await waitForCallsConfirmation(bundleId, 120000, 3000)

          if (status.status === "CONFIRMED" && status.receipts && status.receipts.length > 0) {
            const receipt = status.receipts[0]
            console.log("[v0] Batch transaction confirmed!")

            toast({
              title: "Purchase Successful!",
              description: (
                <div className="space-y-1">
                  <p>
                    Bought {quote.toAmount.toFixed(4)} {token.symbol}
                  </p>
                  <a
                    href={`https://basescan.org/tx/${receipt.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    View on BaseScan →
                  </a>
                </div>
              ),
            })

            setIsExpanded(false)
            setCurrentIndex((prev) => prev + 1)
            x.set(0)
          } else {
            throw new Error("Batch transaction failed")
          }
        } catch (eip5792Error: any) {
          console.error(
            "[v0] EIP-5792 batch transaction failed, falling back to traditional transaction:",
            eip5792Error,
          )
          throw eip5792Error
        }
      } else {
        console.log("[v0] Using traditional transaction method...")
        console.log("[v0] Sending transaction to wallet...")

        const txParams: any = {
          from: address,
          to: transaction.to,
          data: transaction.data,
          value: `0x${BigInt(transaction.value || 0).toString(16)}`,
        }

        if (transaction.gasLimit) {
          txParams.gas = `0x${BigInt(transaction.gasLimit).toString(16)}`
        }

        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [txParams],
        })

        console.log("[v0] Transaction sent:", txHash)

        toast({
          title: "Transaction Submitted",
          description: "Waiting for confirmation...",
        })

        const publicClient = createPublicClient({
          chain: base,
          transport: http("https://mainnet.base.org"), // Using official Base RPC
        })

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash as `0x${string}`,
          timeout: 120_000,
          pollingInterval: 3_000,
        })

        if (receipt.status === "success") {
          console.log("[v0] Transaction confirmed!")
          toast({
            title: "Purchase Successful!",
            description: (
              <div className="space-y-1">
                <p>
                  Bought {quote.toAmount.toFixed(4)} {token.symbol}
                </p>
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  View on BaseScan →
                </a>
              </div>
            ),
          })

          setIsExpanded(false)
          setCurrentIndex((prev) => prev + 1)
          x.set(0)
        } else {
          throw new Error("Transaction reverted on-chain")
        }
      }
    } catch (error: any) {
      console.error("[v0] Auto-buy failed:", error)

      if (error.code === 4001 || error.message?.includes("User rejected") || error.message?.includes("User denied")) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction",
        })
      } else if (error.message?.includes("reverted")) {
        toast({
          title: "Transaction Reverted",
          description: "The transaction failed on-chain. This may be due to insufficient liquidity or price movement.",
          variant: "destructive",
        })
        handleSkip()
      } else if (error.message?.includes("rate limit") || error.message?.includes("Too Many Requests")) {
        toast({
          title: "Network Busy",
          description: "The network is experiencing high traffic. Please try again in a moment.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Purchase Failed",
          description: error.message || "Failed to complete purchase. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsBuying(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPercent = (num: number) => {
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto" />
          <p className="text-muted-foreground">Loading premium opportunities...</p>
        </div>
      </div>
    )
  }

  if (currentIndex >= tokens.length) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Sparkles className="w-16 h-16 text-emerald-400 mx-auto" />
          <h3 className="text-2xl font-bold">You've seen all tokens!</h3>
          <p className="text-muted-foreground">Check back later for more opportunities</p>
          <Button onClick={() => setCurrentIndex(0)} className="bg-emerald-500 hover:bg-emerald-600">
            Start Over
          </Button>
        </div>
      </div>
    )
  }

  const currentToken = tokens[currentIndex]

  return (
    <div className="relative w-full max-w-md mx-auto px-4 py-8">
      <div className="relative h-[620px] md:h-[640px]">
        {/* Next card preview */}
        {currentIndex + 1 < tokens.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="w-full h-[600px] md:h-[620px] bg-card/30 border-border/30 scale-95 opacity-40 blur-sm" />
          </div>
        )}

        {/* Current card with glassmorphism and token image background */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          whileTap={{ cursor: "grabbing", scale: 0.98 }}
        >
          <Card className="w-full h-[600px] md:h-[620px] relative overflow-hidden border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
            <div className="absolute inset-0 overflow-hidden">
              {currentToken.image ? (
                <>
                  <Image
                    src={currentToken.image || "/placeholder.svg"}
                    alt={currentToken.symbol}
                    fill
                    className="object-cover scale-110 blur-3xl opacity-30"
                    unoptimized
                    onError={(e) => {
                      console.log("[v0] Failed to load image:", currentToken.image)
                      e.currentTarget.style.display = "none"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-xl" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-background to-purple-500/10" />
              )}
            </div>

            <motion.div
              className="absolute inset-0 opacity-50"
              animate={{
                background: [
                  "linear-gradient(0deg, rgba(16,185,129,0.1) 0%, transparent 50%)",
                  "linear-gradient(360deg, rgba(16,185,129,0.1) 0%, transparent 50%)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col">
              <div className="p-5 md:p-6 border-b border-border/30 backdrop-blur-sm bg-background/40">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        {currentToken.symbol}
                      </h2>
                      {currentToken.isDeusPool && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 backdrop-blur-sm">
                          <Zap className="w-3 h-3 mr-1" />
                          DEUS
                        </Badge>
                      )}
                      {currentToken.isTrending && (
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40 backdrop-blur-sm">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {currentToken.isCreatorCoin && (
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 backdrop-blur-sm">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Creator
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{currentToken.name}</p>
                    {currentToken.isCreatorCoin && currentToken.creator && (
                      <div className="flex items-center gap-2 mt-2">
                        {currentToken.creator.avatar && (
                          <Image
                            src={currentToken.creator.avatar || "/placeholder.svg"}
                            alt={currentToken.creator.name || "Creator"}
                            width={20}
                            height={20}
                            className="rounded-full"
                            unoptimized
                          />
                        )}
                        <span className="text-xs text-emerald-400">by {currentToken.creator.name}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="hover:bg-white/10 backdrop-blur-sm shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                    {formatNumber(currentToken.priceUsd)}
                  </div>
                  <div
                    className={`flex items-center text-base md:text-lg font-medium ${
                      currentToken.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {currentToken.priceChange24h >= 0 ? (
                      <TrendingUp className="w-5 h-5 mr-2" />
                    ) : (
                      <TrendingDown className="w-5 h-5 mr-2" />
                    )}
                    {formatPercent(currentToken.priceChange24h)} (24h)
                  </div>
                </div>
              </div>

              <div className="flex-1 p-5 md:p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      24h Volume
                    </div>
                    <div className="text-xl md:text-2xl font-bold">{formatNumber(currentToken.volume24h)}</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Droplets className="w-4 h-4 mr-2" />
                      Liquidity
                    </div>
                    <div className="text-xl md:text-2xl font-bold">{formatNumber(currentToken.liquidity)}</div>
                  </motion.div>
                </div>

                {currentToken.isCreatorCoin && currentToken.holders && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm"
                  >
                    <div className="flex items-center text-sm text-purple-300 mb-2">
                      <Users className="w-4 h-4 mr-2" />
                      Holders
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-purple-200">
                      {currentToken.holders.toLocaleString()}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500/30 backdrop-blur-sm shadow-lg shadow-emerald-500/10"
                >
                  <div className="text-sm text-emerald-200 mb-2 font-medium">
                    {currentToken.isCreatorCoin ? "Estimated APY" : "Average APY"}
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-emerald-300 mb-1">
                    {currentToken.avgApy.toFixed(2)}%
                  </div>
                  <div className="text-xs text-emerald-200/80">
                    {currentToken.isCreatorCoin
                      ? "Based on volume/liquidity ratio"
                      : `Across ${currentToken.pools.length} pool${currentToken.pools.length > 1 ? "s" : ""}`}
                  </div>
                </motion.div>

                {isExpanded && currentToken.pools.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-2"
                  >
                    <div className="text-sm font-medium text-muted-foreground">Trading Pairs</div>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                      {currentToken.pools.slice(0, 5).map((pool, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                          <div className="text-sm">
                            <div className="font-medium">
                              {currentToken.symbol}/{pool.quoteToken}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">{pool.dexId}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-emerald-400">{pool.apy.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">{formatNumber(pool.liquidity)}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.a
                  href={`https://dexscreener.com/base/${currentToken.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on DexScreener
                </motion.a>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-8 mt-8">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSkip}
            disabled={isBuying}
            className="w-20 h-20 rounded-full border-2 border-red-500/40 hover:bg-red-500/20 hover:border-red-500 bg-background/80 backdrop-blur-sm shadow-lg"
          >
            <X className="w-10 h-10 text-red-400" />
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(16,185,129,0.4)",
              "0 0 60px rgba(16,185,129,0.6)",
              "0 0 20px rgba(16,185,129,0.4)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="rounded-full"
        >
          <Button
            size="lg"
            onClick={handleBuy}
            disabled={isBuying || !address}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/90 to-emerald-600/90 hover:from-emerald-500 hover:to-emerald-600 shadow-2xl border-2 border-emerald-400/50 backdrop-blur-sm"
          >
            {isBuying ? <Loader2 className="w-12 h-12 animate-spin" /> : <Heart className="w-12 h-12 fill-current" />}
          </Button>
        </motion.div>
      </div>

      <div className="flex items-center justify-between mt-6 px-2 text-sm text-muted-foreground">
        <motion.div
          className="flex items-center gap-2"
          animate={{ x: [-5, 0, -5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <X className="w-4 h-4 text-red-400" />
          <span className="hidden sm:inline">Swipe left to skip</span>
          <span className="sm:hidden">Skip</span>
        </motion.div>
        <div className="text-center font-medium">
          {currentIndex + 1} / {tokens.length}
        </div>
        <motion.div
          className="flex items-center gap-2"
          animate={{ x: [5, 0, 5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <span className="hidden sm:inline">Swipe right to buy</span>
          <span className="sm:hidden">Buy</span>
          <Heart className="w-4 h-4 text-emerald-400" />
        </motion.div>
      </div>
    </div>
  )
}
