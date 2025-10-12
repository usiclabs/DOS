import { type NextRequest, NextResponse } from "next/server"
import { encodeFunctionData, createPublicClient, http } from "viem"
import { base } from "viem/chains"

export async function POST(request: NextRequest) {
  try {
    const { quote, userAddress, slippage = 0.5 } = await request.json()

    console.log("[v0] Executing real swap:", { quote, userAddress, slippage })

    // Validate required parameters
    if (!quote || !userAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481" // Base mainnet
    const DEUS_CONTRACT = "0x73582df1cad3187cD0746b7A473d65c06386837e"

    const alchemyKey = process.env.ALCHEMY_API_KEY
    if (!alchemyKey) {
      return NextResponse.json(
        { error: "ALCHEMY_API_KEY not configured. Please add it to your environment variables." },
        { status: 500 },
      )
    }

    const rpcUrl = `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`

    const client = createPublicClient({
      chain: base,
      transport: http(rpcUrl, {
        timeout: 5000,
        retryCount: 1,
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
      console.error("Could not fetch RPC parameters:", rpcError instanceof Error ? rpcError.message : "Unknown error")
      return NextResponse.json({ error: "Failed to fetch transaction parameters from RPC" }, { status: 500 })
    }

    // Build swap transaction data
    const swapData = await buildSwapTransaction({
      fromToken: quote.fromToken.address,
      toToken: DEUS_CONTRACT,
      fromAmount: quote.fromAmount,
      toAmount: quote.toAmount,
      userAddress,
      slippage,
      router: UNISWAP_V3_ROUTER,
    })

    const transactionRequest = {
      to: UNISWAP_V3_ROUTER,
      data: swapData.data,
      value: swapData.value,
      gasLimit: swapData.gasLimit,
      nonce: nonce !== undefined ? `0x${nonce.toString(16)}` : undefined,
      maxFeePerGas: maxFeePerGas ? `0x${maxFeePerGas.toString(16)}` : undefined,
      maxPriorityFeePerGas: maxPriorityFeePerGas ? `0x${maxPriorityFeePerGas.toString(16)}` : undefined,
    }

    console.log("[v0] Real swap transaction prepared:", transactionRequest)

    return NextResponse.json({
      success: true,
      transaction: transactionRequest,
      quote: {
        ...quote,
        validUntil: Date.now() + 300000, // 5 minutes
        minAmountOut: calculateMinAmountOut(quote.toAmount, slippage),
      },
      message: "Swap transaction prepared for execution",
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

async function buildSwapTransaction({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  userAddress,
  slippage,
  router,
}: {
  fromToken: string
  toToken: string
  fromAmount: number
  toAmount: number
  userAddress: string
  slippage: number
  router: string
}) {
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800) // 30 minutes
  const minAmountOut = calculateMinAmountOut(toAmount, slippage)

  // Convert amounts to wei (BigInt)
  const amountIn = BigInt(Math.floor(fromAmount * 1e18))
  const amountOutMin = BigInt(Math.floor(minAmountOut * 1e18))

  const data = encodeFunctionData({
    abi: [
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
    ],
    functionName: "exactInputSingle",
    args: [
      {
        tokenIn: fromToken as `0x${string}`,
        tokenOut: toToken as `0x${string}`,
        fee: 3000, // 0.3% fee tier
        recipient: userAddress as `0x${string}`,
        deadline,
        amountIn,
        amountOutMinimum: amountOutMin,
        sqrtPriceLimitX96: 0n, // No price limit
      },
    ],
  })

  return {
    data,
    value: fromToken === "0x0000000000000000000000000000000000000000" ? `0x${amountIn.toString(16)}` : "0x0",
    gasLimit: "0x7A120", // 500,000 gas
  }
}

function calculateMinAmountOut(expectedAmount: number, slippageTolerance: number): number {
  return expectedAmount * (1 - slippageTolerance / 100)
}
