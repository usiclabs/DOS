"use client"

import { useState, useCallback } from "react"
import { useAccount, useWriteContract } from "wagmi"
import { parseUnits, encodeFunctionData, type Address } from "viem"
import { base } from "wagmi/chains"
import {
  ERC20_ABI,
  NONFUNGIBLE_POSITION_MANAGER_ABI,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
  UNISWAP_V3_POOL_ABI,
} from "@/lib/uniswap-abis"

interface DeployLiquidityParams {
  token0Address: string
  token1Address: string
  amount0: string
  amount1: string
  feeTier: number // e.g., 500, 3000, 10000
  slippage: number // e.g., 0.5 for 0.5%
  poolAddress?: string
}

interface DeployState {
  step: "idle" | "approving-token0" | "approving-token1" | "minting" | "success" | "error"
  txHash?: string
  tokenId?: string
  error?: string
  isLoading: boolean
}

export function useDeployLiquidity() {
  const { address } = useAccount()
  const [state, setState] = useState<DeployState>({
    step: "idle",
    isLoading: false,
  })

  const { writeContractAsync } = useWriteContract()

  // Helper to calculate tick range (simplified - uses ±10% range)
  const calculateTickRange = useCallback((currentTick: number, tickSpacing: number) => {
    // Calculate ticks for approximately ±10% price range
    const tickRange = Math.floor(2000 / tickSpacing) * tickSpacing
    const tickLower = Math.floor((currentTick - tickRange) / tickSpacing) * tickSpacing
    const tickUpper = Math.floor((currentTick + tickRange) / tickSpacing) * tickSpacing

    return { tickLower, tickUpper }
  }, [])

  // Check and approve token if needed
  const approveToken = useCallback(
    async (tokenAddress: string, amount: string, decimals: number) => {
      if (!address) throw new Error("Wallet not connected")

      console.log("[v0] Checking allowance for token:", tokenAddress)

      // Check current allowance
      const allowance = (await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: tokenAddress,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: "allowance",
              args: [address as Address, NONFUNGIBLE_POSITION_MANAGER_ADDRESS],
            }),
          },
          "latest",
        ],
      })) as string

      const allowanceAmount = BigInt(allowance)
      const requiredAmount = parseUnits(amount, decimals)

      console.log("[v0] Current allowance:", allowanceAmount.toString())
      console.log("[v0] Required amount:", requiredAmount.toString())

      if (allowanceAmount >= requiredAmount) {
        console.log("[v0] Sufficient allowance, skipping approval")
        return null
      }

      console.log("[v0] Approving token:", tokenAddress)

      // Request approval
      const hash = await writeContractAsync({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [NONFUNGIBLE_POSITION_MANAGER_ADDRESS, requiredAmount],
        chainId: base.id,
      })

      console.log("[v0] Approval transaction sent:", hash)
      return hash
    },
    [address, writeContractAsync],
  )

  // Wait for transaction confirmation
  const waitForTransaction = useCallback(async (hash: string) => {
    console.log("[v0] Waiting for transaction confirmation:", hash)

    let attempts = 0
    const maxAttempts = 60

    while (attempts < maxAttempts) {
      try {
        const receipt = (await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [hash],
        })) as any

        if (receipt) {
          if (receipt.status === "0x1") {
            console.log("[v0] Transaction confirmed successfully")
            return true
          } else {
            throw new Error("Transaction failed")
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))
        attempts++
      } catch (error) {
        console.error("[v0] Error waiting for transaction:", error)
        throw error
      }
    }

    throw new Error("Transaction confirmation timeout")
  }, [])

  // Get token decimals
  const getTokenDecimals = useCallback(async (tokenAddress: string): Promise<number> => {
    try {
      const decimalsHex = (await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: tokenAddress,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: "decimals",
              args: [],
            }),
          },
          "latest",
        ],
      })) as string

      return Number.parseInt(decimalsHex, 16)
    } catch (error) {
      console.error("[v0] Error getting decimals:", error)
      return 18 // Default to 18 if we can't fetch
    }
  }, [])

  // Get current pool state
  const getPoolState = useCallback(async (poolAddress: string) => {
    try {
      const slot0Data = (await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: poolAddress,
            data: encodeFunctionData({
              abi: UNISWAP_V3_POOL_ABI,
              functionName: "slot0",
              args: [],
            }),
          },
          "latest",
        ],
      })) as string

      const tickSpacingData = (await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: poolAddress,
            data: encodeFunctionData({
              abi: UNISWAP_V3_POOL_ABI,
              functionName: "tickSpacing",
              args: [],
            }),
          },
          "latest",
        ],
      })) as string

      // Decode slot0 (simplified - just get tick which is the second value)
      const currentTick = Number.parseInt(slot0Data.slice(66, 130), 16)
      const tickSpacing = Number.parseInt(tickSpacingData, 16)

      return { currentTick, tickSpacing }
    } catch (error) {
      console.error("[v0] Error getting pool state:", error)
      // Return defaults based on fee tier
      return { currentTick: 0, tickSpacing: 60 }
    }
  }, [])

  // Main deploy function
  const deployLiquidity = useCallback(
    async (params: DeployLiquidityParams) => {
      if (!address) {
        throw new Error("Wallet not connected")
      }

      setState({ step: "idle", isLoading: true })

      try {
        console.log("[v0] Starting liquidity deployment:", params)

        // Get token decimals
        const decimals0 = await getTokenDecimals(params.token0Address)
        const decimals1 = await getTokenDecimals(params.token1Address)

        console.log("[v0] Token decimals:", { decimals0, decimals1 })

        // Step 1: Approve token0
        setState({ step: "approving-token0", isLoading: true })
        const approval0Hash = await approveToken(params.token0Address, params.amount0, decimals0)
        if (approval0Hash) {
          await waitForTransaction(approval0Hash)
        }

        // Step 2: Approve token1
        setState({ step: "approving-token1", isLoading: true })
        const approval1Hash = await approveToken(params.token1Address, params.amount1, decimals1)
        if (approval1Hash) {
          await waitForTransaction(approval1Hash)
        }

        // Step 3: Get pool state and calculate ticks
        let tickLower = -887220 // Default full range
        let tickUpper = 887220

        if (params.poolAddress) {
          const { currentTick, tickSpacing } = await getPoolState(params.poolAddress)
          const tickRange = calculateTickRange(currentTick, tickSpacing)
          tickLower = tickRange.tickLower
          tickUpper = tickRange.tickUpper
        }

        console.log("[v0] Tick range:", { tickLower, tickUpper })

        // Step 4: Mint position
        setState({ step: "minting", isLoading: true })

        const amount0Desired = parseUnits(params.amount0, decimals0)
        const amount1Desired = parseUnits(params.amount1, decimals1)

        // Calculate minimum amounts with slippage
        const slippageMultiplier = BigInt(Math.floor((100 - params.slippage) * 100))
        const amount0Min = (amount0Desired * slippageMultiplier) / BigInt(10000)
        const amount1Min = (amount1Desired * slippageMultiplier) / BigInt(10000)

        const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200) // 20 minutes

        console.log("[v0] Minting position with params:", {
          token0: params.token0Address,
          token1: params.token1Address,
          fee: params.feeTier,
          tickLower,
          tickUpper,
          amount0Desired: amount0Desired.toString(),
          amount1Desired: amount1Desired.toString(),
          amount0Min: amount0Min.toString(),
          amount1Min: amount1Min.toString(),
        })

        const mintHash = await writeContractAsync({
          address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "mint",
          args: [
            {
              token0: params.token0Address as Address,
              token1: params.token1Address as Address,
              fee: params.feeTier,
              tickLower,
              tickUpper,
              amount0Desired,
              amount1Desired,
              amount0Min,
              amount1Min,
              recipient: address as Address,
              deadline,
            },
          ],
          chainId: base.id,
        })

        console.log("[v0] Mint transaction sent:", mintHash)

        await waitForTransaction(mintHash)

        setState({
          step: "success",
          isLoading: false,
          txHash: mintHash,
        })

        return { success: true, txHash: mintHash }
      } catch (error: any) {
        console.error("[v0] Deployment error:", error)

        let errorMessage = error.message || "Unknown error occurred"

        if (error.code === 4001 || errorMessage.includes("User rejected")) {
          errorMessage = "Transaction cancelled by user"
        } else if (errorMessage.includes("insufficient")) {
          errorMessage = "Insufficient token balance"
        }

        setState({
          step: "error",
          isLoading: false,
          error: errorMessage,
        })

        throw error
      }
    },
    [address, approveToken, waitForTransaction, getTokenDecimals, getPoolState, calculateTickRange, writeContractAsync],
  )

  const reset = useCallback(() => {
    setState({ step: "idle", isLoading: false })
  }, [])

  return {
    deployLiquidity,
    state,
    reset,
  }
}
