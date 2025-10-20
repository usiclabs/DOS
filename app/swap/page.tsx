"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownUp, Settings, RefreshCw, ChevronDown, Wallet, Sparkles } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { StickyHeader } from "@/components/sticky-header"
import { useToast } from "@/hooks/use-toast"
import { DeusTicker } from "@/components/deus-ticker"
import { TokenDiscoverMode } from "@/components/token-discover-mode"
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
    address: "0x73582df1cad3e187cD0746b7A473d65c06386837e",
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
        <div className="flex items-center justify-center min-h-[80vh] px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl"
          >
            <Card className="glass-card relative overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/40 rounded-full blur-[1px]"
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                    }}
                    animate={{
                      y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: Math.random() * 8 + 12,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              <div className="absolute top-0 left-0 w-40 h-40 border-t-2 border-l-2 border-primary/40 rounded-tl-3xl shadow-[0_0_20px_rgba(249,115,22,0.3)]" />
              <div className="absolute top-0 right-0 w-40 h-40 border-t-2 border-r-2 border-primary/40 rounded-tr-3xl shadow-[0_0_20px_rgba(249,115,22,0.3)]" />
              <div className="absolute bottom-0 left-0 w-40 h-40 border-b-2 border-l-2 border-primary/40 rounded-bl-3xl shadow-[0_0_20px_rgba(249,115,22,0.3)]" />
              <div className="absolute bottom-0 right-0 w-40 h-40 border-b-2 border-r-2 border-primary/40 rounded-br-3xl shadow-[0_0_20px_rgba(249,115,22,0.3)]" />

              {[
                { position: "top-0 left-0", delay: 0 },
                { position: "top-0 right-0", delay: 0.75 },
                { position: "bottom-0 left-0", delay: 1.5 },
                { position: "bottom-0 right-0", delay: 2.25 },
              ].map((corner, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${corner.position} w-40 h-40`}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: corner.delay }}
                >
                  <div className={`absolute ${corner.position} w-20 h-20 bg-primary/30 blur-2xl rounded-full`} />
                </motion.div>
              ))}

              <div className="relative p-16 text-center">
                <div className="relative w-40 h-40 mx-auto mb-12">
                  <motion.div
                    className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-red-600/20 rounded-full border-2 border-primary/30 backdrop-blur-sm shadow-[0_0_40px_rgba(249,115,22,0.3)]"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Wallet className="w-8 h-8 text-primary" />
                  </motion.div>
                </div>

                <div className="relative mb-8">
                  <motion.h2
                    className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_100%]"
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
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scaleX: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-300 text-xl mb-12 max-w-md mx-auto leading-relaxed"
                >
                  Connect your wallet to swap tokens instantly with the best rates across the DEUS ecosystem
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Button
                    onClick={() => connectWallet("metamask")}
                    className="relative bg-gradient-to-br from-primary to-red-600 hover:from-primary/90 hover:to-red-500 text-white font-medium px-12 py-8 text-xl rounded-2xl shadow-2xl shadow-primary/30 transition-all duration-500 border border-primary/30 overflow-hidden group"
                    size="lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Wallet className="w-6 h-6 mr-3 relative z-10" />
                    <span className="relative z-10">Connect Wallet</span>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-10 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm shadow-lg shadow-primary/10"
                >
                  <motion.span
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="text-primary text-lg"
                  >
                    ✦
                  </motion.span>
                  <span className="text-sm font-semibold text-primary tracking-wide">INSTANT SWAPS • BEST RATES</span>
                  <motion.span
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="text-primary text-lg"
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

      <div className="flex items-center justify-center min-h-[80vh] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <Tabs defaultValue="swap" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
              <TabsTrigger
                value="swap"
                className="flex items-center gap-2 py-4 text-base font-medium rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 data-[state=active]:border data-[state=active]:border-primary/30 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 data-[state=active]:text-primary transition-all duration-300 hover:bg-white/5"
              >
                <ArrowDownUp className="w-5 h-5" />
                Swap
              </TabsTrigger>
              <TabsTrigger
                value="discover"
                className="flex items-center gap-2 py-4 text-base font-medium rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-secondary/20 data-[state=active]:to-secondary/10 data-[state=active]:border data-[state=active]:border-secondary/30 data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/20 data-[state=active]:text-secondary transition-all duration-300 hover:bg-white/5"
              >
                <Sparkles className="w-5 h-5" />
                Discover
              </TabsTrigger>
            </TabsList>

            <TabsContent value="swap">
              <Card className="glass-card p-8 border-2 border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  animate={{
                    background: [
                      "radial-gradient(circle at 20% 50%, rgba(249,115,22,0.15) 0%, transparent 50%)",
                      "radial-gradient(circle at 80% 50%, rgba(249,115,22,0.15) 0%, transparent 50%)",
                      "radial-gradient(circle at 20% 50%, rgba(249,115,22,0.15) 0%, transparent 50%)",
                    ],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent">
                      Swap
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(!showSettings)}
                      className="hover:bg-white/10 transition-all duration-300 rounded-xl hover:scale-110"
                    >
                      <Settings className="w-6 h-6" />
                    </Button>
                  </div>

                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Slippage Tolerance</span>
                        <div className="flex items-center gap-2">
                          <Input
                            value={slippage}
                            onChange={(e) => setSlippage(e.target.value)}
                            className="w-24 text-right bg-white/5 border-white/10 focus:border-primary/50"
                          />
                          <span className="text-sm font-medium">%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-4 mb-4">
                    <div className="flex items-center justify-between text-base text-muted-foreground font-medium">
                      <span>Sell</span>
                      {fromToken && (
                        <span className="text-sm">
                          Balance: <span className="text-foreground font-semibold">{fromToken.balance.toFixed(6)}</span>
                        </span>
                      )}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/10 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/10 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          className="text-3xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:text-white/20"
                        />
                        <Button
                          variant="ghost"
                          className="flex items-center gap-2 hover:bg-white/10 rounded-xl px-4 py-2"
                        >
                          <span className="text-2xl">{fromToken?.logo}</span>
                          <span className="font-semibold text-lg">{fromToken?.symbol}</span>
                          <ChevronDown className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {[25, 50, 75, 100].map((percent) => (
                            <Button
                              key={percent}
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePercentage(percent)}
                              className="text-xs font-semibold hover:bg-primary/20 hover:text-primary transition-all duration-200 rounded-lg px-3"
                            >
                              {percent === 100 ? "MAX" : `${percent}%`}
                            </Button>
                          ))}
                        </div>
                        {fromToken && fromAmount && (
                          <span className="text-sm text-muted-foreground font-medium">
                            ${(Number.parseFloat(fromAmount) * fromToken.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex justify-center -my-3 relative z-20">
                    <motion.div whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-gradient-to-br from-background to-background/80 border-4 border-background hover:bg-white/10 shadow-2xl hover:shadow-primary/20 transition-all duration-300 w-14 h-14"
                      >
                        <ArrowDownUp className="w-6 h-6 text-primary" />
                      </Button>
                    </motion.div>
                  </div>

                  <div className="space-y-3 mt-3">
                    <div className="flex items-center justify-between text-base text-muted-foreground font-medium">
                      <span>Buy</span>
                      {toToken && (
                        <span className="text-sm">
                          Balance: <span className="text-foreground font-semibold">{toToken.balance.toFixed(6)}</span>
                        </span>
                      )}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/10 shadow-lg backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl font-bold text-white">
                          {isLoading ? <RefreshCw className="w-8 h-8 animate-spin text-primary" /> : toAmount || "0.0"}
                        </div>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-2 hover:bg-white/10 rounded-xl px-4 py-2"
                        >
                          <span className="text-2xl">{toToken?.logo}</span>
                          <span className="font-semibold text-lg">{toToken?.symbol}</span>
                          <ChevronDown className="w-5 h-5" />
                        </Button>
                      </div>
                      {toToken && toAmount && (
                        <div className="text-sm text-muted-foreground text-right font-medium">
                          ${(Number.parseFloat(toAmount) * toToken.price).toFixed(2)}
                        </div>
                      )}
                    </motion.div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSwap}
                      disabled={!fromAmount || !toAmount || isLoading || isSwapping || cooldownRemaining > 0}
                      className="w-full mt-8 bg-gradient-to-br from-primary to-red-600 hover:from-primary/90 hover:to-red-500 text-white font-semibold py-7 text-lg transition-all duration-500 shadow-2xl shadow-primary/30 hover:shadow-primary/50 border-2 border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group rounded-2xl"
                      size="lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {cooldownRemaining > 0 ? (
                          `Wait ${cooldownRemaining}s to avoid rate limiting`
                        ) : isSwapping ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Confirming in wallet...
                          </>
                        ) : isLoading ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Swap Tokens"
                        )}
                      </span>
                    </Button>
                  </motion.div>

                  {toAmount && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm space-y-3 text-sm shadow-lg"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Exchange Rate</span>
                        <span className="font-semibold text-foreground">
                          1 {fromToken?.symbol} ={" "}
                          {(Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(6)} {toToken?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Slippage Tolerance</span>
                        <span className="font-semibold text-primary">{slippage}%</span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Sparkles className="w-3 h-3" />
                          <span>Best rate across all DEXs</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="discover">
              <TokenDiscoverMode />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
