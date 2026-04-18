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

    // Note: This is a temporary placeholder. In a real implementation, the wallet client
    // and account would come from the request body (from a connected wallet on the client side)
    // For now, we'll return the deployment parameters that would be needed on the client
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

    // Return the prepared parameters - the actual deployment happens client-side
    return NextResponse.json({
      success: true,
      message: "Coin deployment parameters prepared",
      deploymentParams: deployParams,
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
    console.error("[v0] Error preparing Zora coin deployment:", error)
    return NextResponse.json({ error: error.message || "Failed to prepare coin deployment" }, { status: 500 })
  }
}
