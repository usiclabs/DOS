"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { encodeFunctionData } from "viem"
import { NONFUNGIBLE_POSITION_MANAGER_ABI, NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/lib/uniswap-abis"
import { toast } from "@/components/ui/use-toast"

interface LPPosition {
  id: string
  tokenId?: number
  poolId: string
  pairAddress: string
  baseToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  quoteToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  dexId: string
  poolType: "v3" | "xlp" | "v2"
  isDeusPool: boolean
  feeTier: string
  liquidityTokens: number
  totalValue: number
  initialValue: number
  currentApr: number
  feesEarned: number
  impermanentLoss: number
  netPnl: number
  poolShare: number
  entryDate: string
  lastUpdated: string
  tickLower?: number
  tickUpper?: number
  inRange?: boolean
}

export function usePortfolioActions() {
  const { address, isConnected } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)

  const collectFeesFromPositions = async (positions: LPPosition[]) => {
    if (!isConnected || !address || !window.ethereum) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to collect fees",
        variant: "destructive",
      })
      return false
    }

    // Filter V3 positions with fees
    const v3PositionsWithFees = positions.filter((p) => p.poolType === "v3" && p.feesEarned > 0 && p.tokenId)

    if (v3PositionsWithFees.length === 0) {
      toast({
        title: "No fees to collect",
        description: "None of your V3 positions have accumulated fees",
      })
      return false
    }

    setIsProcessing(true)

    try {
      console.log("[v0] Collecting fees from", v3PositionsWithFees.length, "positions")

      // Collect fees from each position
      const results = []
      for (const position of v3PositionsWithFees) {
        try {
          console.log("[v0] Collecting fees from position", position.tokenId)

          const collectData = encodeFunctionData({
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "collect",
            args: [
              {
                tokenId: BigInt(position.tokenId!),
                recipient: address,
                amount0Max: BigInt("0xffffffffffffffffffffffffffffffff"), // Max uint128
                amount1Max: BigInt("0xffffffffffffffffffffffffffffffff"), // Max uint128
              },
            ],
          })

          const collectTx = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [
              {
                from: address,
                to: NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
                data: collectData,
              },
            ],
          })

          console.log("[v0] Fee collection tx:", collectTx)

          // Wait for confirmation
          let receipt = null
          let attempts = 0
          while (!receipt && attempts < 30) {
            await new Promise((resolve) => setTimeout(resolve, 2000))
            receipt = await window.ethereum.request({
              method: "eth_getTransactionReceipt",
              params: [collectTx],
            })
            attempts++
          }

          if (receipt && receipt.status === "0x1") {
            results.push({
              position: position.id,
              success: true,
              txHash: collectTx,
            })
            console.log("[v0] Successfully collected fees from position", position.tokenId)
          } else {
            results.push({
              position: position.id,
              success: false,
              error: "Transaction failed",
            })
          }
        } catch (err: any) {
          console.error("[v0] Failed to collect fees from position", position.tokenId, err)
          results.push({
            position: position.id,
            success: false,
            error: err.message,
          })
        }
      }

      const successCount = results.filter((r) => r.success).length
      const failCount = results.filter((r) => !r.success).length

      if (successCount > 0) {
        toast({
          title: "Fees collected successfully",
          description: `Collected fees from ${successCount} position${successCount > 1 ? "s" : ""}${failCount > 0 ? `. ${failCount} failed.` : ""}`,
        })
      } else {
        toast({
          title: "Fee collection failed",
          description: "Failed to collect fees from all positions",
          variant: "destructive",
        })
      }

      return successCount > 0
    } catch (err: any) {
      console.error("[v0] Batch fee collection error:", err)
      toast({
        title: "Fee collection failed",
        description: err.message || "An error occurred while collecting fees",
        variant: "destructive",
      })
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  const rebalancePositions = async (positions: LPPosition[], targetAllocation: Record<string, number>) => {
    if (!isConnected || !address || !window.ethereum) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to rebalance",
        variant: "destructive",
      })
      return false
    }

    if (positions.length === 0) {
      toast({
        title: "No positions to rebalance",
        description: "You don't have any active positions",
      })
      return false
    }

    setIsProcessing(true)

    try {
      console.log("[v0] Starting portfolio rebalancing...")
      console.log("[v0] Current positions:", positions.length)
      console.log("[v0] Target allocation:", targetAllocation)

      // Calculate current allocation
      const totalValue = positions.reduce((sum, p) => sum + p.totalValue, 0)
      const currentAllocation: Record<string, number> = {}

      positions.forEach((p) => {
        const poolKey = `${p.baseToken.symbol}/${p.quoteToken.symbol}`
        currentAllocation[poolKey] = (currentAllocation[poolKey] || 0) + p.totalValue / totalValue
      })

      console.log("[v0] Current allocation:", currentAllocation)

      // Identify positions that need rebalancing (deviation > 5%)
      const positionsToRebalance = positions.filter((p) => {
        const poolKey = `${p.baseToken.symbol}/${p.quoteToken.symbol}`
        const currentPercent = (currentAllocation[poolKey] || 0) * 100
        const targetPercent = (targetAllocation[poolKey] || 0) * 100
        const deviation = Math.abs(currentPercent - targetPercent)
        return deviation > 5 // 5% threshold
      })

      if (positionsToRebalance.length === 0) {
        toast({
          title: "Portfolio already balanced",
          description: "All positions are within 5% of target allocation",
        })
        return true
      }

      console.log("[v0] Positions needing rebalancing:", positionsToRebalance.length)

      // For V3 positions, we can adjust liquidity by decreasing/increasing
      const v3Positions = positionsToRebalance.filter((p) => p.poolType === "v3" && p.tokenId)

      if (v3Positions.length === 0) {
        toast({
          title: "No V3 positions to rebalance",
          description: "Only Uniswap V3 positions support automated rebalancing",
        })
        return false
      }

      // Simulate rebalancing (in production, this would execute actual transactions)
      toast({
        title: "Rebalancing in progress",
        description: `Analyzing ${v3Positions.length} V3 positions for optimal rebalancing...`,
      })

      // Wait to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For now, we'll just show what would be done
      const rebalancingPlan = v3Positions.map((p) => {
        const poolKey = `${p.baseToken.symbol}/${p.quoteToken.symbol}`
        const currentPercent = (currentAllocation[poolKey] || 0) * 100
        const targetPercent = (targetAllocation[poolKey] || 0) * 100
        const action = currentPercent > targetPercent ? "decrease" : "increase"
        const amount = Math.abs(currentPercent - targetPercent)

        return {
          position: poolKey,
          action,
          amount: amount.toFixed(2) + "%",
        }
      })

      console.log("[v0] Rebalancing plan:", rebalancingPlan)

      toast({
        title: "Rebalancing analysis complete",
        description: `Identified ${rebalancingPlan.length} positions that need adjustment. Review the plan and confirm to proceed.`,
      })

      return true
    } catch (err: any) {
      console.error("[v0] Rebalancing error:", err)
      toast({
        title: "Rebalancing failed",
        description: err.message || "An error occurred during rebalancing",
        variant: "destructive",
      })
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    collectFeesFromPositions,
    rebalancePositions,
    isProcessing,
  }
}
