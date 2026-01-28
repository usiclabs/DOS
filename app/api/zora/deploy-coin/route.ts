import { type NextRequest, NextResponse } from "next/server"
import { deployCoin, uploadMetadataToIPFS, initializeZoraSDK } from "@/lib/zora-sdk"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, symbol, description, currency, initialPurchaseAmount, payoutRecipient } = body

    if (!name || !symbol || !payoutRecipient) {
      return NextResponse.json({ error: "Missing required fields: name, symbol, payoutRecipient" }, { status: 400 })
    }

    // Platform referrer configuration - set to specific Ethereum address for referral rewards
    const PLATFORM_REFERRER = process.env.NEXT_PUBLIC_ZORA_PLATFORM_REFERRER || 
      "0xec3569fC5427945a283a3cb14c62538667b5Cc3a"

    const hasPlatformReferrer = PLATFORM_REFERRER !== "0x0000000000000000000000000000000000000000"

    console.log("[v0] Deploying Zora coin:", {
      name,
      symbol,
      description,
      currency,
      initialPurchaseAmount,
      payoutRecipient,
      platformReferrer: PLATFORM_REFERRER,
      rewardsEnabled: hasPlatformReferrer,
    })

    if (hasPlatformReferrer) {
      console.log("[v0] Platform referrer ENABLED:", PLATFORM_REFERRER)
      console.log("[v0] This deployment will earn 20% of all trading fees")
    }

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

    // Deploy the coin with platform referrer
    const deployParams = {
      name,
      symbol,
      uri: metadataUri,
      chainId: 8453, // Base mainnet
      payoutRecipient,
      platformReferrer: hasPlatformReferrer ? PLATFORM_REFERRER : undefined,
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
      platformReferrer: hasPlatformReferrer ? PLATFORM_REFERRER : null,
      rewardsInfo: hasPlatformReferrer
        ? {
            platformFees: "20% of all trade fees",
            referrerAddress: PLATFORM_REFERRER,
            estimatedEarnings: "Calculated after first trades occur",
          }
        : null,
    })
  } catch (error: any) {
    console.error("[v0] Error deploying Zora coin:", error)
    return NextResponse.json({ error: error.message || "Failed to deploy coin" }, { status: 500 })
  }
}
