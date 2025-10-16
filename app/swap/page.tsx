"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDownUp, Settings, RefreshCw, ChevronDown, Wallet } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { StickyHeader } from "@/components/sticky-header"
import { useToast } from "@/hooks/use-toast"
import { DeusTicker } from "@/components/deus-ticker"
import { motion } from "framer-motion"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"

interface Token {
  symbol: string
  name: string
  address: string
  balance: number
  price: number
  logo: string
  decimals: number
}

export default function SwapPage() {
  const { toast } = useToast()
  const { isConnected, address, connectWallet } = useWalletContext()

  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userTokens, setUserTokens] = useState<Token[]>([])
  const [slippage, setSlippage] = useState("0.5")
  const [showSettings, setShowSettings] = useState(false)
  const [currentQuote, setCurrentQuote] = useState<any>(null)
  const [isSwapping, setIsSwapping] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const SWAP_COOLDOWN = 60000 // 60 seconds to avoid MetaMask rate limiting

  useEffect(() => {
    const lastSwapTime = localStorage.getItem("lastSwapTime")
    if (lastSwapTime) {
      const timeSinceLastSwap = Date.now() - Number.parseInt(lastSwapTime)
      if (timeSinceLastSwap < SWAP_COOLDOWN) {
        setCooldownRemaining(Math.ceil((SWAP_COOLDOWN - timeSinceLastSwap) / 1000))
      }
    }
  }, [])

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownRemaining])

  const DEUS_TOKEN: Token = {
    symbol: "DEUS",
    name: "DEUS Finance",
    address: "0x73582df1cad3187cD0746b7A473d65c06386837e",
    balance: 0,
    price: 0.00005113,
    logo: "⚡",
    decimals: 18,
  }

  const handlePercentage = (percent: number) => {
    if (fromToken && userTokens.length > 0) {
      const maxAmount = fromToken.balance.toFixed(6)
      setFromAmount(percent === 100 ? maxAmount : ((Number.parseFloat(maxAmount) * percent) / 100).toFixed(6))
    }
  }

  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address) return

      try {
        const response = await fetch(`/api/wallet/balances/${address}`)
        if (response.ok) {
          const data = await response.json()
          setUserTokens(data.tokens || [])

          const ethToken = data.tokens?.find((t: Token) => t.symbol === "ETH")
          const deusToken = data.tokens?.find((t: Token) => t.symbol === "DEUS")

          if (ethToken) setFromToken(ethToken)
          // Use fetched DEUS token with real balance, or fallback to hardcoded DEUS_TOKEN
          setToToken(deusToken || DEUS_TOKEN)

          console.log("[v0] Balances fetched - ETH:", ethToken?.balance, "DEUS:", deusToken?.balance)
        }
      } catch (error) {
        console.error("Failed to fetch balances:", error)
      }
    }

    fetchBalances()
  }, [isConnected, address])

  useEffect(() => {
    const getQuote = async () => {
      if (!fromAmount || !fromToken || !toToken || Number.parseFloat(fromAmount) <= 0) {
        setToAmount("")
        setCurrentQuote(null)
        return
      }

      console.log("[v0] Fetching swap quote:", {
        fromToken: fromToken.address,
        toToken: toToken.address,
        amount: fromAmount,
        userAddress: address,
      })

      setIsLoading(true)
      try {
        const response = await fetch("/api/swap/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromToken: fromToken.address,
            toToken: toToken.address,
            amount: fromAmount,
            userAddress: address,
          }),
        })

        console.log("[v0] Quote API response status:", response.status)

        if (response.ok) {
          const quote = await response.json()
          console.log("[v0] Quote received successfully:", {
            toAmount: quote.toAmount,
            hasUniswapV3Data: !!quote.uniswapV3Data,
          })
          setToAmount(quote.toAmount.toString())
          setCurrentQuote(quote)
        } else {
          const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
          console.error("[v0] Quote API error:", errorData)
          toast({
            title: "Quote Failed",
            description: errorData.message || "Failed to get swap quote",
            variant: "destructive",
          })
          setToAmount("")
          setCurrentQuote(null)
        }
      } catch (error) {
        console.error("[v0] Failed to get quote:", error)
        toast({
          title: "Quote Error",
          description: error instanceof Error ? error.message : "Network error",
          variant: "destructive",
        })
        setToAmount("")
        setCurrentQuote(null)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(getQuote, 500)
    return () => clearTimeout(debounce)
  }, [fromAmount, fromToken, toToken, address])

  const handleSwap = async () => {
    if (cooldownRemaining > 0) {
      toast({
        title: "Please Wait",
        description: `Please wait ${cooldownRemaining} seconds before swapping again to avoid rate limiting`,
      })
      return
    }

    if (!fromToken || !toToken || !fromAmount || !toAmount || !currentQuote) {
      toast({
        title: "Invalid Swap",
        description: "Please wait for the quote to load",
        variant: "destructive",
      })
      return
    }

    if (!window.ethereum) {
      toast({
        title: "No Wallet Found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive",
      })
      return
    }

    const now = Date.now()
    localStorage.setItem("lastSwapTime", now.toString())
    setCooldownRemaining(60)
    setIsSwapping(true)

    try {
      console.log("[v0] Configuring MetaMask to use BlastAPI RPC...")
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x2105", // Base chain ID (8453)
              chainName: "Base",
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://base-mainnet.blastapi.io/d6d4ab7c-d1de-4412-9a48-ae9c7965285c"],
              blockExplorerUrls: ["https://basescan.org"],
            },
          ],
        })
        console.log("[v0] MetaMask configured to use BlastAPI RPC")
      } catch (addError: any) {
        // Chain might already exist, try switching
        if (addError.code === 4902) {
          console.log("[v0] Chain already exists, switching...")
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }],
          })
        } else {
          console.log("[v0] MetaMask RPC configuration skipped:", addError.message)
        }
      }

      console.log("[v0] Preparing swap transaction...")

      const response = await fetch("/api/swap/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: currentQuote,
          userAddress: address,
          slippage: Number.parseFloat(slippage),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to prepare transaction")
      }

      const txData = await response.json()

      if (!txData.transaction) {
        throw new Error("No transaction data in response")
      }

      const { transaction } = txData

      console.log("[v0] Transaction prepared, sending to wallet...")

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: transaction.to,
            data: transaction.data,
            value: `0x${BigInt(transaction.value).toString(16)}`,
            gas: `0x${BigInt(transaction.gasLimit).toString(16)}`,
          },
        ],
      })

      console.log("[v0] Transaction sent:", txHash)

      toast({
        title: "Transaction Submitted",
        description: (
          <div className="space-y-1">
            <p>Your swap is being processed on-chain</p>
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline text-sm"
            >
              View on BaseScan →
            </a>
          </div>
        ),
      })

      console.log("[v0] Waiting for transaction confirmation via BlastAPI...")
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
          title: "Swap Successful!",
          description: `Successfully swapped ${fromAmount} ${fromToken?.symbol} for ${toAmount} ${toToken?.symbol}`,
        })

        const refreshBalances = async () => {
          try {
            const response = await fetch(`/api/wallet/balances/${address}`)
            if (response.ok) {
              const data = await response.json()
              setUserTokens(data.tokens || [])

              const ethToken = data.tokens?.find((t: Token) => t.symbol === "ETH")
              const deusToken = data.tokens?.find((t: Token) => t.symbol === "DEUS")

              if (ethToken) setFromToken(ethToken)
              if (deusToken) setToToken(deusToken)

              console.log("[v0] Balances refreshed after swap - ETH:", ethToken?.balance, "DEUS:", deusToken?.balance)
            }
          } catch (error) {
            console.error("Failed to refresh balances:", error)
          }
        }

        // Wait 3 seconds for blockchain to update, then refresh
        setTimeout(refreshBalances, 3000)

        setFromAmount("")
        setToAmount("")
        setCurrentQuote(null)
      } else {
        throw new Error("Transaction reverted on-chain")
      }
    } catch (error: any) {
      console.error("[v0] Swap execution error:", error)

      if (error.code === 4001 || error.message?.includes("User rejected") || error.message?.includes("User denied")) {
        setCooldownRemaining(0)
        localStorage.removeItem("lastSwapTime")
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction",
        })
      } else if (error.message?.includes("rate limit")) {
        toast({
          title: "Rate Limited",
          description: "Please wait 60 seconds before trying again",
          variant: "destructive",
        })
      } else if (error.message?.includes("reverted")) {
        toast({
          title: "Transaction Reverted",
          description: "The transaction failed on-chain. This may be due to insufficient liquidity or price movement.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Swap Failed",
          description: error.message || "An error occurred during the swap",
          variant: "destructive",
        })
      }
    } finally {
      setIsSwapping(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <DeusTicker />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            <Card className="glass-card relative overflow-hidden">
              {/* Floating particles background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-emerald-400/60 rounded-full blur-sm"
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                    }}
                    animate={{
                      y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: Math.random() * 10 + 15,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              {/* Premium corner decorations */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-emerald-500/30 rounded-br-2xl" />

              {/* Animated corner glows */}
              <motion.div
                className="absolute top-0 left-0 w-32 h-32"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <div className="absolute top-0 left-0 w-16 h-16 bg-emerald-500/20 blur-xl rounded-full" />
              </motion.div>
              <motion.div
                className="absolute top-0 right-0 w-32 h-32"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.75,
                }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 blur-xl rounded-full" />
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-0 w-32 h-32"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              >
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-500/20 blur-xl rounded-full" />
              </motion.div>
              <motion.div
                className="absolute bottom-0 right-0 w-32 h-32"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 2.25,
                }}
              >
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-emerald-500/20 blur-xl rounded-full" />
              </motion.div>

              <div className="relative p-12 text-center">
                {/* Large animated icon with glow effects */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                  {/* Pulsing glow layers - reduced intensity */}
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-emerald-400/10 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />

                  {/* Rotating rings */}
                  <motion.div
                    className="absolute inset-0 border-2 border-emerald-500/30 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="absolute inset-2 border-2 border-emerald-400/20 rounded-full border-dashed"
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 15,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />

                  {/* Icon container */}
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-sm">
                    <Wallet className="w-16 h-16 text-emerald-400" />
                  </div>
                </div>

                {/* Heading with text shimmer effect only */}
                <div className="relative mb-4">
                  <motion.h2
                    className="text-4xl font-bold bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 bg-clip-text text-transparent bg-[length:200%_100%]"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    Token Swap
                  </motion.h2>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-300 text-lg mb-8 max-w-md mx-auto leading-relaxed"
                >
                  Connect your wallet to swap tokens instantly with the best rates across the DEUS ecosystem
                </motion.p>

                {/* Connect wallet button */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Button
                    onClick={() => connectWallet("metamask")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/20"
                    size="lg"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </Button>
                </motion.div>

                {/* Exclusive feature badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                >
                  {/* Sparkle animations */}
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="text-emerald-400"
                  >
                    ✦
                  </motion.span>
                  <span className="text-sm font-medium text-emerald-300">INSTANT SWAPS</span>
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="text-emerald-400"
                  >
                    ✦
                  </motion.span>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <DeusTicker />

      <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Swap</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="hover:bg-white/5"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Slippage Tolerance</span>
                  <div className="flex items-center gap-2">
                    <Input value={slippage} onChange={(e) => setSlippage(e.target.value)} className="w-20 text-right" />
                    <span className="text-sm">%</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-2 mb-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Sell</span>
                {fromToken && <span>Balance: {fromToken.balance.toFixed(6)}</span>}
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                  />
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/5">
                    <span className="text-xl">{fromToken?.logo}</span>
                    <span className="font-medium">{fromToken?.symbol}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map((percent) => (
                      <Button
                        key={percent}
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePercentage(percent)}
                        className="text-xs hover:bg-white/10"
                      >
                        {percent === 100 ? "MAX" : `${percent}%`}
                      </Button>
                    ))}
                  </div>
                  {fromToken && fromAmount && (
                    <span className="text-sm text-muted-foreground">
                      ${(Number.parseFloat(fromAmount) * fromToken.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-background border-4 border-background hover:bg-white/5"
              >
                <ArrowDownUp className="w-5 h-5 text-accent" />
              </Button>
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Buy</span>
                {toToken && <span>Balance: {toToken.balance.toFixed(6)}</span>}
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : toAmount || "0.0"}
                  </div>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/5">
                    <span className="text-xl">{toToken?.logo}</span>
                    <span className="font-medium">{toToken?.symbol}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                {toToken && toAmount && (
                  <div className="text-sm text-muted-foreground text-right">
                    ${(Number.parseFloat(toAmount) * toToken.price).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleSwap}
              disabled={!fromAmount || !toAmount || isLoading || isSwapping || cooldownRemaining > 0}
              className="w-full mt-6 bg-accent hover:bg-accent/90 text-white font-medium"
              size="lg"
            >
              {cooldownRemaining > 0 ? (
                `Wait ${cooldownRemaining}s to avoid rate limiting`
              ) : isSwapping ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Confirming in wallet...
                </>
              ) : isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Swap"
              )}
            </Button>

            {toAmount && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 space-y-2 text-sm"
              >
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span>
                    1 {fromToken?.symbol} = {(Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(6)}{" "}
                    {toToken?.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slippage</span>
                  <span>{slippage}%</span>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
