"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowDownUp, TrendingUp, RefreshCw, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { TokenHoldingsTable } from "@/components/swap/token-holdings-table"
import { SwapQuote } from "@/components/swap/swap-quote"
import { SwapConfirmation } from "@/components/swap/swap-confirmation"
import { StickyHeader } from "@/components/sticky-header"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
import { PortfolioValueBanner } from "@/components/portfolio/portfolio-value-banner"
import { motion } from "framer-motion"
import { DeusTicker } from "@/components/deus-ticker"
import { useIsMobile } from "@/hooks/use-mobile"

const WagmiSwapHooks = dynamic(() => import("@/components/swap/wagmi-swap-hooks"), {
  ssr: false,
})

interface Token {
  symbol: string
  name: string
  address: string
  balance: number
  price: number
  logo: string
  decimals: number
}

interface TickerData {
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  status: string
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  hidden: { scale: 0 },
  visible: { scale: 1 },
}

function EnhancedWalletConnect({ onConnect }: { onConnect: (walletType: string) => Promise<boolean> }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true)
    setSelectedWallet(walletType)

    try {
      const success = await onConnect(walletType)
    } catch (error) {
      console.error("Wallet connection failed:", error)
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const wallets = [
    { id: "metamask", name: "MetaMask", icon: "🦊", recommended: true },
    { id: "coinbase", name: "Coinbase", icon: "🔵", recommended: false },
    { id: "walletconnect", name: "WalletConnect", icon: "📱", recommended: false },
  ]

  return (
    <div className="space-y-4">
      {wallets.map((wallet) => (
        <Button
          key={wallet.id}
          onClick={() => handleConnect(wallet.id)}
          disabled={isConnecting}
          className="w-full bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] hover:bg-white/5 p-4 h-auto"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{wallet.icon}</span>
            <div className="text-left">
              <div className="font-medium">{wallet.name}</div>
              {wallet.recommended && <div className="text-xs text-accent">Recommended</div>}
            </div>
            {isConnecting && selectedWallet === wallet.id && (
              <div className="ml-auto">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  )
}

export default function SwapPage() {
  const { toast } = useToast()
  const { isConnected, address, connectWallet } = useWallet()
  const isMobile = useIsMobile()

  const [fromToken, setFromToken] = useState("ETH")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [userTokens, setUserTokens] = useState<Token[]>([])
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [tickerData, setTickerData] = useState<TickerData | null>(null)
  const [isExecutingSwap, setIsExecutingSwap] = useState(false)
  const [retryStatus, setRetryStatus] = useState<{
    attempt?: number
    maxRetries?: number
    delay?: number
  }>({})
  const [transactionHash, setTransactionHash] = useState<string | undefined>()

  const DEUS_CONTRACT_ADDRESS = "0x73582df1cad3187cD0746b7A473d65c06386837e"

  const handleSwapExecution = useCallback(
    (swapData: any) => {
      setIsExecutingSwap(swapData.isExecuting)

      if (swapData.retryAttempt) {
        setRetryStatus({
          attempt: swapData.retryAttempt,
          maxRetries: swapData.maxRetries,
          delay: swapData.retryDelay,
        })
      } else {
        setRetryStatus({})
      }

      if (swapData.txHash) {
        setTransactionHash(swapData.txHash)
        const basescanUrl = `https://basescan.org/tx/${swapData.txHash}`

        if (swapData.isConfirmed) {
          toast({
            title: "Swap Completed Successfully!",
            description: (
              <a
                href={basescanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline"
              >
                View on Basescan →
              </a>
            ) as any,
            duration: 10000,
          })
          setTimeout(() => {
            setShowConfirmation(false)
            window.location.reload()
          }, 3000)
        } else {
          toast({
            title: "Transaction Submitted",
            description: "Waiting for blockchain confirmation...",
            duration: 5000,
          })
        }
      }

      if (swapData.error) {
        toast({
          title: "Swap Failed",
          description: swapData.error,
          variant: "destructive",
        })
        setIsExecutingSwap(false)
        setShowConfirmation(false)
        setTransactionHash(undefined)
        setRetryStatus({})
      }
    },
    [toast],
  )

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const response = await fetch("/api/ticker")
        if (response.ok) {
          const data = await response.json()
          setTickerData(data)
          console.log("[v0] Live DEUS price fetched:", data.price)
        }
      } catch (error) {
        console.error("[v0] Error fetching ticker data:", error)
      }
    }

    fetchTickerData()
    const interval = setInterval(fetchTickerData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchWalletBalances = async () => {
      if (!isConnected || !address) return

      setIsLoadingBalances(true)
      console.log("[v0] Fetching wallet balances for:", address)

      try {
        const response = await fetch(`/api/wallet/balances/${address}`)
        if (!response.ok) {
          throw new Error("Failed to fetch wallet balances")
        }

        const balances = await response.json()
        console.log("[v0] Wallet balances fetched:", balances)

        const tokensWithLivePrice =
          balances.tokens?.map((token: Token) => {
            if (token.symbol === "DEUS" && tickerData) {
              return { ...token, price: tickerData.price }
            }
            return token
          }) || []

        setUserTokens(tokensWithLivePrice)
      } catch (error) {
        console.error("[v0] Error fetching wallet balances:", error)
        setUserTokens([
          {
            symbol: "ETH",
            name: "Ethereum",
            address: "0x0000000000000000000000000000000000000000",
            balance: 0,
            price: 0,
            logo: "🔷",
            decimals: 18,
          },
        ])
      } finally {
        setIsLoadingBalances(false)
      }
    }

    fetchWalletBalances()
  }, [isConnected, address, tickerData])

  const selectedFromToken = userTokens.find((t) => t.symbol === fromToken)
  const deusToken = userTokens.find((t) => t.symbol === "DEUS")

  const handleGetQuote = async () => {
    if (!fromAmount || !selectedFromToken) return

    setIsLoading(true)
    console.log("[v0] Getting swap quote for:", { fromToken, fromAmount, toToken: "DEUS" })

    try {
      const response = await fetch("/api/swap/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromToken: selectedFromToken.address,
          toToken: DEUS_CONTRACT_ADDRESS,
          amount: fromAmount,
          userAddress: address,
          liveDEUSPrice: tickerData?.price,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get swap quote")
      }

      const quoteData = await response.json()
      console.log("[v0] Swap quote received:", quoteData)

      setToAmount(quoteData.toAmount)
      setQuote(quoteData)
    } catch (error) {
      console.error("[v0] Failed to get quote:", error)
      const fromAmountNum = Number.parseFloat(fromAmount)
      const fromValueUSD = fromAmountNum * selectedFromToken.price
      const deusPrice = tickerData?.price || 0.00007765 // Use live price or fallback
      const estimatedDeus = (fromValueUSD / deusPrice) * 0.997

      setToAmount(estimatedDeus.toFixed(6))
      setQuote({
        fromAmount: fromAmountNum,
        toAmount: estimatedDeus,
        fromToken: selectedFromToken,
        toToken: { symbol: "DEUS", address: DEUS_CONTRACT_ADDRESS },
        rate: estimatedDeus / fromAmountNum,
        priceImpact: 0.15,
        fee: fromValueUSD * 0.003,
        route: `${selectedFromToken.symbol} → DEUS`,
        estimatedGas: 0.002,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokenSelect = (token: Token) => {
    setFromToken(token.symbol)
    setFromAmount("")
    setToAmount("")
    setQuote(null)
  }

  const handleMaxClick = () => {
    if (selectedFromToken) {
      setFromAmount(selectedFromToken.balance.toString())
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <DeusTicker />

        <div className="min-h-screen bg-gradient-to-br from-black via-accent/10 to-black p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="glass-card rounded-2xl p-12 max-w-md mx-auto backdrop-blur-xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 glass-card rounded-full flex items-center justify-center"
                >
                  <ArrowDownUp className="h-10 w-10 text-accent" />
                </motion.div>
                <h1 className="text-4xl font-bold mb-4 text-white">Token Swap</h1>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Connect your wallet to swap tokens into DEUS with live market rates on Base network
                </p>
                <EnhancedWalletConnect onConnect={connectWallet} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DeusTicker />
      <StickyHeader />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 neon-text">Swap to DEUS</h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Convert your tokens into DEUS with live market rates on Base network
          </p>
        </motion.div>

        {isConnected && address && <PortfolioValueBanner address={address} />}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8"
        >
          <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ArrowDownUp className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  Swap Interface
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                    Live Trading
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {isLoadingBalances && (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading wallet balances...</span>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-sm font-medium">From</Label>
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <Select value={fromToken} onValueChange={setFromToken}>
                        <SelectTrigger className="w-36 sm:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {userTokens
                            .filter((t) => t.symbol !== "DEUS")
                            .map((token) => (
                              <SelectItem key={token.symbol} value={token.symbol}>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{token.logo}</span>
                                  <span>{token.symbol}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={handleMaxClick} className="text-xs sm:text-sm">
                        Max
                      </Button>
                    </div>

                    <Input
                      placeholder="0.00"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className="text-xl sm:text-2xl font-bold border-0 bg-transparent p-0 h-auto"
                    />

                    {selectedFromToken && (
                      <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                        <span>
                          Balance: {selectedFromToken.balance.toLocaleString()} {selectedFromToken.symbol}
                        </span>
                        <span>${(Number.parseFloat(fromAmount || "0") * selectedFromToken.price).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="p-2 rounded-full bg-accent/10 border border-accent/20">
                    <ArrowDownUp className="h-4 w-4 text-accent" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">To</Label>
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span className="font-medium">DEUS</span>
                        <Badge variant="secondary" className="text-xs">
                          Destination
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xl sm:text-2xl font-bold text-accent">{toAmount || "0.00"}</div>

                    {deusToken && toAmount && (
                      <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                        <span>Balance: {deusToken.balance.toLocaleString()} DEUS</span>
                        <span>${(Number.parseFloat(toAmount) * deusToken.price).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGetQuote}
                  disabled={!fromAmount || isLoading}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Getting Quote...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Get Quote
                    </>
                  )}
                </Button>

                {quote && (
                  <SwapQuote quote={quote} onSwap={() => setShowConfirmation(true)} isExecuting={isExecutingSwap} />
                )}
              </CardContent>
            </Card>

            {!isMobile && <TokenHoldingsTable tokens={userTokens} onTokenSelect={handleTokenSelect} />}
          </motion.div>

          <motion.div variants={staggerContainer} className="space-y-4 sm:space-y-6">
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    DEUS Token
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-bold text-accent">
                      ${tickerData?.price ? tickerData.price.toFixed(8) : deusToken?.price.toFixed(8)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Your Balance</span>
                    <span className="font-medium">{deusToken?.balance.toLocaleString()} DEUS</span>
                  </div>
                  {tickerData && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">24h Change</span>
                      <span className={`font-medium ${tickerData.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {tickerData.change24h >= 0 ? "+" : ""}
                        {tickerData.change24h.toFixed(2)}%
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    DEUS is the native token of the DEUS ecosystem, providing governance rights and access to premium
                    features.
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Swap Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-accent">
                      ${tickerData?.volume24h ? (tickerData.volume24h / 1000000).toFixed(1) + "M" : "2.4M"}
                    </div>
                    <div className="text-xs text-muted-foreground">24h Volume</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-lg font-bold">0.3%</div>
                      <div className="text-xs text-muted-foreground">Avg Fee</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-lg font-bold">1,247</div>
                      <div className="text-xs text-muted-foreground">24h Swaps</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }}>
              <Card className="glass-card border-yellow-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-500">Important</h4>
                      <p className="text-xs text-muted-foreground">
                        Always verify token addresses and amounts before confirming transactions. Slippage may occur
                        during high volatility periods.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>

        {isConnected && showConfirmation && quote && (
          <>
            <WagmiSwapHooks quote={quote} address={address} onSwapUpdate={handleSwapExecution} />
            <SwapConfirmation
              quote={quote}
              isOpen={showConfirmation}
              onClose={() => {
                setShowConfirmation(false)
                setTransactionHash(undefined)
                setRetryStatus({})
              }}
              onConfirm={() => {}} // This will be handled by WagmiSwapHooks
              isExecuting={isExecutingSwap}
              retryAttempt={retryStatus.attempt}
              maxRetries={retryStatus.maxRetries}
              retryDelay={retryStatus.delay}
              txHash={transactionHash}
            />
          </>
        )}
      </div>
    </div>
  )
}
