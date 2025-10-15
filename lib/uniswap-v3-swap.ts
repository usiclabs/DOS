/**
 * Uniswap V3 Swap Integration for Base Chain
 * Uses BlastAPI RPC endpoint for all blockchain interactions
 */

import { encodeAbiParameters } from "viem"
import { rpcCall } from "./rpc-config"

// Uniswap V3 Contract Addresses on Base
export const UNISWAP_V3_ADDRESSES = {
  FACTORY: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
  SWAP_ROUTER: "0x2626664c2603336E57B271c5C0b26F421741e481",
  QUOTER_V2: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
  WETH: "0x4200000000000000000000000000000000000006",
} as const

// Common fee tiers in Uniswap V3 (in basis points)
export const FEE_TIERS = [100, 500, 3000, 10000] as const // 0.01%, 0.05%, 0.3%, 1%

// Quoter V2 ABI (minimal)
const QUOTER_V2_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

// SwapRouter ABI (minimal)
const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const

// Factory ABI (minimal)
const FACTORY_ABI = [
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" },
    ],
    name: "getPool",
    outputs: [{ name: "pool", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const

// Pool ABI to check liquidity
const POOL_ABI = [
  {
    inputs: [],
    name: "liquidity",
    outputs: [{ name: "", type: "uint128" }],
    stateMutability: "view",
    type: "function",
  },
] as const

/**
 * Detect which fee tier has a pool for the given token pair
 * Returns the pool with the highest liquidity
 */
export async function detectPoolFeeTier(
  tokenA: string,
  tokenB: string,
): Promise<{ fee: number; poolAddress: string } | null> {
  console.log("[v0] Detecting pool fee tier for:", { tokenA, tokenB })

  const pools: Array<{ fee: number; poolAddress: string; liquidity: bigint }> = []

  for (const fee of FEE_TIERS) {
    try {
      // Encode getPool function call
      const data = encodeAbiParameters(
        [{ type: "address" }, { type: "address" }, { type: "uint24" }],
        [tokenA as `0x${string}`, tokenB as `0x${string}`, fee],
      )

      const functionSelector = "0x1698ee82" // getPool(address,address,uint24)
      const callData = functionSelector + data.slice(2)

      const result = await rpcCall("eth_call", [
        {
          to: UNISWAP_V3_ADDRESSES.FACTORY,
          data: callData,
        },
        "latest",
      ])

      // Decode the pool address from the result
      const poolAddress = "0x" + result.slice(-40)

      // Check if pool exists (not zero address)
      if (poolAddress !== "0x0000000000000000000000000000000000000000") {
        // Get pool liquidity
        try {
          const liquidityResult = await rpcCall("eth_call", [
            {
              to: poolAddress,
              data: "0x1a686502", // liquidity()
            },
            "latest",
          ])

          const liquidity = BigInt(liquidityResult)
          console.log("[v0] Found pool:", { fee, poolAddress, liquidity: liquidity.toString() })

          pools.push({ fee, poolAddress, liquidity })
        } catch (error) {
          console.error(`[v0] Error getting liquidity for pool ${poolAddress}:`, error)
        }
      }
    } catch (error) {
      console.error(`[v0] Error checking fee tier ${fee}:`, error)
    }
  }

  if (pools.length === 0) {
    console.log("[v0] No pool found for token pair")
    return null
  }

  const bestPool = pools.reduce((best, current) => (current.liquidity > best.liquidity ? current : best))

  console.log("[v0] Selected pool with best liquidity:", {
    fee: bestPool.fee,
    poolAddress: bestPool.poolAddress,
    liquidity: bestPool.liquidity.toString(),
  })

  return { fee: bestPool.fee, poolAddress: bestPool.poolAddress }
}

/**
 * Get a swap quote from Uniswap V3 Quoter
 */
export async function getSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  fee: number,
): Promise<{
  amountOut: string
  gasEstimate: string
  priceImpact: number
} | null> {
  try {
    console.log("[v0] Getting swap quote:", { tokenIn, tokenOut, amountIn, fee })

    // Encode quoteExactInputSingle function call
    const params = encodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            { name: "tokenIn", type: "address" },
            { name: "tokenOut", type: "address" },
            { name: "amountIn", type: "uint256" },
            { name: "fee", type: "uint24" },
            { name: "sqrtPriceLimitX96", type: "uint160" },
          ],
        },
      ],
      [
        {
          tokenIn: tokenIn as `0x${string}`,
          tokenOut: tokenOut as `0x${string}`,
          amountIn: BigInt(amountIn),
          fee,
          sqrtPriceLimitX96: BigInt(0),
        },
      ],
    )

    const functionSelector = "0xc6a5026a" // quoteExactInputSingle((address,address,uint256,uint24,uint160))
    const callData = functionSelector + params.slice(2)

    const result = await rpcCall("eth_call", [
      {
        to: UNISWAP_V3_ADDRESSES.QUOTER_V2,
        data: callData,
      },
      "latest",
    ])

    // Decode the result (amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate)
    // Result is ABI-encoded tuple, we need to extract amountOut (first 32 bytes after offset)
    const amountOut = BigInt("0x" + result.slice(2, 66))
    const gasEstimate = BigInt("0x" + result.slice(194, 258))

    console.log("[v0] Quote received:", {
      amountOut: amountOut.toString(),
      gasEstimate: gasEstimate.toString(),
    })

    return {
      amountOut: amountOut.toString(),
      gasEstimate: gasEstimate.toString(),
      priceImpact: 0, // Calculate if needed
    }
  } catch (error) {
    console.error("[v0] Error getting swap quote:", error)
    return null
  }
}

