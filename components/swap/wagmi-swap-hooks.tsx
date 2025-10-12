"use client"

import { useEffect, useCallback, useRef, useState } from "react"

interface WagmiSwapHooksProps {
  quote: any
  address: string
  onSwapUpdate: (data: {
    isExecuting: boolean
    txHash?: string
    isConfirmed?: boolean
    error?: string
    retryAttempt?: number
    maxRetries?: number
    retryDelay?: number
  }) => void
}

export default function WagmiSwapHooks({ quote, address, onSwapUpdate }: WagmiSwapHooksProps) {
  const hasExecutedRef = useRef(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>()

  useEffect(() => {
    onSwapUpdate({ isExecuting })
  }, [isExecuting, onSwapUpdate])

  useEffect(() => {
    if (txHash) {
      onSwapUpdate({ isExecuting, txHash })
    }
  }, [txHash, isExecuting, onSwapUpdate])

  const waitForTransactionReceipt = async (txHash: string, maxAttempts = 60): Promise<any> => {
    console.log("[v0] Waiting for transaction confirmation:", txHash)

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const receipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        })

        if (receipt) {
          console.log("[v0] Transaction receipt received:", receipt)

          // Check if transaction succeeded (status === "0x1") or failed (status === "0x0")
          if (receipt.status === "0x1") {
            console.log("[v0] Transaction confirmed successfully!")
            return { success: true, receipt }
          } else if (receipt.status === "0x0") {
            console.error("[v0] Transaction reverted on-chain")
            return { success: false, receipt, error: "Transaction reverted" }
          }
        }

        // Transaction still pending, wait and retry
        if (attempt < maxAttempts) {
          console.log(`[v0] Transaction pending, checking again in 2s... (${attempt}/${maxAttempts})`)
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error("[v0] Error checking transaction receipt:", error)
        if (attempt === maxAttempts) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    throw new Error("Transaction confirmation timeout - please check Basescan for status")
  }

  const sendTransactionWithRetry = async (txParams: any, maxRetries = 3) => {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[v0] Sending transaction (attempt ${attempt}/${maxRetries})`)

        const hash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [txParams],
        })

        return hash
      } catch (error: any) {
        lastError = error

        const isRateLimit =
          error.message?.toLowerCase().includes("rate limit") ||
          error.message?.toLowerCase().includes("too many requests") ||
          error.code === 429

        const isUserRejection =
          error.code === 4001 || error.message?.includes("User rejected") || error.message?.includes("User denied")

        if (isUserRejection) {
          throw error
        }

        if (!isRateLimit || attempt === maxRetries) {
          throw error
        }

        const delay = Math.pow(2, attempt) * 1000
        console.log(`[v0] Rate limited, retrying in ${delay}ms...`)

        onSwapUpdate({
          isExecuting: true,
          retryAttempt: attempt,
          maxRetries,
          retryDelay: delay,
        })

        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  const handleSwap = useCallback(async () => {
    if (!quote || !address) {
      console.error("[v0] Missing quote or address for swap")
      return
    }

    if (hasExecutedRef.current) {
      console.log("[v0] Swap already executed, skipping")
      return
    }

    hasExecutedRef.current = true
    setIsExecuting(true)
    console.log("[v0] Executing real swap:", quote)

    try {
      const response = await fetch("/api/swap/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quote,
          userAddress: address,
          slippage: 0.5,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to prepare swap transaction: ${errorData}`)
      }

      const { transaction } = await response.json()
      console.log("[v0] Transaction prepared:", transaction)

      if (!transaction || !transaction.to) {
        throw new Error("Invalid transaction data received")
      }

      if (!window.ethereum) {
        throw new Error("No wallet detected. Please install MetaMask or another Web3 wallet.")
      }

      const txParams = {
        from: address,
        to: transaction.to,
        data: transaction.data,
        value: transaction.value && transaction.value !== "0x0" ? transaction.value : "0x0",
        gas: "0xC3500",
        ...(transaction.nonce && { nonce: transaction.nonce }),
        ...(transaction.maxFeePerGas && { maxFeePerGas: transaction.maxFeePerGas }),
        ...(transaction.maxPriorityFeePerGas && { maxPriorityFeePerGas: transaction.maxPriorityFeePerGas }),
      }

      console.log("[v0] Sending transaction via wallet provider:", {
        to: txParams.to,
        value: txParams.value,
        gas: txParams.gas,
        nonce: txParams.nonce,
        maxFeePerGas: txParams.maxFeePerGas,
        dataLength: txParams.data.length,
      })

      const hash = await sendTransactionWithRetry(txParams)

      console.log("[v0] Transaction sent successfully:", hash)
      console.log("[v0] View on Basescan: https://basescan.org/tx/" + hash)

      setTxHash(hash)

      onSwapUpdate({
        isExecuting: true,
        txHash: hash,
      })

      const result = await waitForTransactionReceipt(hash)

      if (result.success) {
        console.log("[v0] Swap completed successfully!")
        setIsExecuting(false)
        onSwapUpdate({
          isExecuting: false,
          txHash: hash,
          isConfirmed: true,
        })
      } else {
        // Transaction reverted
        throw new Error(
          result.error ||
            "Transaction failed on-chain. This usually means slippage was too high or there was insufficient liquidity.",
        )
      }
    } catch (error: any) {
      console.error("[v0] Swap execution error:", error)
      hasExecutedRef.current = false
      setIsExecuting(false)

      let errorMessage = error.message

      if (error.code === 4001 || error.message?.includes("User rejected") || error.message?.includes("User denied")) {
        errorMessage = "Transaction cancelled by user"
        console.log("[v0] User cancelled the transaction")
      } else if (
        error.message?.toLowerCase().includes("rate limit") ||
        error.message?.toLowerCase().includes("too many requests")
      ) {
        errorMessage =
          "Network is experiencing high traffic. Please wait a moment and try again, or check your wallet's RPC settings."
      } else if (error.message?.includes("reverted")) {
        errorMessage = "Transaction failed: " + error.message
      }

      onSwapUpdate({ isExecuting: false, error: errorMessage })
    }
  }, [quote, address, onSwapUpdate])

  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).__executeSwap = handleSwap
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__executeSwap
      }
    }
  }, [handleSwap])

  return null
}
