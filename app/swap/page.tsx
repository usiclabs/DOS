"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownUp, Settings, RefreshCw, ChevronDown, Wallet, Sparkles, X } from "lucide-react"
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
  const [showFromTokenSelector, setShowFromTokenSelector] = useState(false)
  const [showToTokenSelector, setShowToTokenSelector] = useState(false)
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

  const AVAILABLE_TOKENS: Token[] = [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0x0000000000000000000000000000000000000000",
      balance: 0,
      price: 0,
      logo: "Ξ",
      decimals: 18,
    },
    {
      symbol: "DEUS",
      name: "DEUS Finance",
      address: "0x73582df1cad3187cD0746b7A473d65c06386837e",
      balance: 0,
      price: 0.00005113,
      logo: "⚡",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      balance: 0,
      price: 1.0,
      logo: "💵",
      decimals: 6,
    },
    {
      symbol: "ZORA",
      name: "Zora",
      address: "0x1111111111166b7fe7bd91427724b487980afc69",
      balance: 0,
      price: 0,
      logo: "◬",
      decimals: 18,
    },
  ]

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

          const tokensWithBalances = AVAILABLE_TOKENS.map((token) => {
            const fetchedToken = data.tokens?.find(
              (t: Token) => t.symbol === token.symbol || t.address.toLowerCase() === token.address.toLowerCase(),
            )
            return fetchedToken ? { ...token, balance: fetchedToken.balance, price: fetchedToken.price } : token
          })

          setUserTokens(tokensWithBalances)

          const ethToken = tokensWithBalances.find((t) => t.symbol === "ETH")
          const deusToken = tokensWithBalances.find((t) => t.symbol === "DEUS")

          if (ethToken) setFromToken(ethToken)
          if (deusToken) setToToken(deusToken)

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

  const TokenSelector = ({
    isOpen,
    onClose,
    onSelect,
    currentToken,
  }: {
    isOpen: boolean
    onClose: () => void
    onSelect: (token: Token) => void
    currentToken: Token | null
  }) => {
    if (!isOpen) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-card border-2 border-white/10 rounded-2xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Select Token</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {userTokens.map((token) => {
              const isSelected = currentToken?.address === token.address
              const colorMap: Record<string, string> = {
                ETH: "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50",
                DEUS: "from-primary/20 to-primary/10 border-primary/30 hover:border-primary/50",
                USDC: "from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50",
                ZORA: "from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50",
              }
              const colorClass =
                colorMap[token.symbol] || "from-white/10 to-white/5 border-white/10 hover:border-white/20"

              return (
                <motion.button
                  key={token.address}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelect(token)
                    onClose()
                  }}
                  className={`p-4 rounded-xl bg-gradient-to-br border-2 transition-all duration-300 ${
                    isSelected ? `${colorClass} ring-2 ring-offset-2 ring-offset-background shadow-lg` : colorClass
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{token.logo}</div>
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.balance.toFixed(6)}</div>
                    <div className="text-xs text-muted-foreground">${(token.balance * token.price).toFixed(2)}</div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    )
  }

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

              <div className="absolute top-0 left-0 w-40 h-40 border-t-2 border-l-2 border-primary/40 rounded-tl-3xl shadow-[0_0_20px_rgba(235,90,60,0.3)]" />
              <div className="absolute top-0 right-0 w-40 h-40 border-t-2 border-r-2 border-primary/40 rounded-tr-3xl shadow-[0_0_20px_rgba(235,90,60,0.3)]" />
              <div className="absolute bottom-0 left-0 w-40 h-40 border-b-2 border-l-2 border-primary/40 rounded-bl-3xl shadow-[0_0_20px_rgba(235,90,60,0.3)]" />
              <div className="absolute bottom-0 right-0 w-40 h-40 border-b-2 border-r-2 border-primary/40 rounded-br-3xl shadow-[0_0_20px_rgba(235,90,60,0.3)]" />

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
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 rounded-full border-2 border-primary/30 backdrop-blur-sm shadow-[0_0_40px_rgba(235,90,60,0.3)]"
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
                    className="text-6xl font-bold bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent bg-[length:200%_100%]"
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
                    className="btn-premium relative px-12 py-8 text-xl rounded-2xl font-medium overflow-hidden group"
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
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1.5 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
              <TabsTrigger
                value="swap"
                className="flex items-center gap-2 py-3 text-base data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 data-[state=active]:border data-[state=active]:border-primary/30 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300"
              >
                <ArrowDownUp className="w-5 h-5" />
                Swap
              </TabsTrigger>
              <TabsTrigger
                value="discover"
                className="flex items-center gap-2 py-3 text-base data-[state=active]:bg-gradient-to-br data-[state=active]:from-gold/20 data-[state=active]:to-gold/10 data-[state=active]:border data-[state=active]:border-gold/30 data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5" />
                Discover
              </TabsTrigger>
            </TabsList>

            <TabsContent value="swap">
              <Card className="glass-card p-8 border-2 border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Swap
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                    className="hover:bg-white/10 transition-all duration-300 rounded-xl"
                  >
                    <Settings className="w-6 h-6" />
                  </Button>
                </div>

                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Slippage Tolerance</span>
                      <div className="flex items-center gap-2">
                        <Input
                          value={slippage}
                          onChange={(e) => setSlippage(e.target.value)}
                          className="w-20 text-right"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3 mb-3">
                  <div className="flex items-center justify-between text-base text-muted-foreground">
                    <span>Sell</span>
                    {fromToken && <span>Balance: {fromToken.balance.toFixed(6)}</span>}
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/10">
                    <div className="flex items-center justify-between mb-3">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      />
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 hover:bg-white/5 transition-all duration-300"
                        onClick={() => setShowFromTokenSelector(true)}
                      >
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
                            className="text-xs hover:bg-primary/20 hover:text-primary transition-all duration-300"
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
                    className="rounded-full bg-gradient-to-br from-background to-background/80 border-4 border-background hover:bg-white/10 shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  >
                    <ArrowDownUp className="w-5 h-5 text-primary" />
                  </Button>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-base text-muted-foreground">
                    <span>Buy</span>
                    {toToken && <span>Balance: {toToken.balance.toFixed(6)}</span>}
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl font-bold text-white">
                        {isLoading ? <RefreshCw className="w-6 h-6 animate-spin text-primary" /> : toAmount || "0.0"}
                      </div>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 hover:bg-white/5 transition-all duration-300"
                        onClick={() => setShowToTokenSelector(true)}
                      >
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
                  className="btn-premium w-full mt-8 py-6 text-lg font-medium relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10">
                    {cooldownRemaining > 0 ? (
                      `Wait ${cooldownRemaining}s to avoid rate limiting`
                    ) : isSwapping ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                        Confirming in wallet...
                      </>
                    ) : isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                        Loading...
                      </>
                    ) : (
                      "Swap"
                    )}
                  </span>
                </Button>

                {toAmount && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm space-y-2 text-sm shadow-lg"
                  >
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium">
                        1 {fromToken?.symbol} ={" "}
                        {(Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(6)} {toToken?.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slippage</span>
                      <span className="font-medium text-primary">{slippage}%</span>
                    </div>
                  </motion.div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="discover">
              <TokenDiscoverMode />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <TokenSelector
        isOpen={showFromTokenSelector}
        onClose={() => setShowFromTokenSelector(false)}
        onSelect={setFromToken}
        currentToken={fromToken}
      />
      <TokenSelector
        isOpen={showToTokenSelector}
        onClose={() => setShowToTokenSelector(false)}
        onSelect={setToToken}
        currentToken={toToken}
      />
    </div>
  )
}
