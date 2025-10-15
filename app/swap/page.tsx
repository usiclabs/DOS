"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDownUp, Settings, RefreshCw, ChevronDown, Wallet } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { StickyHeader } from "@/components/sticky-header"
import { useToast } from "@/hooks/use-toast"
import { DeusTicker } from "@/components/deus-ticker"
import { motion } from "framer-motion"

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
  const { isConnected, address, connectWallet } = useWallet()

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
      const maxAmount = (fromToken.balance / fromToken.decimals).toFixed(6)
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
          if (ethToken) setFromToken(ethToken)
          setToToken(DEUS_TOKEN)
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
    console.log("[v0] Swap button clicked")
    console.log("[v0] Swap validation:", {
      hasFromToken: !!fromToken,
      hasToToken: !!toToken,
      hasFromAmount: !!fromAmount,
      hasToAmount: !!toAmount,
      hasQuote: !!currentQuote,
      isSwapping,
    })

    if (!fromToken || !toToken || !fromAmount || !toAmount || !currentQuote) {
      console.error("[v0] Swap validation failed")
      toast({
        title: "Invalid Swap",
        description: "Please wait for the quote to load",
        variant: "destructive",
      })
      return
    }

    if (isSwapping) {
      console.log("[v0] Swap already in progress")
      toast({
        title: "Swap in Progress",
        description: "Please wait for the current swap to complete",
      })
      return
    }

    console.log("[v0] Starting swap execution")
    setIsLoading(true)
    setIsSwapping(true)

    try {
      console.log("[v0] Calling swap execute API")
      const response = await fetch("/api/swap/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: currentQuote,
          userAddress: address,
          slippage: Number.parseFloat(slippage),
        }),
      })

      console.log("[v0] Execute API response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] Execute API error:", error)
        throw new Error(error.message || "Failed to prepare transaction")
      }

      const txData = await response.json()
      console.log("[v0] Transaction data received:", {
        hasTransaction: !!txData.transaction,
        message: txData.message,
      })

      if (!txData.transaction) {
        throw new Error("No transaction data in response")
      }

      const { transaction } = txData

      if (!window.ethereum) {
        throw new Error("No wallet found")
      }

      console.log("[v0] Checking EIP-5792 support")
      const supportsEIP5792 = await checkEIP5792Support()

      if (supportsEIP5792) {
        console.log("[v0] Using EIP-5792 wallet_sendCalls for atomic swap")
        await executeSwapWithEIP5792(transaction, fromAmount, fromToken.symbol, toAmount, toToken.symbol)
      } else {
        console.log("[v0] Falling back to traditional eth_sendTransaction")
        await executeSwapTraditional(transaction, fromAmount, fromToken.symbol, toAmount, toToken.symbol)
      }

      console.log("[v0] Swap completed successfully")
      setFromAmount("")
      setToAmount("")
      setCurrentQuote(null)
    } catch (error: any) {
      console.error("[v0] Swap execution error:", error)

      if (error.code === 4001 || error.message?.includes("User denied")) {
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
      setIsLoading(false)
      setIsSwapping(false)
    }
  }

  const checkEIP5792Support = async (): Promise<boolean> => {
    try {
      if (!window.ethereum) return false

      const capabilities = await window.ethereum.request({
        method: "wallet_getCapabilities",
        params: [address],
      })

      console.log("[v0] Wallet capabilities:", capabilities)

      const baseCapabilities = capabilities?.["0x2105"] || capabilities?.["8453"]
      const supportsAtomic = baseCapabilities?.atomic?.status === "ready"

      console.log("[v0] EIP-5792 atomic support on Base:", supportsAtomic)

      return supportsAtomic
    } catch (error) {
      console.log("[v0] EIP-5792 not supported:", error)
      return false
    }
  }

  const executeSwapWithEIP5792 = async (
    transaction: any,
    fromAmt: string,
    fromSym: string,
    toAmt: string,
    toSym: string,
  ) => {
    toast({
      title: "Confirm Transaction",
      description: "Please approve the atomic swap in your wallet",
    })

    const callsPayload = {
      version: "1.0",
      chainId: "0x2105", // Base chain ID (8453 in hex)
      from: address,
      calls: [
        {
          to: transaction.to,
          value: transaction.value,
          data: transaction.data,
        },
      ],
    }

    const txId = await window.ethereum.request({
      method: "wallet_sendCalls",
      params: [callsPayload],
    })

    console.log("[v0] EIP-5792 transaction ID:", txId)

    toast({
      title: "Transaction Submitted!",
      description: (
        <div className="space-y-1">
          <p>Your atomic swap is being processed on-chain</p>
          <p className="text-sm text-muted-foreground">Transaction ID: {txId.slice(0, 10)}...</p>
        </div>
      ),
    })

    // Wait for transaction confirmation
    await waitForEIP5792Transaction(txId, fromAmt, fromSym, toAmt, toSym)
  }

  const executeSwapTraditional = async (
    transaction: any,
    fromAmt: string,
    fromSym: string,
    toAmt: string,
    toSym: string,
  ) => {
    toast({
      title: "Confirm Transaction",
      description: "Please approve the transaction in your wallet",
    })

    let txHash: string | null = null
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts && !txHash) {
      try {
        txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: address,
              to: transaction.to,
              data: transaction.data,
              value: `0x${BigInt(transaction.value).toString(16)}`,
              gas: transaction.gasLimit,
            },
          ],
        })
      } catch (error: any) {
        attempts++

        // Check if it's a rate limit error
        if (error.message?.includes("rate limit") || error.code === -32005) {
          if (attempts < maxAttempts) {
            const delay = Math.pow(2, attempts) * 1000 // Exponential backoff: 2s, 4s, 8s, 16s
            console.log(`[v0] Rate limited, retrying in ${delay}ms (attempt ${attempts}/${maxAttempts})`)

            toast({
              title: "Rate Limited",
              description: `Retrying in ${delay / 1000} seconds... (${attempts}/${maxAttempts})`,
            })

            await new Promise((resolve) => setTimeout(resolve, delay))
          } else {
            throw new Error(
              "Transaction failed after multiple retries due to rate limiting. Please try again in a few moments.",
            )
          }
        } else {
          // Not a rate limit error, throw immediately
          throw error
        }
      }
    }

    if (!txHash) {
      throw new Error("Failed to send transaction")
    }

    console.log("[v0] Transaction sent:", txHash)

    toast({
      title: "Transaction Submitted!",
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

    waitForTransactionInBackground(txHash, fromAmt, fromSym, toAmt, toSym)
  }

  const waitForEIP5792Transaction = async (
    txId: string,
    fromAmt: string,
    fromSym: string,
    toAmt: string,
    toSym: string,
  ) => {
    try {
      let attempts = 0
      const maxAttempts = 60

      while (attempts < maxAttempts) {
        try {
          const calls = await window.ethereum.request({
            method: "wallet_getCallsStatus",
            params: [txId],
          })

          console.log("[v0] EIP-5792 calls status:", calls)

          if (calls.status === "CONFIRMED") {
            const txHash = calls.receipts?.[0]?.transactionHash

            toast({
              title: "Swap Confirmed!",
              description: (
                <div className="space-y-1">
                  <p>
                    Successfully swapped {fromAmt} {fromSym} for {toAmt} {toSym}
                  </p>
                  {txHash && (
                    <a
                      href={`https://basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline text-sm"
                    >
                      View on BaseScan →
                    </a>
                  )}
                </div>
              ),
            })
            return
          }

          if (calls.status === "FAILED") {
            toast({
              title: "Transaction Failed",
              description: "The atomic swap was reverted on-chain",
              variant: "destructive",
            })
            return
          }
        } catch (error) {
          console.log("[v0] EIP-5792 polling error (will retry):", error)
        }

        await new Promise((resolve) => setTimeout(resolve, 3000))
        attempts++
      }

      toast({
        title: "Confirmation Timeout",
        description: "Transaction is taking longer than expected. Check your wallet for status.",
      })
    } catch (error) {
      console.error("[v0] EIP-5792 confirmation error:", error)
    }
  }

  const waitForTransactionInBackground = async (
    txHash: string,
    fromAmt: string,
    fromSym: string,
    toAmt: string,
    toSym: string,
  ) => {
    try {
      let attempts = 0
      const maxAttempts = 60
      const BLAST_API_URL = "https://base-mainnet.blastapi.io/d6d4ab7c-d1de-4412-9a48-ae9c7965285c"

      while (attempts < maxAttempts) {
        try {
          // Use BlastAPI directly instead of window.ethereum to avoid rate limiting
          const response = await fetch(BLAST_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "eth_getTransactionReceipt",
              params: [txHash],
            }),
          })

          const data = await response.json()
          const receipt = data.result

          if (receipt) {
            if (receipt.status === "0x1") {
              toast({
                title: "Swap Confirmed!",
                description: `Successfully swapped ${fromAmt} ${fromSym} for ${toAmt} ${toSym}`,
              })
            } else {
              toast({
                title: "Transaction Failed",
                description: "The transaction was reverted on-chain",
                variant: "destructive",
              })
            }
            return
          }
        } catch (error) {
          console.log("[v0] Polling error (will retry):", error)
        }

        await new Promise((resolve) => setTimeout(resolve, 3000))
        attempts++
      }

      toast({
        title: "Confirmation Timeout",
        description: "Transaction is taking longer than expected. Check BaseScan for status.",
      })
    } catch (error) {
      console.error("[v0] Background confirmation error:", error)
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
            className="w-full max-w-md"
          >
            <Card className="glass-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
              <p className="text-muted-foreground mb-6">Connect your wallet to start swapping tokens</p>
              <Button
                onClick={() => connectWallet("metamask")}
                className="w-full bg-accent hover:bg-accent/90"
                size="lg"
              >
                Connect Wallet
              </Button>
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
              disabled={!fromAmount || !toAmount || isLoading || isSwapping}
              className="w-full mt-6 bg-accent hover:bg-accent/90 text-white font-medium"
              size="lg"
            >
              {isLoading || isSwapping ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {isSwapping ? "Swapping..." : "Loading..."}
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
