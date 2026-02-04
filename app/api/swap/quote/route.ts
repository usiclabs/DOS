import { type NextRequest, NextResponse } from "next/server"
import {
  getSwapQuote,
  getMultiHopSwapQuote,
  UNISWAP_V3_ADDRESSES,
  findBestSwapPool,
  detectPoolFeeTier,
  ZORA_TOKEN_ADDRESS,
} from "@/lib/uniswap-v3-swap"
import { parseUnits, formatUnits } from "viem"
import { getZoraTradeQuote, type TradeParameters } from "@/lib/zora-trade"
import { DEUS_TOKEN_ADDRESS } from "@/lib/constants"

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

export async function POST(request: NextRequest) {
  try {
    const { fromToken, toToken, amount, userAddress, liveDEUSPrice, poolHint, uniswapV4PoolKey } = await request.json()

    console.log("[v0] ========================================")
    console.log("[v0] 🔄 NEW SWAP QUOTE REQUEST")
    console.log("[v0] ========================================")
    console.log("[v0] Swap quote request:", { fromToken, toToken, amount, userAddress, poolHint, uniswapV4PoolKey })

    // Validate required parameters
    if (!fromToken || !toToken || !amount || !userAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const fromAmountNum = Number.parseFloat(amount)
    const amountInWei = parseUnits(amount, 18).toString()

    if (uniswapV4PoolKey) {
      console.log("[v0] Using Zora SDK for creator coin trade:", uniswapV4PoolKey)

      // Detect pool pairing from the pool key or hint
      let poolPairing: "ETH" | "ZORA" | "USDC" = "ETH"

      if (poolHint) {
        // Check if the pool uses ZORA or USDC as the quote token
        const poolData = await fetch(`https://api.dexscreener.com/latest/dex/pairs/base/${poolHint}`).then((r) =>
          r.json(),
        )
        if (poolData?.pair) {
          const quoteToken = poolData.pair.quoteToken?.symbol?.toUpperCase()
          if (quoteToken === "ZORA") poolPairing = "ZORA"
          else if (quoteToken === "USDC") poolPairing = "USDC"
        }
      }

      console.log("[v0] Detected pool pairing:", poolPairing)

      const tradeParams: TradeParameters = {
        sell: { type: "eth" },
        buy: {
          type: "erc20",
          address: toToken as `0x${string}`,
        },
        amountIn: BigInt(amountInWei),
        slippage: 0.05, // 5% slippage
        sender: userAddress as `0x${string}`,
      }

      const zoraQuote = await getZoraTradeQuote(tradeParams, poolPairing)

      if (!zoraQuote) {
        console.error("[v0] Failed to get Zora trade quote")
        return NextResponse.json(
          {
            error: "QUOTE_FAILED",
            message: "Unable to generate swap quote for this creator coin.",
            suggestion: "Try a smaller amount or check back later.",
          },
          { status: 503 },
        )
      }

      const toAmount = Number(formatUnits(zoraQuote.amountOut, 18))
      const rate = toAmount / fromAmountNum

      const quoteResponse = {
        fromToken: {
          address: "0x0000000000000000000000000000000000000000",
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
        priceImpact: zoraQuote.priceImpact,
        fee: zoraQuote.fee,
        route: zoraQuote.route,
        estimatedGas: Number(zoraQuote.estimatedGas) * 0.000000001,
        validUntil: Date.now() + 120000,
        dexes: poolPairing === "ETH" ? ["Zora Protocol"] : ["Zora Protocol (Multi-Hop)"],
        slippage: 0.5,
        minAmountOut: toAmount * 0.995,
        zoraTradeData: {
          tradeParams,
          uniswapV4PoolKey,
          poolPairing,
        },
      }

      console.log("[v0] Zora trade quote generated:", quoteResponse)
      return NextResponse.json(quoteResponse)
    }

    console.log("[v0] Using Uniswap V3 for swap")

    if (poolHint && poolHint !== "0x0000000000000000000000000000000000000000") {
      try {
        console.log("[v0] Fetching pool data from Dexscreener for hint:", poolHint)
        const poolData = await fetch(`https://api.dexscreener.com/latest/dex/pairs/base/${poolHint}`).then((r) =>
          r.json(),
        )

        if (poolData?.pair && poolData.pair.liquidity?.usd > 100) {
          console.log("[v0] Found Dexscreener pool with liquidity:", {
            dex: poolData.pair.dexId,
            liquidity: poolData.pair.liquidity.usd,
            baseToken: poolData.pair.baseToken.symbol,
            quoteToken: poolData.pair.quoteToken.symbol,
          })

          // If it's an Aerodrome or other DEX pool with good liquidity, we can still try to route through it
          // by finding a Uniswap V3 path that connects to the same tokens
          const quoteTokenAddress = poolData.pair.quoteToken.address

          // Try to find a Uniswap V3 pool with the same quote token
          if (quoteTokenAddress.toLowerCase() === UNISWAP_V3_ADDRESSES.WETH.toLowerCase()) {
            console.log("[v0] Pool uses WETH, attempting direct Uniswap V3 swap")
          }
        }
      } catch (error) {
        console.log("[v0] Failed to fetch Dexscreener pool data:", error)
      }
    }

    console.log("[v0] 🔍 Step 1: Checking for direct ETH/WETH pool...")
    const directPool = await findBestSwapPool(toToken, [UNISWAP_V3_ADDRESSES.WETH], poolHint)

    if (directPool) {
      console.log("[v0] ✅ Found direct pool:", {
        baseToken: directPool.baseToken,
        fee: directPool.fee,
        feePercent: `${directPool.fee / 10000}%`,
        poolAddress: directPool.poolAddress,
      })

      const quote = await getSwapQuote(directPool.baseToken, toToken, amountInWei, directPool.fee)

      if (!quote) {
        console.error("[v0] ❌ Failed to get quote from Uniswap V3 Quoter")
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

      console.log("[v0] ✅ Direct swap quote generated successfully!")
      console.log("[v0] Quote details:", {
        fromAmount: fromAmountNum,
        toAmount,
        rate,
        fee: `${directPool.fee / 10000}%`,
      })
      return NextResponse.json(quoteResponse)
    }

    console.log("[v0] ⚠️ No direct ETH pool found")
    console.log("[v0] 🔍 Step 2: Checking for multi-hop route through DEUS...")

    const wethToDeusPool = await detectPoolFeeTier(UNISWAP_V3_ADDRESSES.WETH, DEUS_TOKEN_ADDRESS)
    if (wethToDeusPool) {
      const deusToTokenPool = await detectPoolFeeTier(DEUS_TOKEN_ADDRESS, toToken)
      if (!deusToTokenPool) {
        // Try reversed direction
        const tokenToDeusPool = await detectPoolFeeTier(toToken, DEUS_TOKEN_ADDRESS)
        if (tokenToDeusPool) {
          console.log("[v0] Found multi-hop route through DEUS (reversed):", {
            wethToDeus: { fee: wethToDeusPool.fee, pool: wethToDeusPool.poolAddress },
            tokenToDeus: { fee: tokenToDeusPool.fee, pool: tokenToDeusPool.poolAddress },
          })

          const multiHopQuote = await getMultiHopSwapQuote(
            UNISWAP_V3_ADDRESSES.WETH,
            DEUS_TOKEN_ADDRESS,
            toToken,
            amountInWei,
            wethToDeusPool.fee,
            tokenToDeusPool.fee,
          )

          if (multiHopQuote) {
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
              fee: (wethToDeusPool.fee + tokenToDeusPool.fee) / 10000,
              route: `ETH → DEUS → TOKEN (Multi-Hop)`,
              estimatedGas: Number(multiHopQuote.gasEstimate) * 0.000000001,
              validUntil: Date.now() + 120000,
              dexes: ["Uniswap V3"],
              slippage: 0.5,
              minAmountOut: toAmount * 0.995,
              uniswapV3Data: {
                tokenIn: UNISWAP_V3_ADDRESSES.WETH,
                intermediateToken: DEUS_TOKEN_ADDRESS,
                tokenOut: toToken,
                fee1: wethToDeusPool.fee,
                fee2: tokenToDeusPool.fee,
                amountIn: amountInWei,
                amountOutMinimum: ((BigInt(multiHopQuote.amountOut) * BigInt(995)) / BigInt(1000)).toString(),
                poolAddress: tokenToDeusPool.poolAddress,
                isMultiHop: true,
              },
            }

            console.log("[v0] Multi-hop swap quote through DEUS generated:", quoteResponse)
            return NextResponse.json(quoteResponse)
          }
        }
      } else if (deusToTokenPool) {
        console.log("[v0] Found multi-hop route through DEUS:", {
          wethToDeus: { fee: wethToDeusPool.fee, pool: wethToDeusPool.poolAddress },
          deusToToken: { fee: deusToTokenPool.fee, pool: deusToTokenPool.poolAddress },
        })

        const multiHopQuote = await getMultiHopSwapQuote(
          UNISWAP_V3_ADDRESSES.WETH,
          DEUS_TOKEN_ADDRESS,
          toToken,
          amountInWei,
          wethToDeusPool.fee,
          deusToTokenPool.fee,
        )

        if (multiHopQuote) {
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
            fee: (wethToDeusPool.fee + deusToTokenPool.fee) / 10000,
            route: `ETH → DEUS → TOKEN (Multi-Hop)`,
            estimatedGas: Number(multiHopQuote.gasEstimate) * 0.000000001,
            validUntil: Date.now() + 120000,
            dexes: ["Uniswap V3"],
            slippage: 0.5,
            minAmountOut: toAmount * 0.995,
            uniswapV3Data: {
              tokenIn: UNISWAP_V3_ADDRESSES.WETH,
              intermediateToken: DEUS_TOKEN_ADDRESS,
              tokenOut: toToken,
              fee1: wethToDeusPool.fee,
              fee2: deusToTokenPool.fee,
              amountIn: amountInWei,
              amountOutMinimum: ((BigInt(multiHopQuote.amountOut) * BigInt(995)) / BigInt(1000)).toString(),
              poolAddress: deusToTokenPool.poolAddress,
              isMultiHop: true,
            },
          }

          console.log("[v0] Multi-hop swap quote through DEUS generated:", quoteResponse)
          return NextResponse.json(quoteResponse)
        }
      }
    }

    console.log("[v0] No DEUS route found, checking for multi-hop route through USDC...")

    const wethToUsdcPool = await detectPoolFeeTier(UNISWAP_V3_ADDRESSES.WETH, USDC_ADDRESS)
    if (wethToUsdcPool) {
      const usdcToTokenPool = await detectPoolFeeTier(USDC_ADDRESS, toToken)
      if (usdcToTokenPool) {
        console.log("[v0] Found multi-hop route through USDC:", {
          wethToUsdc: { fee: wethToUsdcPool.fee, pool: wethToUsdcPool.poolAddress },
          usdcToToken: { fee: usdcToTokenPool.fee, pool: usdcToTokenPool.poolAddress },
        })

        const multiHopQuote = await getMultiHopSwapQuote(
          UNISWAP_V3_ADDRESSES.WETH,
          USDC_ADDRESS,
          toToken,
          amountInWei,
          wethToUsdcPool.fee,
          usdcToTokenPool.fee,
        )

        if (multiHopQuote) {
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
            fee: (wethToUsdcPool.fee + usdcToTokenPool.fee) / 10000,
            route: `ETH → USDC → TOKEN (Multi-Hop)`,
            estimatedGas: Number(multiHopQuote.gasEstimate) * 0.000000001,
            validUntil: Date.now() + 120000,
            dexes: ["Uniswap V3"],
            slippage: 0.5,
            minAmountOut: toAmount * 0.995,
            uniswapV3Data: {
              tokenIn: UNISWAP_V3_ADDRESSES.WETH,
              intermediateToken: USDC_ADDRESS,
              tokenOut: toToken,
              fee1: wethToUsdcPool.fee,
              fee2: usdcToTokenPool.fee,
              amountIn: amountInWei,
              amountOutMinimum: ((BigInt(multiHopQuote.amountOut) * BigInt(995)) / BigInt(1000)).toString(),
              poolAddress: usdcToTokenPool.poolAddress,
              isMultiHop: true,
            },
          }

          console.log("[v0] Multi-hop swap quote through USDC generated:", quoteResponse)
          return NextResponse.json(quoteResponse)
        }
      }
    }

    console.log("[v0] No USDC route found, checking for multi-hop route through ZORA...")

    const wethToZoraPool = await detectPoolFeeTier(UNISWAP_V3_ADDRESSES.WETH, ZORA_TOKEN_ADDRESS)
    if (!wethToZoraPool) {
      console.error("[v0] No WETH → ZORA pool found")
      return NextResponse.json(
        {
          error: "NO_LIQUIDITY",
          message: "No liquidity pool found for this token pair. Cannot route through DEUS, USDC, or ZORA.",
          suggestion: "Please deploy liquidity for this token first.",
        },
        { status: 404 },
      )
    }

    let zoraToTokenPool = await detectPoolFeeTier(ZORA_TOKEN_ADDRESS, toToken)
    let isReversedZoraPool = false

    if (!zoraToTokenPool) {
      console.log("[v0] No ZORA → Token pool found, checking Token → ZORA...")
      zoraToTokenPool = await detectPoolFeeTier(toToken, ZORA_TOKEN_ADDRESS)
      isReversedZoraPool = true
    }

    if (!zoraToTokenPool) {
      console.error("[v0] No ZORA ↔ Token pool found in either direction")
      return NextResponse.json(
        {
          error: "NO_LIQUIDITY",
          message: "No ZORA liquidity pool found for this creator token.",
          suggestion: "Please deploy liquidity for this token first.",
        },
        { status: 404 },
      )
    }

    console.log("[v0] Found multi-hop route through ZORA:", {
      wethToZora: { fee: wethToZoraPool.fee, pool: wethToZoraPool.poolAddress },
      zoraToToken: { fee: zoraToTokenPool.fee, pool: zoraToTokenPool.poolAddress, reversed: isReversedZoraPool },
    })

    const multiHopQuote = isReversedZoraPool
      ? await getMultiHopSwapQuote(
          UNISWAP_V3_ADDRESSES.WETH,
          ZORA_TOKEN_ADDRESS,
          toToken,
          amountInWei,
          wethToZoraPool.fee,
          zoraToTokenPool.fee,
        )
      : await getMultiHopSwapQuote(
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

    console.log("[v0] Multi-hop swap quote through ZORA generated:", quoteResponse)
    return NextResponse.json(quoteResponse)
  } catch (error) {
    console.error("[v0] ❌ Swap quote error:", error)
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
    "0x1111111111166b7fe7bd91427724b487980afc69": "ZORA",
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
