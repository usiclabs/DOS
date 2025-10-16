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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWalletContext } from "@/contexts/wallet-context"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import { supportsEIP5792, sendCalls, waitForCallsConfirmation } from "@/lib/eip5792"

interface TokenCard {
  symbol: string
  name: string
  address: string
  priceUsd: number
  priceChange24h: number
  volume24h: number
  liquidity: number
  avgApy: number
  pools: {
    pairAddress: string
    quoteToken: string
    dexId: string
    apy: number
    liquidity: number
  }[]
  isDeusPool: boolean
  isTrending?: boolean
}

export function TokenDiscoverMode() {
  const { toast } = useToast()
  const { address } = useWalletContext()
  const [tokens, setTokens] = useState<TokenCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    setIsLoading(true)
    try {
      const [poolsResponse, trendingResponse] = await Promise.all([
        fetch("/api/pools?limit=100&sortBy=netApy"), // Increased limit to fetch more pools
        fetch("/api/trending-tokens"),
      ])

      if (!poolsResponse.ok) throw new Error("Failed to fetch pools")

      const poolsData = await poolsResponse.json()
      const pools = poolsData.pools || []

      console.log("[v0] Fetched", pools.length, "pools from API")

      const tokenMap = new Map<string, TokenCard>()

      pools.forEach((pool: any) => {
        const token = pool.baseToken
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
            pools: [],
            isDeusPool: pool.isDeusPool,
            isTrending: false,
          })
        }

        const tokenCard = tokenMap.get(token.address)!
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
            pools: token.pairs.map((pair: any) => ({
              pairAddress: pair.pairAddress,
              quoteToken: pair.quoteToken,
              dexId: pair.dexId,
              apy: 0,
              liquidity: pair.liquidity,
            })),
            isDeusPool: false,
            isTrending: true,
          })
        })
      }

      const tokenCards = Array.from(tokenMap.values())
        .filter((token) => {
          const hasAnyPool = token.pools.length > 0
          const hasSomeLiquidity = token.pools.some((p) => p.liquidity > 1)
          return hasAnyPool && hasSomeLiquidity
        })
        .map((token) => ({
          ...token,
          avgApy: token.pools.length > 0 ? token.pools.reduce((sum, p) => sum + p.apy, 0) / token.pools.length : 0,
        }))
        .sort((a, b) => {
          if (a.isDeusPool && !b.isDeusPool) return -1
          if (!a.isDeusPool && b.isDeusPool) return 1
          if (a.isTrending && !b.isTrending) return -1
          if (!a.isTrending && b.isTrending) return 1
          return b.volume24h - a.volume24h
        })

      setTokens(tokenCards)
      console.log("[v0] Loaded", tokenCards.length, "tradeable tokens for discovery (including trending)")
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

      // Priority: Uniswap with WETH > Uniswap with DEUS > Any WETH > Any DEUS > Highest liquidity
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

      if (!selectedPool.dexId.toLowerCase().includes("uniswap")) {
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

      if (window.ethereum) {
        try {
          console.log("[v0] Configuring MetaMask to use BlastAPI RPC...")
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x2105",
                chainName: "Base",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://base-mainnet.blastapi.io/d6d4ab7c-d1de-4412-9a48-ae9c7965285c"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          })
        } catch (addError: any) {
          if (addError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x2105" }],
            })
          }
        }
      }

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

      if (!executeResponse.ok) throw new Error("Failed to prepare transaction")

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
          gas: `0x${BigInt(transaction.gasLimit).toString(16)}`,
        }

        if (transaction.nonce) {
          txParams.nonce = transaction.nonce
        }
        if (transaction.maxFeePerGas) {
          txParams.maxFeePerGas = transaction.maxFeePerGas
        }
        if (transaction.maxPriorityFeePerGas) {
          txParams.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas
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
          transport: http("https://base-mainnet.blastapi.io/d6d4ab7c-d1de-4412-9a48-ae9c7965285c"),
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
      } else {
        toast({
          title: "Purchase Failed",
          description: error.message || "Failed to complete purchase. Skipping to next token.",
          variant: "destructive",
        })
        handleSkip()
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
          <p className="text-muted-foreground">Loading tokens...</p>
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
      <div className="relative h-[600px]">
        {currentIndex + 1 < tokens.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="w-full h-[580px] bg-card/50 border-border scale-95 opacity-50" />
          </div>
        )}

        <motion.div
          className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          whileTap={{ cursor: "grabbing" }}
        >
          <Card className="w-full h-[580px] bg-gradient-to-br from-card to-card/80 border-emerald-500/20 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-3xl font-bold">{currentToken.symbol}</h2>
                    {currentToken.isDeusPool && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">DEUS</Badge>
                    )}
                    {currentToken.isTrending && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentToken.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hover:bg-white/5"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              </div>

              <div className="space-y-1">
                <div className="text-4xl font-bold">{formatNumber(currentToken.priceUsd)}</div>
                <div
                  className={`flex items-center text-sm ${currentToken.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {currentToken.priceChange24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {formatPercent(currentToken.priceChange24h)} (24h)
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    24h Volume
                  </div>
                  <div className="text-xl font-semibold">{formatNumber(currentToken.volume24h)}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Droplets className="w-4 h-4 mr-1" />
                    Liquidity
                  </div>
                  <div className="text-xl font-semibold">{formatNumber(currentToken.liquidity)}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-sm text-muted-foreground mb-1">Average APY</div>
                <div className="text-3xl font-bold text-emerald-400">{currentToken.avgApy.toFixed(2)}%</div>
                <div className="text-xs text-muted-foreground mt-1">Across {currentToken.pools.length} pools</div>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-4 border-t border-border/50"
                >
                  <div className="text-sm font-medium">Trading Pairs</div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {currentToken.pools.slice(0, 5).map((pool, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <div className="text-sm">
                          {currentToken.symbol}/{pool.quoteToken}
                          <div className="text-xs text-muted-foreground">{pool.dexId}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-emerald-400">{pool.apy.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">{formatNumber(pool.liquidity)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={handleSkip}
          disabled={isBuying}
          className="w-16 h-16 rounded-full border-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500 bg-transparent"
        >
          <X className="w-8 h-8 text-red-400" />
        </Button>

        <Button
          size="lg"
          onClick={handleBuy}
          disabled={isBuying || !address}
          className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
        >
          {isBuying ? <Loader2 className="w-10 h-10 animate-spin" /> : <Heart className="w-10 h-10" />}
        </Button>
      </div>

      <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <X className="w-4 h-4 text-red-400" />
          Swipe left to skip
        </div>
        <div className="flex items-center gap-2">
          Swipe right to buy
          <Heart className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {currentIndex + 1} / {tokens.length} tokens
      </div>
    </div>
  )
}
