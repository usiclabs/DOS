import { type NextRequest, NextResponse } from "next/server"
import {
  getSwapQuote,
  getMultiHopSwapQuote,
  UNISWAP_V3_ADDRESSES,
  findBestSwapPool,
  detectPoolFeeTier,
  ZORA_TOKEN_ADDRESS,
} from "@/lib/uniswap-v3-swap"
import { getV4SwapQuote, type PoolKey } from "@/lib/uniswap-v4-swap"
import { parseUnits, formatUnits } from "viem"

export async function POST(request: NextRequest) {
  try {
    const { fromToken, toToken, amount, userAddress, liveDEUSPrice, poolHint, uniswapV4PoolKey } = await request.json()

    console.log("[v0] Swap quote request:", { fromToken, toToken, amount, userAddress, poolHint, uniswapV4PoolKey })

    // Validate required parameters
    if (!fromToken || !toToken || !amount || !userAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const fromAmountNum = Number.parseFloat(amount)
    const amountInWei = parseUnits(amount, 18).toString()

    if (uniswapV4PoolKey) {
      console.log("[v0] Using Uniswap V4 pool for Zora creator coin:", uniswapV4PoolKey)

      const poolKey: PoolKey = {
        currency0: uniswapV4PoolKey.token0Address,
        currency1: uniswapV4PoolKey.token1Address,
        fee: uniswapV4PoolKey.fee,
        tickSpacing: uniswapV4PoolKey.tickSpacing,
        hooks: uniswapV4PoolKey.hookAddress,
      }

      // Determine swap direction (zeroForOne)
      // If fromToken is ETH/WETH, we need to check which token is currency0
      const isEthSwap =
        fromToken === "0x0000000000000000000000000000000000000000" ||
        fromToken.toLowerCase() === UNISWAP_V3_ADDRESSES.WETH.toLowerCase()

      // Determine if we're swapping from currency0 to currency1 or vice versa
      const zeroForOne = isEthSwap
        ? poolKey.currency0.toLowerCase() === UNISWAP_V3_ADDRESSES.WETH.toLowerCase()
        : poolKey.currency0.toLowerCase() === fromToken.toLowerCase()

      console.log("[v0] V4 swap direction:", { zeroForOne, isEthSwap })

      const v4Quote = await getV4SwapQuote(poolKey, amountInWei, zeroForOne)

      if (!v4Quote) {
        console.error("[v0] Failed to get V4 quote")
        return NextResponse.json(
          {
            error: "QUOTE_FAILED",
            message: "Unable to generate swap quote from Uniswap V4.",
            suggestion: "Try a smaller amount or check back later.",
          },
          { status: 503 },
        )
      }

      const toAmount = Number(formatUnits(BigInt(v4Quote.amountOut), 18))
      const rate = toAmount / fromAmountNum

      const quoteResponse = {
        fromToken: {
          address: isEthSwap ? UNISWAP_V3_ADDRESSES.WETH : fromToken,
          symbol: isEthSwap ? "ETH" : getTokenSymbol(fromToken),
          logo: isEthSwap ? "Ξ" : getTokenLogo(fromToken),
          price: isEthSwap ? 3200 : 0,
        },
        toToken: {
          address: toToken,
          symbol: getTokenSymbol(toToken),
          logo: getTokenLogo(toToken),
          price: 0,
        },
        fromAmount: fromAmountNum,
        toAmount,
        rate,
        priceImpact: 1,
        fee: poolKey.fee / 10000,
        route: `ETH → TOKEN (Uniswap V4)`,
        estimatedGas: Number(v4Quote.gasEstimate) * 0.000000001,
        validUntil: Date.now() + 120000,
        dexes: ["Uniswap V4"],
        slippage: 0.5,
        minAmountOut: toAmount * 0.995,
        uniswapV4Data: {
          poolKey,
          amountIn: amountInWei,
          amountOutMinimum: ((BigInt(v4Quote.amountOut) * BigInt(995)) / BigInt(1000)).toString(),
          zeroForOne,
        },
      }

      console.log("[v0] V4 swap quote generated:", quoteResponse)
      return NextResponse.json(quoteResponse)
    }

    console.log("[v0] Using Uniswap V3 for swap")
    console.log("[v0] Checking for direct ETH/WETH pool...")
    const directPool = await findBestSwapPool(toToken, [UNISWAP_V3_ADDRESSES.WETH], poolHint)

    if (directPool) {
      // Direct pool exists, use single-hop swap
      console.log("[v0] Found direct pool:", {
        baseToken: directPool.baseToken,
        fee: directPool.fee,
        poolAddress: directPool.poolAddress,
      })

      const quote = await getSwapQuote(directPool.baseToken, toToken, amountInWei, directPool.fee)

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

      const toAmount = Number(formatUnits(BigInt(quote.amountOut), 18))
      const rate = toAmount / fromAmountNum

      const quoteResponse = {
        fromToken: {
          address: UNISWAP_V3_ADDRESSES.WETH,
          symbol: "ETH",
          logo: "Ξ",
          price: 3200,
        },
        toToken: {
          address: toToken,
          symbol: getTokenSymbol(toToken),
          logo: getTokenLogo(toToken),
          price: 0,
        },
        fromAmount: fromAmountNum,
        toAmount,
        rate,
        priceImpact: 1,
        fee: directPool.fee / 10000,
        route: `ETH → TOKEN (Uniswap V3)`,
        estimatedGas: Number(quote.gasEstimate) * 0.000000001,
        validUntil: Date.now() + 120000,
        dexes: ["Uniswap V3"],
        slippage: 0.5,
        minAmountOut: toAmount * 0.995,
        uniswapV3Data: {
          tokenIn: directPool.baseToken,
          tokenOut: toToken,
          fee: directPool.fee,
          amountIn: amountInWei,
          amountOutMinimum: ((BigInt(quote.amountOut) * BigInt(995)) / BigInt(1000)).toString(),
          poolAddress: directPool.poolAddress,
          isMultiHop: false,
        },
      }

      console.log("[v0] Direct swap quote generated:", quoteResponse)
      return NextResponse.json(quoteResponse)
    }

    console.log("[v0] No direct ETH pool found, checking for multi-hop route through ZORA...")

    // Check if WETH → ZORA pool exists
    const wethToZoraPool = await detectPoolFeeTier(UNISWAP_V3_ADDRESSES.WETH, ZORA_TOKEN_ADDRESS)
    if (!wethToZoraPool) {
      console.error("[v0] No WETH → ZORA pool found")
      return NextResponse.json(
        {
          error: "NO_LIQUIDITY",
          message: "No liquidity pool found for this token pair. Cannot route through ZORA.",
          suggestion: "Please deploy liquidity for this token first.",
        },
        { status: 404 },
      )
    }

    // Check if ZORA → Target Token pool exists
    const zoraToTokenPool = await detectPoolFeeTier(ZORA_TOKEN_ADDRESS, toToken)
    if (!zoraToTokenPool) {
      console.error("[v0] No ZORA → Token pool found")
      return NextResponse.json(
        {
          error: "NO_LIQUIDITY",
          message: "No ZORA liquidity pool found for this creator token.",
          suggestion: "Please deploy liquidity for this token first.",
        },
        { status: 404 },
      )
    }

    console.log("[v0] Found multi-hop route:", {
      wethToZora: { fee: wethToZoraPool.fee, pool: wethToZoraPool.poolAddress },
      zoraToToken: { fee: zoraToTokenPool.fee, pool: zoraToTokenPool.poolAddress },
    })

    // Get multi-hop quote
    const multiHopQuote = await getMultiHopSwapQuote(
      UNISWAP_V3_ADDRESSES.WETH,
      ZORA_TOKEN_ADDRESS,
      toToken,
      amountInWei,
      wethToZoraPool.fee,
      zoraToTokenPool.fee,
    )

    if (!multiHopQuote) {
      console.error("[v0] Failed to get multi-hop quote")
      return NextResponse.json(
        {
          error: "QUOTE_FAILED",
          message: "Unable to generate multi-hop swap quote.",
          suggestion: "Try a smaller amount or check back later.",
        },
        { status: 503 },
      )
    }

    const toAmount = Number(formatUnits(BigInt(multiHopQuote.amountOut), 18))
    const rate = toAmount / fromAmountNum

    const quoteResponse = {
      fromToken: {
        address: UNISWAP_V3_ADDRESSES.WETH,
        symbol: "ETH",
        logo: "Ξ",
        price: 3200,
      },
      toToken: {
        address: toToken,
        symbol: getTokenSymbol(toToken),
        logo: getTokenLogo(toToken),
        price: 0,
      },
      fromAmount: fromAmountNum,
      toAmount,
      rate,
      priceImpact: 2,
      fee: (wethToZoraPool.fee + zoraToTokenPool.fee) / 10000,
      route: `ETH → ZORA → TOKEN (Multi-Hop)`,
      estimatedGas: Number(multiHopQuote.gasEstimate) * 0.000000001,
      validUntil: Date.now() + 120000,
      dexes: ["Uniswap V3"],
      slippage: 0.5,
      minAmountOut: toAmount * 0.995,
      uniswapV3Data: {
        tokenIn: UNISWAP_V3_ADDRESSES.WETH,
        intermediateToken: ZORA_TOKEN_ADDRESS,
        tokenOut: toToken,
        fee1: wethToZoraPool.fee,
        fee2: zoraToTokenPool.fee,
        amountIn: amountInWei,
        amountOutMinimum: ((BigInt(multiHopQuote.amountOut) * BigInt(995)) / BigInt(1000)).toString(),
        poolAddress: zoraToTokenPool.poolAddress,
        isMultiHop: true,
      },
    }

    console.log("[v0] Multi-hop swap quote generated:", quoteResponse)
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
    "0x73582df1cad3187cD0746b7A473d65c06386837f": "ZORA",
  }
  return tokenMap[address.toLowerCase()] || "TOKEN"
}

function getTokenLogo(address: string): string {
  const logoMap: { [key: string]: string } = {
    "0x0000000000000000000000000000000000000000": "Ξ",
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "💵",
    "0x4200000000000000000000000000000000000006": "Ξ",
    "0x73582df1cad3187cD0746b7A473d65c06386837e": "⚡",
    "0x73582df1cad3187cD0746b7A473d65c06386837f": "🖼️",
  }
  return logoMap[address.toLowerCase()] || "🪙"
}
