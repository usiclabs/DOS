import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import { BASE_RPC_URL } from "@/lib/rpc-config"
import { buildSwapTransaction } from "@/lib/uniswap-v3-swap"

export async function POST(request: NextRequest) {
  try {
    const { quote, userAddress } = await request.json()

    console.log("[v0] Executing swap:", { userAddress, hasUniswapV3Data: !!quote.uniswapV3Data })

    // Validate required parameters
    if (!quote || !userAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    if (!quote.uniswapV3Data) {
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
    const swapTx = buildSwapTransaction(
      quote.uniswapV3Data.tokenIn,
      quote.uniswapV3Data.tokenOut,
      quote.uniswapV3Data.amountIn,
      quote.uniswapV3Data.amountOutMinimum,
      userAddress,
      quote.uniswapV3Data.fee,
      deadline,
    )

    const transactionRequest = {
      to: swapTx.to,
      data: swapTx.data,
      value: swapTx.value,
      gasLimit: swapTx.gasLimit,
      nonce: nonce !== undefined ? `0x${nonce.toString(16)}` : undefined,
      maxFeePerGas: maxFeePerGas ? `0x${maxFeePerGas.toString(16)}` : undefined,
      maxPriorityFeePerGas: maxPriorityFeePerGas ? `0x${maxPriorityFeePerGas.toString(16)}` : undefined,
    }

    console.log("[v0] Swap transaction prepared via Uniswap V3:", {
      to: transactionRequest.to,
      value: transactionRequest.value,
      gasLimit: transactionRequest.gasLimit,
      fee: quote.uniswapV3Data.fee,
      pool: quote.uniswapV3Data.poolAddress,
    })

    return NextResponse.json({
      success: true,
      transaction: transactionRequest,
      quote: {
        ...quote,
        validUntil: Date.now() + 120000, // 2 minutes
      },
      message: "Swap transaction prepared via Uniswap V3",
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
