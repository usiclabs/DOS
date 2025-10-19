import { type NextRequest, NextResponse } from "next/server"
import { deployCoin, uploadMetadataToIPFS, initializeZoraSDK } from "@/lib/zora-sdk"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, symbol, description, currency, initialPurchaseAmount, payoutRecipient } = body

    if (!name || !symbol || !payoutRecipient) {
      return NextResponse.json({ error: "Missing required fields: name, symbol, payoutRecipient" }, { status: 400 })
    }

    console.log("[v0] Deploying Zora coin:", {
      name,
      symbol,
      description,
      currency,
      initialPurchaseAmount,
      payoutRecipient,
    })

    // Initialize Zora SDK
    initializeZoraSDK()

    // Upload metadata to IPFS
    const metadataUri = await uploadMetadataToIPFS(
      {
        name,
        symbol,
        description,
      },
      payoutRecipient,
    )

    console.log("[v0] Metadata uploaded to:", metadataUri)

    // Deploy the coin
    const deployParams = {
      name,
      symbol,
      uri: metadataUri,
      chainId: 8453, // Base mainnet
      payoutRecipient,
      currency: currency || "ZORA",
      ...(initialPurchaseAmount && initialPurchaseAmount > 0
        ? {
            initialPurchase: {
              currency: "ETH" as const,
              amount: (initialPurchaseAmount * 1e18).toString(), // Convert to wei
            },
          }
        : {}),
    }

    const result = await deployCoin(deployParams)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to deploy coin" }, { status: 500 })
    }

    console.log("[v0] Coin deployed successfully:", result)

    return NextResponse.json({
      success: true,
      message: "Coin deployed successfully",
      coinAddress: result.coinAddress,
      transactionHash: result.transactionHash,
      poolAddress: result.poolAddress,
      metadataUri,
    })
  } catch (error: any) {
    console.error("[v0] Error deploying Zora coin:", error)
    return NextResponse.json({ error: error.message || "Failed to deploy coin" }, { status: 500 })
  }
}
