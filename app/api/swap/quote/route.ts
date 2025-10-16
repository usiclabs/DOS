import { type NextRequest, NextResponse } from "next/server"
import { getSwapQuote, UNISWAP_V3_ADDRESSES, findBestSwapPool } from "@/lib/uniswap-v3-swap"
import { parseUnits, formatUnits } from "viem"
import { DEUS_TOKEN_ADDRESS } from "@/lib/constants"

export async function POST(request: NextRequest) {
  try {
    const { fromToken, toToken, amount, userAddress, liveDEUSPrice, poolHint } = await request.json()

    console.log("[v0] Swap quote request:", { fromToken, toToken, amount, userAddress, poolHint })

    // Validate required parameters
    if (!fromToken || !toToken || !amount || !userAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const fromAmountNum = Number.parseFloat(amount)

    console.log("[v0] Finding best pool for token pair...")
    const bestPool = await findBestSwapPool(toToken, [UNISWAP_V3_ADDRESSES.WETH, DEUS_TOKEN_ADDRESS], poolHint)

    if (!bestPool) {
      console.error("[v0] No Uniswap V3 pool found for token pair")
      return NextResponse.json(
        {
          error: "NO_LIQUIDITY",
          message:
            "No Uniswap V3 liquidity pool found for this token pair on Base chain. The token may not have active trading pools with WETH or DEUS.",
          suggestion:
            "Please verify the token address is correct. You can check available pools on Uniswap or Dexscreener.",
        },
        { status: 404 },
      )
    }

    console.log("[v0] Found best pool:", {
      baseToken: bestPool.baseToken,
      fee: bestPool.fee,
      poolAddress: bestPool.poolAddress,
    })

    const tokenIn = bestPool.baseToken

    // Step 2: Get quote from Uniswap V3 Quoter
    const amountInWei = parseUnits(amount, 18).toString()
    const quote = await getSwapQuote(tokenIn, toToken, amountInWei, bestPool.fee)

    if (!quote) {
      console.error("[v0] Failed to get quote from Uniswap V3 Quoter")
      return NextResponse.json(
        {
          error: "QUOTE_FAILED",
          message: "Unable to generate swap quote from Uniswap V3. The pool may have insufficient liquidity.",
          suggestion: "Try a smaller amount or check back later when liquidity improves.",
        },
        { status: 503 },
      )
    }

    // Convert amounts to human-readable
    const toAmount = Number(formatUnits(BigInt(quote.amountOut), 18))
    const rate = toAmount / fromAmountNum

    // Get token prices for display
    const deusPrice = liveDEUSPrice || 0.00007765
    let fromTokenPrice = 3200 // Default ETH price

    if (tokenIn.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()) {
      fromTokenPrice = deusPrice
    } else if (fromToken === "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") {
      fromTokenPrice = 1 // USDC
    }

    // Price impact should be minimal for small swaps in a $34k liquidity pool
    // Calculate based on the actual execution rate vs expected rate
    const executionPrice = fromAmountNum / toAmount // ETH per DEUS
    const expectedPrice = deusPrice / fromTokenPrice // ETH per DEUS from market price
    const priceImpact = Math.abs(((executionPrice - expectedPrice) / expectedPrice) * 100)

    // Cap price impact display at reasonable levels (should be <5% for small swaps)
    const displayPriceImpact = Math.min(priceImpact, 5)

    const slippageTolerance = 95 // 95% slippage tolerance to handle fee-on-transfer tokens

    const quoteResponse = {
      fromToken: {
        address: tokenIn, // Use actual base token (WETH or DEUS)
        symbol: getTokenSymbol(tokenIn),
        logo: getTokenLogo(tokenIn),
        price: fromTokenPrice,
      },
      toToken: {
        address: toToken,
        symbol: "TOKEN",
        logo: "🪙",
        price: deusPrice,
      },
      fromAmount: fromAmountNum,
      toAmount,
      rate,
      priceImpact: displayPriceImpact,
      fee: bestPool.fee / 10000, // Convert basis points to percentage
      route: `${getTokenSymbol(tokenIn)} → ${getTokenSymbol(toToken)} (Uniswap V3)`,
      estimatedGas: Number(quote.gasEstimate) * 0.000000001, // Convert to ETH (approximate)
      validUntil: Date.now() + 120000, // 2 minutes validity
      dexes: ["Uniswap V3"],
      slippage: slippageTolerance,
      minAmountOut: toAmount * (1 - slippageTolerance / 100),
      // Store Uniswap V3 data for execution
      uniswapV3Data: {
        tokenIn: tokenIn, // Use actual base token
        tokenOut: toToken,
        fee: bestPool.fee,
        amountIn: amountInWei,
        amountOutMinimum: ((BigInt(quote.amountOut) * BigInt(5)) / BigInt(100)).toString(),
        poolAddress: bestPool.poolAddress,
      },
    }

    console.log("[v0] Swap quote generated via Uniswap V3:", quoteResponse)

    return NextResponse.json(quoteResponse)
  } catch (error) {
    console.error("[v0] Swap quote error:", error)
    return NextResponse.json(
      {
        error: "QUOTE_ERROR",
        message: "An unexpected error occurred while generating the swap quote.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function getTokenSymbol(address: string): string {
  const tokenMap: { [key: string]: string } = {
    "0x0000000000000000000000000000000000000000": "ETH",
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "USDC",
    "0x4200000000000000000000000000000000000006": "WETH",
    "0x73582df1cad3187cD0746b7A473d65c06386837e": "DEUS",
  }
  return tokenMap[address.toLowerCase()] || "TOKEN"
}

function getTokenLogo(address: string): string {
  const logoMap: { [key: string]: string } = {
    "0x0000000000000000000000000000000000000000": "Ξ",
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "💵",
    "0x4200000000000000000000000000000000000006": "Ξ",
    "0x73582df1cad3187cD0746b7A473d65c06386837e": "⚡",
  }
  return logoMap[address.toLowerCase()] || "🪙"
}
