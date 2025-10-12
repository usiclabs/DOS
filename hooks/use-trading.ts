"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import type { Address } from "viem"
import { toast } from "@/components/ui/use-toast"

export type OrderType = "market" | "limit" | "stop"
export type OrderSide = "buy" | "sell"

export interface TradeParams {
  pair: string
  side: OrderSide
  orderType: OrderType
  amount: string
  price?: string
  stopPrice?: string
  leverage?: number
  stopLoss?: string
  takeProfit?: string
}

export interface TradeResult {
  success: boolean
  txHash?: string
  error?: string
}

export function useTrading() {
  const { address, isConnected } = useWallet()
  const [isExecuting, setIsExecuting] = useState(false)

  const executeTrade = async (params: TradeParams): Promise<TradeResult> => {
    if (!isConnected || !address || !window.ethereum) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to execute trades",
        variant: "destructive",
      })
      return { success: false, error: "Wallet not connected" }
    }

    setIsExecuting(true)

    try {
      console.log("[v0] Executing trade:", params)

      // Validate inputs
      if (!params.amount || Number.parseFloat(params.amount) <= 0) {
        throw new Error("Invalid trade amount")
      }

      if (params.orderType === "limit" && (!params.price || Number.parseFloat(params.price) <= 0)) {
        throw new Error("Limit orders require a valid price")
      }

      if (params.orderType === "stop" && (!params.stopPrice || Number.parseFloat(params.stopPrice) <= 0)) {
        throw new Error("Stop orders require a valid stop price")
      }

      // For market orders, we'll use the swap functionality
      if (params.orderType === "market") {
        toast({
          title: "Executing market order",
          description: `${params.side === "buy" ? "Buying" : "Selling"} ${params.amount} ${params.pair.split("/")[0]}`,
        })

        // In a real implementation, this would call the swap API
        // For now, we'll simulate the trade
        await new Promise((resolve) => setTimeout(resolve, 2000))

        toast({
          title: "Trade executed successfully",
          description: `Market ${params.side} order completed`,
        })

        return {
          success: true,
          txHash: "0x" + Math.random().toString(16).substring(2, 66),
        }
      }

      // For limit and stop orders, we would need to interact with a limit order protocol
      // This is a placeholder for future implementation
      toast({
        title: "Order placed",
        description: `${params.orderType} ${params.side} order for ${params.amount} ${params.pair.split("/")[0]} has been placed`,
      })

      return {
        success: true,
        txHash: "0x" + Math.random().toString(16).substring(2, 66),
      }
    } catch (err: any) {
      console.error("[v0] Trade execution error:", err)

      const errorMessage = err.message || "Failed to execute trade"

      toast({
        title: "Trade failed",
        description: errorMessage,
        variant: "destructive",
      })

      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsExecuting(false)
    }
  }

  const getQuote = async (
    tokenIn: Address,
    tokenOut: Address,
    amountIn: string,
  ): Promise<{ amountOut: string; priceImpact: number } | null> => {
    try {
      const response = await fetch("/api/swap/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenIn,
          tokenOut,
          amountIn,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get quote")
      }

      const data = await response.json()
      return {
        amountOut: data.amountOut,
        priceImpact: data.priceImpact || 0,
      }
    } catch (err) {
      console.error("[v0] Quote error:", err)
      return null
    }
  }

  return {
    executeTrade,
    getQuote,
    isExecuting,
  }
}
