import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import { BASE_RPC_URL } from "@/lib/rpc-config"
import { buildSwapTransaction, buildMultiHopSwapTransaction } from "@/lib/uniswap-v3-swap"
import { buildV4SwapTransaction } from "@/lib/uniswap-v4-swap"
import { prepareZoraTradeTransaction } from "@/lib/zora-trade"

export async function POST(request: NextRequest) {
  try {
    const { quote, userAddress } = await request.json()

    console.log("[v0] Executing swap:", {
      userAddress,
      hasUniswapV3Data: !!quote.uniswapV3Data,
      hasUniswapV4Data: !!quote.uniswapV4Data,
      hasZoraTradeData: !!quote.zoraTradeData,
    })

    // Validate required parameters
    if (!quote || !userAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    if (!quote.uniswapV3Data && !quote.uniswapV4Data && !quote.zoraTradeData) {
      return NextResponse.json(
        {
          error: "No transaction data available. Please get a new quote.",
        },
        { status: 400 },
      )
    }

    const client = createPublicClient({
      chain: base,
      transport: http(BASE_RPC_URL, {
        timeout: 10000,
        retryCount: 2,
      }),
    })

    let nonce: number | undefined
    let maxFeePerGas: bigint | undefined
    let maxPriorityFeePerGas: bigint | undefined

    try {
      const [fetchedNonce, gasPrice, block] = await Promise.all([
        client.getTransactionCount({ address: userAddress as `0x${string}` }),
        client.getGasPrice(),
        client.getBlock(),
      ])

      nonce = fetchedNonce
      maxPriorityFeePerGas = gasPrice / 10n
      maxFeePerGas = (block.baseFeePerGas || gasPrice) * 2n + maxPriorityFeePerGas
    } catch (rpcError) {
      console.error(
        "[v0] Could not fetch RPC parameters:",
        rpcError instanceof Error ? rpcError.message : "Unknown error",
      )
      return NextResponse.json({ error: "Failed to fetch transaction parameters from RPC" }, { status: 500 })
    }

    const deadline = Math.floor(Date.now() / 1000) + 1200 // 20 minutes from now

    let swapTx

    if (quote.zoraTradeData) {
      console.log("[v0] Building Zora trade transaction...")
      swapTx = prepareZoraTradeTransaction(quote.zoraTradeData.tradeParams, deadline)
    } else if (quote.uniswapV4Data) {
      console.log("[v0] Building Uniswap V4 swap transaction...")
      swapTx = buildV4SwapTransaction(
        quote.uniswapV4Data.poolKey,
        quote.uniswapV4Data.amountIn,
        quote.uniswapV4Data.amountOutMinimum,
        userAddress,
        quote.uniswapV4Data.zeroForOne,
        deadline,
      )
    } else if (quote.uniswapV3Data.isMultiHop) {
      console.log("[v0] Building multi-hop swap transaction...")
      swapTx = buildMultiHopSwapTransaction(
        quote.uniswapV3Data.tokenIn,
        quote.uniswapV3Data.intermediateToken,
        quote.uniswapV3Data.tokenOut,
        quote.uniswapV3Data.amountIn,
        quote.uniswapV3Data.amountOutMinimum,
        userAddress,
        quote.uniswapV3Data.fee1,
        quote.uniswapV3Data.fee2,
        deadline,
      )
    } else {
      console.log("[v0] Building single-hop swap transaction...")
      swapTx = buildSwapTransaction(
        quote.uniswapV3Data.tokenIn,
        quote.uniswapV3Data.tokenOut,
        quote.uniswapV3Data.amountIn,
        quote.uniswapV3Data.amountOutMinimum,
        userAddress,
        quote.uniswapV3Data.fee,
        deadline,
      )
    }

    const transactionRequest = {
      to: swapTx.to,
      data: swapTx.data,
      value: swapTx.value,
      gasLimit: swapTx.gasLimit,
      nonce: nonce !== undefined ? `0x${nonce.toString(16)}` : undefined,
      maxFeePerGas: maxFeePerGas ? `0x${maxFeePerGas.toString(16)}` : undefined,
      maxPriorityFeePerGas: maxPriorityFeePerGas ? `0x${maxPriorityFeePerGas.toString(16)}` : undefined,
    }

    console.log("[v0] Swap transaction prepared:", {
      to: transactionRequest.to,
      value: transactionRequest.value,
      gasLimit: transactionRequest.gasLimit,
      isZoraTrade: !!quote.zoraTradeData,
      isV4: !!quote.uniswapV4Data,
      isMultiHop: quote.uniswapV3Data?.isMultiHop,
    })

    return NextResponse.json({
      success: true,
      transaction: transactionRequest,
      quote: {
        ...quote,
        validUntil: Date.now() + 120000, // 2 minutes
      },
      message: quote.zoraTradeData
        ? "Swap transaction prepared via Zora Protocol"
        : quote.uniswapV4Data
          ? "Swap transaction prepared via Uniswap V4"
          : quote.uniswapV3Data.isMultiHop
            ? "Multi-hop swap transaction prepared via Uniswap V3"
            : "Swap transaction prepared via Uniswap V3",
    })
  } catch (error) {
    console.error("[v0] Swap execution error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to prepare swap transaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
