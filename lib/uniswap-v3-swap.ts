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
  UNIVERSAL_ROUTER: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
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

export const ZORA_TOKEN_ADDRESS = "0x1111111111166b7FE7bd91427724B487980aFc69" as const

/**
 * Detect which fee tier has a pool for the given token pair
 * Returns the pool with the highest liquidity
 */
export async function detectPoolFeeTier(
  tokenA: string,
  tokenB: string,
): Promise<{ fee: number; poolAddress: string } | null> {
  console.log("[v0] Detecting pool fee tier for:", { tokenA, tokenB })

  const MIN_LIQUIDITY = BigInt("100000000000000") // 0.0001 ETH worth of liquidity minimum

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

          if (liquidity >= MIN_LIQUIDITY) {
            pools.push({ fee, poolAddress, liquidity })
          } else {
            console.log(`[v0] Skipping pool with insufficient liquidity: ${liquidity.toString()}`)
          }
        } catch (error) {
          console.error(`[v0] Error getting liquidity for pool ${poolAddress}:`, error)
        }
      }
    } catch (error) {
      console.error(`[v0] Error checking fee tier ${fee}:`, error)
    }
  }

  if (pools.length === 0) {
    console.log("[v0] No pool with sufficient liquidity found for token pair")
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
 * Find the best pool for swapping to a target token
 * Tries multiple base tokens (WETH, DEUS) and returns the pool with best liquidity
 * Optionally accepts a poolHint from Dexscreener to validate and use if it has sufficient liquidity
 */
export async function findBestSwapPool(
  targetToken: string,
  baseTokens: string[] = [UNISWAP_V3_ADDRESSES.WETH, "0x73582df1cad3187cD0746b7A473d65c06386837e"], // WETH and DEUS
  poolHint?: string,
): Promise<{ baseToken: string; fee: number; poolAddress: string } | null> {
  console.log("[v0] Finding best swap pool for target token:", targetToken)
  console.log("[v0] Checking base tokens:", baseTokens)

  if (poolHint && poolHint !== "0x0000000000000000000000000000000000000000") {
    console.log("[v0] Validating pool hint from Dexscreener:", poolHint)
    try {
      // First, try to verify this is actually a Uniswap V3 pool by checking if it matches factory pools
      let isValidUniswapV3Pool = false
      let matchedBaseToken: string | null = null
      let matchedFee: number | null = null

      for (const baseToken of baseTokens) {
        for (const fee of FEE_TIERS) {
          try {
            const data = encodeAbiParameters(
              [{ type: "address" }, { type: "address" }, { type: "uint24" }],
              [baseToken as `0x${string}`, targetToken as `0x${string}`, fee],
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

            const poolAddress = "0x" + result.slice(-40)

            if (poolAddress.toLowerCase() === poolHint.toLowerCase()) {
              isValidUniswapV3Pool = true
              matchedBaseToken = baseToken
              matchedFee = fee
              console.log("[v0] Pool hint is a valid Uniswap V3 pool:", { baseToken, fee, poolAddress })
              break
            }
          } catch (error) {
            // Continue checking other combinations
          }
        }
        if (isValidUniswapV3Pool) break
      }

      if (isValidUniswapV3Pool && matchedBaseToken && matchedFee !== null) {
        // Now check liquidity
        try {
          const liquidityResult = await rpcCall("eth_call", [
            {
              to: poolHint,
              data: "0x1a686502", // liquidity()
            },
            "latest",
          ])

          const liquidity = BigInt(liquidityResult)
          const MIN_LIQUIDITY = BigInt("100000000000000") // 0.0001 ETH worth

          if (liquidity >= MIN_LIQUIDITY) {
            console.log("[v0] Pool hint has sufficient liquidity:", liquidity.toString())
            return { baseToken: matchedBaseToken, fee: matchedFee, poolAddress: poolHint }
          } else {
            console.log("[v0] Pool hint has insufficient liquidity:", liquidity.toString())
          }
        } catch (error) {
          console.log("[v0] Failed to check pool hint liquidity:", error)
        }
      } else {
        console.log("[v0] Pool hint is not a Uniswap V3 pool (likely Aerodrome or other DEX), skipping hint")
      }
    } catch (error) {
      console.log("[v0] Pool hint validation failed:", error)
    }
  }

  const poolResults: Array<{ baseToken: string; fee: number; poolAddress: string; liquidity: bigint }> = []

  for (const baseToken of baseTokens) {
    console.log(`[v0] Checking ${baseToken} / ${targetToken} pools...`)
    try {
      const poolInfo = await detectPoolFeeTier(baseToken, targetToken)

      if (poolInfo) {
        // Get liquidity for comparison
        try {
          const liquidityResult = await rpcCall("eth_call", [
            {
              to: poolInfo.poolAddress,
              data: "0x1a686502", // liquidity()
            },
            "latest",
          ])

          const liquidity = BigInt(liquidityResult)
          poolResults.push({
            baseToken,
            fee: poolInfo.fee,
            poolAddress: poolInfo.poolAddress,
            liquidity,
          })

          console.log(`[v0] Found pool for ${baseToken}:`, {
            fee: poolInfo.fee,
            poolAddress: poolInfo.poolAddress,
            liquidity: liquidity.toString(),
          })
        } catch (error) {
          console.error(`[v0] Error getting liquidity for pool ${poolInfo.poolAddress}:`, error)
        }
      }
    } catch (error) {
      console.error(`[v0] Error detecting pools for ${baseToken}:`, error)
    }
  }

  if (poolResults.length === 0) {
    console.log("[v0] No pools found for any base token")
    return null
  }

  // Select pool with best liquidity
  const bestPool = poolResults.reduce((best, current) => (current.liquidity > best.liquidity ? current : best))

  console.log("[v0] Selected best pool:", {
    baseToken: bestPool.baseToken,
    fee: bestPool.fee,
    poolAddress: bestPool.poolAddress,
    liquidity: bestPool.liquidity.toString(),
  })

  return {
    baseToken: bestPool.baseToken,
    fee: bestPool.fee,
    poolAddress: bestPool.poolAddress,
  }
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
 * Get a swap quote for multi-hop swap (ETH → ZORA → Target Token)
 */
export async function getMultiHopSwapQuote(
  tokenIn: string,
  intermediateToken: string,
  tokenOut: string,
  amountIn: string,
  fee1: number,
  fee2: number,
): Promise<{
  amountOut: string
  gasEstimate: string
  priceImpact: number
} | null> {
  try {
    console.log("[v0] Getting multi-hop swap quote:", {
      tokenIn,
      intermediateToken,
      tokenOut,
      amountIn,
      fee1,
      fee2,
    })

    // Encode path: tokenIn + fee1 + intermediateToken + fee2 + tokenOut
    const tokenInAddress = tokenIn.slice(2).toLowerCase()
    const intermediateAddress = intermediateToken.slice(2).toLowerCase()
    const tokenOutAddress = tokenOut.slice(2).toLowerCase()
    const fee1Hex = fee1.toString(16).padStart(6, "0")
    const fee2Hex = fee2.toString(16).padStart(6, "0")
    const path = `0x${tokenInAddress}${fee1Hex}${intermediateAddress}${fee2Hex}${tokenOutAddress}` as `0x${string}`

    console.log("[v0] Encoded multi-hop path:", path)

    // Use quoteExactInput for multi-hop
    const params = encodeAbiParameters([{ type: "bytes" }, { type: "uint256" }], [path, BigInt(amountIn)])

    const functionSelector = "0xcdca1753" // quoteExactInput(bytes,uint256)
    const callData = functionSelector + params.slice(2)

    const result = await rpcCall("eth_call", [
      {
        to: UNISWAP_V3_ADDRESSES.QUOTER_V2,
        data: callData,
      },
      "latest",
    ])

    // Decode the result (amountOut, sqrtPriceX96AfterList, initializedTicksCrossedList, gasEstimate)
    const amountOut = BigInt("0x" + result.slice(2, 66))
    const gasEstimate = BigInt("0x" + result.slice(194, 258))

    console.log("[v0] Multi-hop quote received:", {
      amountOut: amountOut.toString(),
      gasEstimate: gasEstimate.toString(),
    })

    return {
      amountOut: amountOut.toString(),
      gasEstimate: gasEstimate.toString(),
      priceImpact: 0,
    }
  } catch (error) {
    console.error("[v0] Error getting multi-hop swap quote:", error)
    return null
  }
}

/**
 * Build swap transaction data for Uniswap V3 SwapRouter or Universal Router
 * Uses command-based system for ETH swaps
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

  const isEthSwap =
    tokenIn === "0x0000000000000000000000000000000000000000" ||
    tokenIn.toLowerCase() === UNISWAP_V3_ADDRESSES.WETH.toLowerCase()

  if (isEthSwap) {
    // Universal Router commands: WRAP_ETH = 0x0b, V3_SWAP_EXACT_IN = 0x00
    const commands = "0x0b00" // WRAP_ETH followed by V3_SWAP_EXACT_IN

    // Encode path for V3 swap: tokenIn (WETH) + fee + tokenOut
    const tokenInAddress = UNISWAP_V3_ADDRESSES.WETH.slice(2).toLowerCase()
    const tokenOutAddress = tokenOut.slice(2).toLowerCase()
    const feeHex = fee.toString(16).padStart(6, "0")
    const path = `0x${tokenInAddress}${feeHex}${tokenOutAddress}` as `0x${string}`

    console.log("[v0] Encoded path for Universal Router:", {
      tokenIn: UNISWAP_V3_ADDRESSES.WETH,
      fee,
      feeHex,
      tokenOut,
      path,
    })

    // Parameters: recipient (address), amountMin (uint256)
    // Recipient should be the Universal Router itself (ADDRESS_THIS = 0x0000000000000000000000000000000000000002)
    const ADDRESS_THIS = "0x0000000000000000000000000000000000000002"
    const wrapEthInput = encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }],
      [ADDRESS_THIS as `0x${string}`, BigInt(amountIn)],
    )

    // Parameters: recipient, amountIn, amountOutMin, path, payerIsUser
    // payerIsUser should be false because WETH is coming from the router (from WRAP_ETH command)
    const swapInput = encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }, { type: "uint256" }, { type: "bytes" }, { type: "bool" }],
      [recipient as `0x${string}`, BigInt(amountIn), BigInt(amountOutMinimum), path, false],
    )

    // Encode the execute function call: execute(bytes commands, bytes[] inputs, uint256 deadline)
    const executeParams = encodeAbiParameters(
      [{ type: "bytes" }, { type: "bytes[]" }, { type: "uint256" }],
      [commands as `0x${string}`, [wrapEthInput, swapInput], BigInt(deadline)],
    )

    const functionSelector = "0x3593564c" // execute(bytes,bytes[],uint256)
    const data = functionSelector + executeParams.slice(2)

    console.log("[v0] Universal Router transaction data:", {
      to: UNISWAP_V3_ADDRESSES.UNIVERSAL_ROUTER,
      commands,
      inputsCount: 2,
      dataLength: data.length,
      value: amountIn,
    })

    return {
      to: UNISWAP_V3_ADDRESSES.UNIVERSAL_ROUTER,
      data,
      value: amountIn,
      gasLimit: "0x61a80", // 400,000 gas
    }
  }

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

  console.log("[v0] SwapRouter transaction data:", {
    to: UNISWAP_V3_ADDRESSES.SWAP_ROUTER,
    tokenIn,
    tokenOut,
    fee,
    value: "0",
  })

  return {
    to: UNISWAP_V3_ADDRESSES.SWAP_ROUTER,
    data,
    value: "0",
    gasLimit: "0x61a80", // 400,000 gas
  }
}

/**
 * Build multi-hop swap transaction (ETH → ZORA → Target Token)
 */
export function buildMultiHopSwapTransaction(
  tokenIn: string,
  intermediateToken: string,
  tokenOut: string,
  amountIn: string,
  amountOutMinimum: string,
  recipient: string,
  fee1: number,
  fee2: number,
  deadline: number,
): {
  to: string
  data: string
  value: string
  gasLimit: string
} {
  console.log("[v0] Building multi-hop swap transaction:", {
    tokenIn,
    intermediateToken,
    tokenOut,
    amountIn,
    amountOutMinimum,
    recipient,
    fee1,
    fee2,
    deadline,
  })

  const isEthSwap =
    tokenIn === "0x0000000000000000000000000000000000000000" ||
    tokenIn.toLowerCase() === UNISWAP_V3_ADDRESSES.WETH.toLowerCase()

  if (isEthSwap) {
    // Universal Router commands: WRAP_ETH = 0x0b, V3_SWAP_EXACT_IN = 0x00
    const commands = "0x0b00" // WRAP_ETH followed by V3_SWAP_EXACT_IN

    // Encode path for multi-hop V3 swap: WETH + fee1 + ZORA + fee2 + CreatorToken
    const wethAddress = UNISWAP_V3_ADDRESSES.WETH.slice(2).toLowerCase()
    const intermediateAddress = intermediateToken.slice(2).toLowerCase()
    const tokenOutAddress = tokenOut.slice(2).toLowerCase()
    const fee1Hex = fee1.toString(16).padStart(6, "0")
    const fee2Hex = fee2.toString(16).padStart(6, "0")
    const path = `0x${wethAddress}${fee1Hex}${intermediateAddress}${fee2Hex}${tokenOutAddress}` as `0x${string}`

    console.log("[v0] Encoded multi-hop path for Universal Router:", {
      tokenIn: UNISWAP_V3_ADDRESSES.WETH,
      fee1,
      intermediateToken,
      fee2,
      tokenOut,
      path,
    })

    // WRAP_ETH parameters: recipient (ADDRESS_THIS), amountMin
    const ADDRESS_THIS = "0x0000000000000000000000000000000000000002"
    const wrapEthInput = encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }],
      [ADDRESS_THIS as `0x${string}`, BigInt(amountIn)],
    )

    // V3_SWAP_EXACT_IN parameters: recipient, amountIn, amountOutMin, path, payerIsUser
    const swapInput = encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }, { type: "uint256" }, { type: "bytes" }, { type: "bool" }],
      [recipient as `0x${string}`, BigInt(amountIn), BigInt(amountOutMinimum), path, false],
    )

    // Encode the execute function call
    const executeParams = encodeAbiParameters(
      [{ type: "bytes" }, { type: "bytes[]" }, { type: "uint256" }],
      [commands as `0x${string}`, [wrapEthInput, swapInput], BigInt(deadline)],
    )

    const functionSelector = "0x3593564c" // execute(bytes,bytes[],uint256)
    const data = functionSelector + executeParams.slice(2)

    console.log("[v0] Multi-hop Universal Router transaction data:", {
      to: UNISWAP_V3_ADDRESSES.UNIVERSAL_ROUTER,
      commands,
      inputsCount: 2,
      dataLength: data.length,
      value: amountIn,
    })

    return {
      to: UNISWAP_V3_ADDRESSES.UNIVERSAL_ROUTER,
      data,
      value: amountIn,
      gasLimit: "0x7A120", // 500,000 gas (higher for multi-hop)
    }
  }

  // For non-ETH swaps, use SwapRouter's exactInput function
  const tokenInAddress = tokenIn.slice(2).toLowerCase()
  const intermediateAddress = intermediateToken.slice(2).toLowerCase()
  const tokenOutAddress = tokenOut.slice(2).toLowerCase()
  const fee1Hex = fee1.toString(16).padStart(6, "0")
  const fee2Hex = fee2.toString(16).padStart(6, "0")
  const path = `0x${tokenInAddress}${fee1Hex}${intermediateAddress}${fee2Hex}${tokenOutAddress}` as `0x${string}`

  const params = encodeAbiParameters(
    [
      {
        type: "tuple",
        components: [
          { name: "path", type: "bytes" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
        ],
      },
    ],
    [
      {
        path,
        recipient: recipient as `0x${string}`,
        deadline: BigInt(deadline),
        amountIn: BigInt(amountIn),
        amountOutMinimum: BigInt(amountOutMinimum),
      },
    ],
  )

  const functionSelector = "0xc04b8d59" // exactInput
  const data = functionSelector + params.slice(2)

  return {
    to: UNISWAP_V3_ADDRESSES.SWAP_ROUTER,
    data,
    value: "0",
    gasLimit: "0x7A120", // 500,000 gas
  }
}
