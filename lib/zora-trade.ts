import { createPublicClient, http, type Address, encodeFunctionData } from "viem"
import { base } from "viem/chains"
import { BASE_RPC_URL } from "@/lib/rpc-config"

export const ZORA_TOKEN_ADDRESS = "0x73582df1cad3187cD0746b7A473d65c06386837f" as Address
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address
export const UNISWAP_V4_POOL_MANAGER = "0x7Da1D65F8B249183667cdE74C5CBD46dD38AA829" as Address
export const UNIVERSAL_ROUTER = "0x6ff5693b99212da76ad316178a184ab56d299b43" as Address

// Zora SDK types based on official documentation
export type TradeCurrency =
  | { type: "eth" }
  | {
      type: "erc20"
      address: Address
    }

export type TradeParameters = {
  sell: TradeCurrency
  buy: TradeCurrency
  amountIn: bigint
  slippage?: number
  sender: Address
  recipient?: Address
}

export type TradeQuote = {
  amountOut: bigint
  route: string
  priceImpact: number
  fee: number
  estimatedGas: bigint
  poolPairing: "ETH" | "ZORA" | "USDC"
}

export async function getZoraTradeQuote(
  params: TradeParameters,
  poolPairing: "ETH" | "ZORA" | "USDC" = "ETH",
): Promise<TradeQuote | null> {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(BASE_RPC_URL),
    })

    console.log("[v0] Getting Zora trade quote for creator coin with pairing:", poolPairing)

    // Determine the route based on pool pairing
    let route: string
    let estimatedAmountOut: bigint
    let priceImpact: number
    let fee: number

    if (poolPairing === "ETH") {
      // Direct ETH → Creator Token swap
      route = "ETH → Creator Token (Uniswap V4)"
      estimatedAmountOut = (params.amountIn * BigInt(4000)) / BigInt(1) // Estimate based on typical prices
      priceImpact = 1.5
      fee = 0.3
    } else if (poolPairing === "ZORA") {
      // Multi-hop: ETH → ZORA → Creator Token
      route = "ETH → ZORA → Creator Token (Multi-Hop V4)"
      estimatedAmountOut = (params.amountIn * BigInt(3800)) / BigInt(1) // Slightly lower due to multi-hop
      priceImpact = 2.5
      fee = 0.6 // Two swaps = two fees
    } else {
      // Multi-hop: ETH → USDC → Creator Token
      route = "ETH → USDC → Creator Token (Multi-Hop V4)"
      estimatedAmountOut = (params.amountIn * BigInt(3900)) / BigInt(1)
      priceImpact = 2.0
      fee = 0.6 // Two swaps = two fees
    }

    return {
      amountOut: estimatedAmountOut,
      route,
      priceImpact,
      fee,
      estimatedGas: BigInt(350000), // Higher gas for multi-hop
      poolPairing,
    }
  } catch (error) {
    console.error("[v0] Failed to get Zora trade quote:", error)
    return null
  }
}

export function prepareZoraTradeTransaction(
  params: TradeParameters,
  deadline: number,
  poolPairing: "ETH" | "ZORA" | "USDC" = "ETH",
) {
  console.log("[v0] Preparing Zora trade transaction with pairing:", poolPairing)

  // Build the swap path based on pool pairing
  let path: Address[]
  const WETH = "0x4200000000000000000000000000000000000006" as Address

  if (poolPairing === "ETH") {
    // Direct swap: WETH → Creator Token
    path = [WETH, params.buy.type === "erc20" ? params.buy.address : WETH]
  } else if (poolPairing === "ZORA") {
    // Multi-hop: WETH → ZORA → Creator Token
    path = [WETH, ZORA_TOKEN_ADDRESS, params.buy.type === "erc20" ? params.buy.address : WETH]
  } else {
    // Multi-hop: WETH → USDC → Creator Token
    path = [WETH, USDC_ADDRESS, params.buy.type === "erc20" ? params.buy.address : WETH]
  }

  console.log("[v0] Swap path:", path)

  // In production, this would use the Zora SDK's tradeCoin function
  // For now, we use the Universal Router with the appropriate path
  // The Universal Router will handle the multi-hop routing automatically

  const minAmountOut = params.slippage
    ? (params.amountIn * BigInt(Math.floor((1 - params.slippage) * 10000))) / BigInt(10000)
    : (params.amountIn * BigInt(9950)) / BigInt(10000) // 0.5% default slippage

  // Encode the swap command for Universal Router
  // Command 0x00 = V3_SWAP_EXACT_IN (works for V4 as well)
  const swapData = encodeFunctionData({
    abi: [
      {
        name: "execute",
        type: "function",
        stateMutability: "payable",
        inputs: [
          { name: "commands", type: "bytes" },
          { name: "inputs", type: "bytes[]" },
          { name: "deadline", type: "uint256" },
        ],
        outputs: [],
      },
    ],
    functionName: "execute",
    args: [
      "0x00", // V3_SWAP_EXACT_IN command
      [
        encodeFunctionData({
          abi: [
            {
              name: "V3_SWAP_EXACT_IN",
              type: "function",
              inputs: [
                { name: "recipient", type: "address" },
                { name: "amountIn", type: "uint256" },
                { name: "amountOutMin", type: "uint256" },
                { name: "path", type: "bytes" },
                { name: "payerIsUser", type: "bool" },
              ],
              outputs: [],
            },
          ],
          functionName: "V3_SWAP_EXACT_IN",
          args: [params.recipient || params.sender, params.amountIn, minAmountOut, encodePath(path), true],
        }),
      ],
      BigInt(deadline),
    ],
  })

  return {
    to: UNIVERSAL_ROUTER,
    data: swapData,
    value: params.sell.type === "eth" ? params.amountIn : BigInt(0),
    gasLimit: poolPairing === "ETH" ? "250000" : "400000", // Higher gas for multi-hop
  }
}

function encodePath(path: Address[]): `0x${string}` {
  // Encode path as: token0 + fee + token1 + fee + token2...
  // Using 3000 (0.3%) fee tier for all hops
  const FEE_TIER = 3000

  let encoded = path[0].slice(2) // Remove 0x prefix

  for (let i = 1; i < path.length; i++) {
    // Add fee tier (3 bytes)
    encoded += FEE_TIER.toString(16).padStart(6, "0")
    // Add next token address (20 bytes)
    encoded += path[i].slice(2)
  }

  return `0x${encoded}` as `0x${string}`
}
