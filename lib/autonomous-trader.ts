import { type Wallet, Contract, ethers } from "ethers"
import { UNISWAP_V4_ROUTER_ABI } from "@/lib/contracts/uniswap-v4-abi"

interface SwapConfig {
  frequency: number // minutes between swaps
  minSwapSize: number // minimum swap in ETH
  maxSwapSize: number // maximum swap in ETH
  slippage: number // acceptable slippage percentage
}

interface SwapResult {
  transactionHash: string
  tokenIn: string
  tokenOut: string
  amountIn: string
  amountOut: string
  timestamp: number
  fee: number
}

export class AutonomousTrader {
  private wallet: Wallet
  private config: SwapConfig
  private isRunning = false
  private swapHistory: SwapResult[] = []
  private lastSwapTime = 0

  constructor(wallet: Wallet, config: SwapConfig) {
    this.wallet = wallet
    this.config = config
  }

  /**
   * Get random swap size within configured bounds
   */
  private getRandomSwapSize(): number {
    const { minSwapSize, maxSwapSize } = this.config
    return Math.random() * (maxSwapSize - minSwapSize) + minSwapSize
  }

  /**
   * Check if enough time has passed for next swap
   */
  private shouldExecuteSwap(): boolean {
    const timeSinceLastSwap = (Date.now() - this.lastSwapTime) / (1000 * 60) // minutes
    return timeSinceLastSwap >= this.config.frequency
  }

  /**
   * Execute a swap on Uniswap V4
   */
  async executeSwap(
    routerAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string,
  ): Promise<SwapResult | null> {
    try {
      console.log("[v0] Executing autonomous swap:", {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        amountIn,
      })

      // Create router contract instance
      const router = new Contract(routerAddress, UNISWAP_V4_ROUTER_ABI, this.wallet)

      // Calculate minimum amount out based on slippage
      const parsedAmount = ethers.parseEther(amountIn)
      const slippageBps = Math.floor(this.config.slippage * 100) // convert percentage to basis points
      const minAmountOut = (parsedAmount * BigInt(10000 - slippageBps)) / BigInt(10000)

      // Build swap parameters
      const swapParams = {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        fee: 2500, // 0.25% fee tier
        recipient: this.wallet.address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minute deadline
        amountIn: parsedAmount,
        amountOutMinimum: minAmountOut,
        sqrtPriceLimitX96: 0, // no limit
      }

      // Execute swap
      const tx = await router.exactInputSingle(swapParams, {
        gasLimit: 500000,
      })

      const receipt = await tx.wait()

      if (!receipt) {
        throw new Error("Transaction failed")
      }

      const swapResult: SwapResult = {
        transactionHash: receipt.hash,
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        amountIn,
        amountOut: minAmountOut.toString(),
        timestamp: Date.now(),
        fee: 0, // will be calculated based on actual tx cost
      }

      this.swapHistory.push(swapResult)
      this.lastSwapTime = Date.now()

      console.log("[v0] Swap executed successfully:", swapResult)
      return swapResult
    } catch (error) {
      console.error("[v0] Swap execution failed:", error)
      return null
    }
  }

  /**
   * Start autonomous trading loop
   */
  startTrading(targetPools: Array<{ tokenIn: string; tokenOut: string; router: string }>): void {
    if (this.isRunning) {
      console.warn("[v0] Trading already running")
      return
    }

    this.isRunning = true
    console.log("[v0] Starting autonomous trading:", {
      agent: this.wallet.address,
      pools: targetPools.length,
      frequency: this.config.frequency,
    })

    this.tradingLoop(targetPools)
  }

  /**
   * Stop autonomous trading
   */
  stopTrading(): void {
    this.isRunning = false
    console.log("[v0] Stopped autonomous trading")
  }

  /**
   * Main trading loop
   */
  private async tradingLoop(targetPools: Array<{ tokenIn: string; tokenOut: string; router: string }>): Promise<void> {
    while (this.isRunning) {
      try {
        // Check if it's time to execute a swap
        if (this.shouldExecuteSwap()) {
          // Select random pool from target pools
          const pool = targetPools[Math.floor(Math.random() * targetPools.length)]
          const swapSize = this.getRandomSwapSize()

          // Execute swap
          await this.executeSwap(pool.router, pool.tokenIn, pool.tokenOut, swapSize.toString())
        }

        // Wait before next check (check every minute)
        await new Promise((resolve) => setTimeout(resolve, 60000))
      } catch (error) {
        console.error("[v0] Error in trading loop:", error)
        // Continue trading despite errors
        await new Promise((resolve) => setTimeout(resolve, 60000))
      }
    }
  }

  /**
   * Get swap history
   */
  getSwapHistory(): SwapResult[] {
    return this.swapHistory
  }

  /**
   * Get trading statistics
   */
  getStats() {
    const swaps = this.swapHistory.length
    const totalVolume = this.swapHistory.reduce((sum, swap) => sum + Number.parseFloat(swap.amountIn), 0)

    return {
      totalSwaps: swaps,
      totalVolume,
      averageSwapSize: swaps > 0 ? totalVolume / swaps : 0,
      isRunning: this.isRunning,
      lastSwapTime: this.lastSwapTime,
    }
  }
}

// Global traders map
const tradersMap = new Map<string, AutonomousTrader>()

export function getOrCreateTrader(agentId: string, wallet: Wallet, config: SwapConfig): AutonomousTrader {
  if (!tradersMap.has(agentId)) {
    tradersMap.set(agentId, new AutonomousTrader(wallet, config))
  }
  return tradersMap.get(agentId)!
}

export function getTrader(agentId: string): AutonomousTrader | null {
  return tradersMap.get(agentId) || null
}
