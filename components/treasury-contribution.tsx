"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAccount, useWriteContract, useSendTransaction, useWaitForTransactionReceipt, useBalance } from "wagmi"
import { parseEther, formatEther, parseUnits } from "viem"
import { Heart, Loader2, CheckCircle2, XCircle, Wallet, TrendingUp } from "lucide-react"
import { DEUS_TOKEN_ADDRESS } from "@/lib/constants"
import { useConnect } from "wagmi"

const TREASURY_ADDRESS = "0x7d1a4b4941200fb2907638202782e9248b9b9887"

const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

type TokenType = "ETH" | "DEUS"

interface ContributionStatus {
  type: "idle" | "pending" | "success" | "error"
  message?: string
  txHash?: string
}

export function TreasuryContribution() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const [selectedToken, setSelectedToken] = useState<TokenType>("ETH")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState<ContributionStatus>({ type: "idle" })

  const { data: ethBalance } = useBalance({
    address: address,
  })

  const { data: deusBalance } = useBalance({
    address: address,
    token: DEUS_TOKEN_ADDRESS as `0x${string}`,
  })

  const { sendTransaction, data: ethHash, isPending: isEthPending, error: ethError } = useSendTransaction()
  const { writeContract, data: tokenHash, isPending: isTokenPending, error: tokenError } = useWriteContract()

  const hash = selectedToken === "ETH" ? ethHash : tokenHash
  const isPending = selectedToken === "ETH" ? isEthPending : isTokenPending
  const error = selectedToken === "ETH" ? ethError : tokenError

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isPending || isConfirming) {
      setStatus({ type: "pending", message: "Transaction pending..." })
    } else if (isConfirmed && hash) {
      setStatus({
        type: "success",
        message: "Contribution successful!",
        txHash: hash,
      })
      setAmount("")
    } else if (error) {
      setStatus({
        type: "error",
        message: error.message || "Transaction failed",
      })
    }
  }, [isPending, isConfirming, isConfirmed, hash, error])

  const handleContribute = async () => {
    if (!isConnected || !address || !amount || Number.parseFloat(amount) <= 0) {
      setStatus({ type: "error", message: "Please enter a valid amount" })
      return
    }

    try {
      setStatus({ type: "pending", message: "Preparing transaction..." })

      if (selectedToken === "ETH") {
        sendTransaction({
          to: TREASURY_ADDRESS as `0x${string}`,
          value: parseEther(amount),
        })
      } else {
        const amountInWei = parseUnits(amount, 18)
        writeContract({
          address: DEUS_TOKEN_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [TREASURY_ADDRESS as `0x${string}`, amountInWei],
        })
      }
    } catch (err) {
      console.error("[v0] Contribution error:", err)
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to contribute",
      })
    }
  }

  const getBalance = () => {
    if (selectedToken === "ETH") {
      return ethBalance ? formatEther(ethBalance.value) : "0"
    } else {
      return deusBalance ? formatEther(deusBalance.value) : "0"
    }
  }

  const setMaxAmount = () => {
    const balance = getBalance()
    if (selectedToken === "ETH") {
      const maxAmount = Math.max(0, Number.parseFloat(balance) - 0.001)
      setAmount(maxAmount.toFixed(6))
    } else {
      setAmount(balance)
    }
  }

  const isAmountValid = () => {
    if (!amount || Number.parseFloat(amount) <= 0) return false
    const balance = Number.parseFloat(getBalance())
    const inputAmount = Number.parseFloat(amount)
    return inputAmount <= balance
  }

  const handleConnectWallet = () => {
    const connector = connectors[0]
    if (connector) {
      connect({ connector })
    }
  }

  return (
    <Card className="glass-card backdrop-blur-xl border-orange-500/20 shadow-xl shadow-orange-500/10">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Heart className="h-6 w-6 md:h-7 md:w-7 text-orange-400" />
              Contribute to Treasury
            </CardTitle>
            <CardDescription className="text-gray-300 mt-2 text-sm md:text-base">
              Support the DEUS ecosystem by contributing ETH or DEUS tokens
            </CardDescription>
          </div>
          <Badge variant="outline" className="glass-card border-orange-500/30 text-orange-300 w-fit">
            <TrendingUp className="h-3 w-3 mr-1" />
            Community Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="text-center py-8 md:py-12">
            <Wallet className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-6 text-sm md:text-base">Connect your wallet to contribute</p>
            <Button
              onClick={handleConnectWallet}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-12 px-8 text-base font-semibold bg-[rgba(220,90,63,1)]"
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm md:text-base">Select Token</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedToken === "ETH" ? "default" : "outline"}
                  onClick={() => setSelectedToken("ETH")}
                  className={
                    selectedToken === "ETH"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-12 md:h-14"
                      : "glass-card border-white/10 hover:border-blue-500/50 h-12 md:h-14"
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-sm md:text-base">
                      Ξ
                    </div>
                    <span className="text-sm md:text-base">ETH</span>
                  </div>
                </Button>
                <Button
                  variant={selectedToken === "DEUS" ? "default" : "outline"}
                  onClick={() => setSelectedToken("DEUS")}
                  className={
                    selectedToken === "DEUS"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-12 md:h-14"
                      : "glass-card border-white/10 hover:border-orange-500/50 h-12 md:h-14"
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-sm md:text-base">
                      $
                    </div>
                    <span className="text-sm md:text-base">DEUS</span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 text-sm md:text-base">Amount</Label>
                <button
                  onClick={setMaxAmount}
                  className="text-xs md:text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Balance: {Number.parseFloat(getBalance()).toFixed(6)} {selectedToken}
                </button>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass-card border-white/10 text-white text-lg md:text-xl pr-20 focus:border-orange-500/50 h-12 md:h-14"
                  step="0.000001"
                  min="0"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={setMaxAmount}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-xs md:text-sm"
                >
                  MAX
                </Button>
              </div>
            </div>

            <Button
              onClick={handleContribute}
              disabled={!isAmountValid() || isPending || isConfirming}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed h-12 md:h-14 text-base md:text-lg font-semibold"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5 mr-2" />
                  Contribute {amount || "0"} {selectedToken}
                </>
              )}
            </Button>

            <AnimatePresence mode="wait">
              {status.type !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg glass-card ${
                    status.type === "success"
                      ? "border-green-500/30 bg-green-500/10"
                      : status.type === "error"
                        ? "border-red-500/30 bg-red-500/10"
                        : "border-orange-500/30 bg-orange-500/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {status.type === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : status.type === "error" ? (
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5 animate-spin" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          status.type === "success"
                            ? "text-green-300"
                            : status.type === "error"
                              ? "text-red-300"
                              : "text-orange-300"
                        }`}
                      >
                        {status.message}
                      </p>
                      {status.txHash && (
                        <a
                          href={`https://basescan.org/tx/${status.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors mt-1 inline-block"
                        >
                          View on Basescan →
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="glass-card p-4 rounded-lg border-white/5">
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                Your contribution helps grow the DEUS treasury, supporting ecosystem development, liquidity incentives,
                and community initiatives. All contributions are transparent and tracked on-chain.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
