"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDownUp, ExternalLink, RefreshCw, CheckCircle2, Sparkles, AlertCircle } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DEUS_TOKEN_ADDRESS } from "@/lib/constants"

const TOKEN_ADDRESSES = {
  ETH: "0x0000000000000000000000000000000000000000",
  DEUS: DEUS_TOKEN_ADDRESS,
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  ZORA: "0x1111111111166b7fe7bd91427724b487980afc69",
} as const

type FundingToken = keyof typeof TOKEN_ADDRESSES

interface CreatorSwapModalProps {
  isOpen: boolean
  onClose: () => void
  token: {
    address: string
    symbol: string
    name: string
    image: string
    price: number
    uniswapV4PoolKey?: {
      token0Address: string
      token1Address: string
      fee: number
      tickSpacing: number
      hookAddress: string
    }
  }
}

export function CreatorSwapModal({ isOpen, onClose, token }: CreatorSwapModalProps) {
  const { toast } = useToast()
  const { isConnected, address, connectWallet } = useWalletContext()
  const [isMobile, setIsMobile] = useState(false)
  const [fundingToken, setFundingToken] = useState<FundingToken>("ETH")
  const [fromAmount, setFromAmount] = useState("")
  const [tokenAmount, setTokenAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [fundingBalance, setFundingBalance] = useState(0)
  const [hasDirectPool, setHasDirectPool] = useState(true)
  const [swapRoute, setSwapRoute] = useState<string>("")

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !address) return
      try {
        const response = await fetch(`/api/wallet/balances/${address}`)
        if (response.ok) {
          const data = await response.json()
          const selectedToken = data.tokens?.find((t: any) => t.symbol === fundingToken)
          if (selectedToken) setFundingBalance(selectedToken.balance)
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error)
      }
    }
    if (isOpen) {
      fetchBalance()
    }
  }, [isConnected, address, isOpen, fundingToken])

  useEffect(() => {
    const calculateTokenAmount = async () => {
      if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
        setTokenAmount("")
        setSwapRoute("")
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch("/api/swap/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromToken: TOKEN_ADDRESSES[fundingToken],
            toToken: token.address,
            amount: fromAmount,
            userAddress: address,
            uniswapV4PoolKey: token.uniswapV4PoolKey,
          }),
        })

        if (response.ok) {
          const quote = await response.json()
          setTokenAmount(quote.toAmount.toString())
          setSwapRoute(quote.route || "")

          const hasValidPool =
            (quote.uniswapV3Data && (quote.uniswapV3Data.poolAddress || quote.uniswapV3Data.isMultiHop)) ||
            quote.uniswapV4Data ||
            quote.zoraTradeData
          setHasDirectPool(hasValidPool)

          console.log("[v0] Swap route:", quote.route)
          console.log("[v0] Has valid pool:", hasValidPool)
          console.log("[v0] Is Zora trade:", !!quote.zoraTradeData)
          console.log("[v0] Is V4:", !!quote.uniswapV4Data)
          console.log("[v0] Is multi-hop:", quote.uniswapV3Data?.isMultiHop)
        } else {
          const errorData = await response.json()
          console.error("[v0] Quote error:", errorData)
          setHasDirectPool(false)
          setTokenAmount("")
          setSwapRoute("")
        }
      } catch (error) {
        console.error("Failed to get quote:", error)
        setHasDirectPool(false)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(calculateTokenAmount, 500)
    return () => clearTimeout(debounce)
  }, [fromAmount, token.address, token.uniswapV4PoolKey, address, fundingToken])

  const triggerConfetti = () => {
    const colors = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"]

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    })

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      })
    }, 250)

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })
    }, 400)
  }

  const handleSwap = async () => {
    if (!isConnected) {
      await connectWallet("metamask")
      return
    }

    if (!fromAmount || !tokenAmount) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount to swap",
        variant: "destructive",
      })
      return
    }

    setIsSwapping(true)
    setTxHash(null)

    try {
      const quoteResponse = await fetch("/api/swap/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromToken: TOKEN_ADDRESSES[fundingToken],
          toToken: token.address,
          amount: fromAmount,
          userAddress: address,
          uniswapV4PoolKey: token.uniswapV4PoolKey,
        }),
      })

      if (!quoteResponse.ok) {
        const errorData = await quoteResponse.json()
        throw new Error(errorData.message || "Failed to get swap quote")
      }

      const quote = await quoteResponse.json()

      if (!quote.uniswapV3Data && !quote.uniswapV4Data && !quote.zoraTradeData) {
        throw new Error("No liquidity pool available for this token pair")
      }

      console.log("[v0] Executing swap with quote:", quote)

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
        throw new Error(`Failed to prepare transaction: ${errorText}`)
      }

      const { transaction } = await executeResponse.json()

      if (!window.ethereum) {
        throw new Error("No wallet detected")
      }

      const txValue = transaction.value.startsWith("0x")
        ? transaction.value
        : `0x${BigInt(transaction.value).toString(16)}`

      console.log("[v0] Transaction value check:", {
        original: transaction.value,
        formatted: txValue,
        fromAmount: fromAmount,
        expectedWei: BigInt(Number.parseFloat(fromAmount) * 1e18).toString(),
      })

      const txParams = {
        from: address,
        to: transaction.to,
        data: transaction.data,
        value: txValue,
        gas: transaction.gasLimit,
      }

      console.log("[v0] Sending transaction:", txParams)

      const hash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      })

      setTxHash(hash as string)

      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      })

      let confirmed = false
      for (let i = 0; i < 60; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const receipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [hash],
        })

        if (receipt) {
          if ((receipt as { status: string }).status === "0x1") {
            confirmed = true
            break
          } else {
            throw new Error("Transaction failed on-chain")
          }
        }
      }

      if (confirmed) {
        setIsSuccess(true)
        triggerConfetti()

        toast({
          title: "Swap Successful!",
          description: `Successfully swapped ${fromAmount} ${fundingToken} for ${tokenAmount} ${token.symbol}`,
        })
      }
    } catch (error: any) {
      console.error("Swap error:", error)

      if (error.code === 4001) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction",
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

  const handleClose = () => {
    setFromAmount("")
    setTokenAmount("")
    setTxHash(null)
    setIsSuccess(false)
    setFundingToken("ETH")
    onClose()
  }

  const content = (
    <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8 space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-2xl rounded-full" />
                <CheckCircle2 className="w-20 h-20 text-orange-500 relative" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Swap Successful!
              </h3>
              <p className="text-muted-foreground">
                You swapped {fromAmount} {fundingToken} for {tokenAmount} {token.symbol}
              </p>
            </div>

            {txHash && (
              <Button
                variant="outline"
                className="gap-2 border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/10 bg-transparent"
                onClick={() => window.open(`https://basescan.org/tx/${txHash}`, "_blank")}
              >
                View on BaseScan
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              Close
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="swap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{token.name}</div>
                <div className="text-sm text-muted-foreground">{token.symbol}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="font-medium">${token.price.toFixed(8)}</div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Select Funding Token</label>
              <div className="grid grid-cols-2 gap-2">
                {(["ETH", "DEUS", "USDC", "ZORA"] as FundingToken[]).map((tokenSymbol) => (
                  <motion.button
                    key={tokenSymbol}
                    onClick={() => setFundingToken(tokenSymbol)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                      fundingToken === tokenSymbol
                        ? tokenSymbol === "ETH"
                          ? "border-blue-500 bg-blue-500/10"
                          : tokenSymbol === "DEUS"
                            ? "border-orange-500 bg-orange-500/10"
                            : tokenSymbol === "USDC"
                              ? "border-green-500 bg-green-500/10"
                              : "border-purple-500 bg-purple-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          tokenSymbol === "ETH"
                            ? "bg-blue-500/20 text-blue-400"
                            : tokenSymbol === "DEUS"
                              ? "bg-orange-500/20 text-orange-400"
                              : tokenSymbol === "USDC"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {tokenSymbol === "ETH" ? "Ξ" : tokenSymbol === "DEUS" ? "Ð" : tokenSymbol[0]}
                      </div>
                      <span className="font-semibold text-sm">{tokenSymbol}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {!hasDirectPool && fromAmount && (
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-sm text-amber-200">
                  No liquidity pool found for this token. Please check back later or try deploying liquidity first.
                </AlertDescription>
              </Alert>
            )}

            {swapRoute && hasDirectPool && (
              <div className="text-xs text-center text-muted-foreground">
                <span className="inline-flex items-center gap-1">Route: {swapRoute}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">You Pay</span>
                <span className="text-muted-foreground">
                  Balance: {fundingBalance.toFixed(6)} {fundingToken}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="text-2xl font-bold h-16 pr-24 bg-white/5 border-white/10 focus:border-orange-500/50"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
                  {fundingToken}
                </div>
              </div>
              <div className="flex gap-2">
                {[0.001, 0.005, 0.01].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setFromAmount(amount.toString())}
                    className="flex-1 border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/10"
                  >
                    {amount} {fundingToken}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30">
                <ArrowDownUp className="w-5 h-5 text-orange-500" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">You Receive</span>
              </div>
              <div className="relative">
                <div className="text-2xl font-bold h-16 px-4 flex items-center bg-white/5 border border-white/10 rounded-lg">
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <span className={tokenAmount ? "text-white" : "text-muted-foreground"}>{tokenAmount || "0.0"}</span>
                  )}
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
                  {token.symbol}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSwap}
              disabled={!fromAmount || !tokenAmount || isLoading || isSwapping || !hasDirectPool}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSwapping ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Swapping...
                </>
              ) : isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : !isConnected ? (
                "Connect Wallet"
              ) : !hasDirectPool && fromAmount ? (
                "No Liquidity Pool Available"
              ) : (
                "Swap"
              )}
            </Button>

            {txHash && !isSuccess && (
              <div className="text-center text-sm text-muted-foreground">
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:underline inline-flex items-center gap-1"
                >
                  View transaction
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl">Swap for {token.symbol}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Swap for {token.symbol}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
