/**
 * Uniswap V4 Swap Integration for Base Chain
 * Handles swaps through V4 pools with hooks support
 *
 * Note: V4 is not yet deployed on Base mainnet as of October 2025
 * This file is prepared for when deployment occurs
 * Reference: https://docs.uniswap.org/contracts/v4/deployments
 */

import { encodeAbiParameters } from "viem"
import { rpcCall } from "./rpc-config"
import { UNISWAP_V4_ADDRESSES, isV4Available } from "./uniswap-v4"

export { UNISWAP_V4_ADDRESSES } from "./uniswap-v4"

export interface PoolKey {
  currency0: string
  currency1: string
  fee: number
  tickSpacing: number
  hooks: string
}

export interface SwapParams {
  zeroForOne: boolean
  amountSpecified: bigint
  sqrtPriceLimitX96: bigint
}

/**
 * Get a swap quote from Uniswap V4 pool
 */
export async function getV4SwapQuote(
  poolKey: PoolKey,
  amountIn: string,
  zeroForOne: boolean,
): Promise<{
  amountOut: string
  gasEstimate: string
  priceImpact: number
} | null> {
  try {
    if (!isV4Available()) {
      console.log("[v0] Uniswap V4 not yet deployed on Base mainnet")
      return null
    }

    console.log("[v0] Getting V4 swap quote:", { poolKey, amountIn, zeroForOne })

    // Encode the pool key
    const poolKeyEncoded = encodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            { name: "currency0", type: "address" },
            { name: "currency1", type: "address" },
            { name: "fee", type: "uint24" },
            { name: "tickSpacing", type: "int24" },
            { name: "hooks", type: "address" },
          ],
        },
      ],
      [
        {
          currency0: poolKey.currency0 as `0x${string}`,
          currency1: poolKey.currency1 as `0x${string}`,
          fee: poolKey.fee,
          tickSpacing: poolKey.tickSpacing,
          hooks: poolKey.hooks as `0x${string}`,
        },
      ],
    )

    // Encode swap params
    const swapParams = encodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            { name: "zeroForOne", type: "bool" },
            { name: "amountSpecified", type: "int256" },
            { name: "sqrtPriceLimitX96", type: "uint160" },
          ],
        },
      ],
      [
        {
          zeroForOne,
          amountSpecified: BigInt(amountIn),
          sqrtPriceLimitX96: BigInt(0),
        },
      ],
    )

    // Call the quoter
    const params = encodeAbiParameters([{ type: "bytes" }, { type: "bytes" }], [poolKeyEncoded, swapParams])

    const functionSelector = "0x23a69e75" // quoteExactInputSingle(bytes,bytes)
    const callData = functionSelector + params.slice(2)

    const result = await rpcCall("eth_call", [
      {
        to: UNISWAP_V4_ADDRESSES.QUOTER,
        data: callData,
      },
      "latest",
    ])

    // Decode the result
    const amountOut = BigInt("0x" + result.slice(2, 66))
    const gasEstimate = BigInt(300000) // Estimate for V4 swaps

    console.log("[v0] V4 quote received:", {
      amountOut: amountOut.toString(),
      gasEstimate: gasEstimate.toString(),
    })

    return {
      amountOut: amountOut.toString(),
      gasEstimate: gasEstimate.toString(),
      priceImpact: 0,
    }
  } catch (error) {
    console.error("[v0] Error getting V4 swap quote:", error)
    return null
  }
}

/**
 * Build V4 swap transaction using Universal Router
 */
export function buildV4SwapTransaction(
  poolKey: PoolKey,
  amountIn: string,
  amountOutMinimum: string,
  recipient: string,
  zeroForOne: boolean,
  deadline: number,
): {
  to: string
  data: string
  value: string
  gasLimit: string
} {
  console.log("[v0] Building V4 swap transaction:", {
    poolKey,
    amountIn,
    amountOutMinimum,
    recipient,
    zeroForOne,
    deadline,
  })

  // Determine if this is an ETH swap
  const isEthSwap =
    poolKey.currency0 === "0x0000000000000000000000000000000000000000" ||
    poolKey.currency0.toLowerCase() === UNISWAP_V4_ADDRESSES.WETH.toLowerCase()

  // Universal Router V4 commands
  // WRAP_ETH = 0x0b, V4_SWAP = 0x10
  const commands = isEthSwap ? "0x0b10" : "0x10"

  // Encode pool key
  const poolKeyEncoded = encodeAbiParameters(
    [
      {
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
    ],
    [
      {
        currency0: poolKey.currency0 as `0x${string}`,
        currency1: poolKey.currency1 as `0x${string}`,
        fee: poolKey.fee,
        tickSpacing: poolKey.tickSpacing,
        hooks: poolKey.hooks as `0x${string}`,
      },
    ],
  )

  // Encode swap params
  const swapParams = encodeAbiParameters(
    [
      {
        type: "tuple",
        components: [
          { name: "zeroForOne", type: "bool" },
          { name: "amountSpecified", type: "int256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    [
      {
        zeroForOne,
        amountSpecified: BigInt(amountIn),
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
  )

  const inputs: `0x${string}`[] = []

  if (isEthSwap) {
    // WRAP_ETH input
    const ADDRESS_THIS = "0x0000000000000000000000000000000000000002"
    const wrapEthInput = encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }],
      [ADDRESS_THIS as `0x${string}`, BigInt(amountIn)],
    )
    inputs.push(wrapEthInput)
  }

  // V4_SWAP input: poolKey, swapParams, recipient, amountOutMinimum
  const swapInput = encodeAbiParameters(
    [{ type: "bytes" }, { type: "bytes" }, { type: "address" }, { type: "uint256" }],
    [poolKeyEncoded, swapParams, recipient as `0x${string}`, BigInt(amountOutMinimum)],
  )
  inputs.push(swapInput)

  // Encode the execute function call
  const executeParams = encodeAbiParameters(
    [{ type: "bytes" }, { type: "bytes[]" }, { type: "uint256" }],
    [commands as `0x${string}`, inputs, BigInt(deadline)],
  )

  const functionSelector = "0x3593564c" // execute(bytes,bytes[],uint256)
  const data = functionSelector + executeParams.slice(2)

  console.log("[v0] V4 Universal Router transaction data:", {
    to: UNISWAP_V4_ADDRESSES.UNIVERSAL_ROUTER,
    commands,
    inputsCount: inputs.length,
    value: isEthSwap ? amountIn : "0",
  })

  return {
    to: UNISWAP_V4_ADDRESSES.UNIVERSAL_ROUTER,
    data,
    value: isEthSwap ? amountIn : "0",
    gasLimit: "0x61a80", // 400,000 gas
  }
}