/**
 * Build swap transaction data for Uniswap V3 SwapRouter
 */
export function buildSwapTransaction(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  amountOutMinimum: string,
  recipient: string,
  fee: number,
  deadline: number,
): {
  to: string
  data: string
  value: string
  gasLimit: string
} {
  console.log("[v0] Building swap transaction:", {
    tokenIn,
    tokenOut,
    amountIn,
    amountOutMinimum,
    recipient,
    fee,
    deadline,
  })

  const isEthSwap = tokenIn === "0x0000000000000000000000000000000000000000"

  if (isEthSwap) {
    // Encode exactInputSingle parameters
    const exactInputParams = encodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            { name: "tokenIn", type: "address" },
            { name: "tokenOut", type: "address" },
            { name: "fee", type: "uint24" },
            { name: "recipient", type: "address" },
            { name: "deadline", type: "uint256" },
            { name: "amountIn", type: "uint256" },
            { name: "amountOutMinimum", type: "uint256" },
            { name: "sqrtPriceLimitX96", type: "uint160" },
          ],
        },
      ],
      [
        {
          tokenIn: UNISWAP_V3_ADDRESSES.WETH as `0x${string}`,
          tokenOut: tokenOut as `0x${string}`,
          fee,
          recipient: recipient as `0x${string}`,
          deadline: BigInt(deadline),
          amountIn: BigInt(amountIn),
          amountOutMinimum: BigInt(amountOutMinimum),
          sqrtPriceLimitX96: BigInt(0),
        },
      ],
    )

    const exactInputSelector = "0x414bf389" // exactInputSingle
    const exactInputCall = exactInputSelector + exactInputParams.slice(2)

    // refundETH function selector (no parameters)
    const refundETHSelector = "0x12210e8a"

    // Encode multicall with both calls
    const multicallParams = encodeAbiParameters(
      [{ type: "bytes[]" }],
      [[exactInputCall as `0x${string}`, refundETHSelector as `0x${string}`]],
    )

    const multicallSelector = "0xac9650d8" // multicall(bytes[])
    const data = multicallSelector + multicallParams.slice(2)

    return {
      to: UNISWAP_V3_ADDRESSES.SWAP_ROUTER,
      data,
      value: amountIn,
      gasLimit: "0x7a120", // 500,000 gas (increased for multicall)
    }
  }

  // For token swaps, use regular exactInputSingle
  const params = encodeAbiParameters(
    [
      {
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    [
      {
        tokenIn: tokenIn as `0x${string}`,
        tokenOut: tokenOut as `0x${string}`,
        fee,
        recipient: recipient as `0x${string}`,
        deadline: BigInt(deadline),
        amountIn: BigInt(amountIn),
        amountOutMinimum: BigInt(amountOutMinimum),
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
  )

  const functionSelector = "0x414bf389" // exactInputSingle
  const data = functionSelector + params.slice(2)

  return {
    to: UNISWAP_V3_ADDRESSES.SWAP_ROUTER,
    data,
    value: "0",
    gasLimit: "0x61a80", // 400,000 gas
  }
}
