import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"
export const dynamic = "force-dynamic"

interface DeployRequest {
  name: string
  symbol: string
  initialSupply: string
  description?: string
  imageUrl?: string
  socialLinks?: {
    website?: string
    twitter?: string
    telegram?: string
  }
  deployer: string
  vaultPercentage?: number
  vaultDurationDays?: number
  initialMarketCap?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: DeployRequest = await request.json()
    console.log("[v0] Clanker v3.1.0 deploy request:", body)

    // Validate required fields
    if (!body.name || !body.symbol || !body.deployer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate unique request key (32 characters)
    const requestKey = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

    const imageUrl =
      body.imageUrl && body.imageUrl.trim() !== ""
        ? body.imageUrl
        : `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(body.symbol)}&backgroundColor=1a1a1a&size=400`

    console.log("[v0] Using image URL:", imageUrl)

    // Build social media URLs array
    const socialMediaUrls: string[] = []
    if (body.socialLinks?.website) socialMediaUrls.push(body.socialLinks.website)
    if (body.socialLinks?.twitter) socialMediaUrls.push(body.socialLinks.twitter)
    if (body.socialLinks?.telegram) socialMediaUrls.push(body.socialLinks.telegram)

    // Calculate vault unlock timestamp if vesting is enabled
    const vaultUnlockTimestamp = body.vaultDurationDays
      ? Math.floor(Date.now() / 1000) + body.vaultDurationDays * 24 * 60 * 60
      : undefined

    const clankerRequest: any = {
      name: body.name,
      symbol: body.symbol,
      image: imageUrl,
      requestorAddress: body.deployer,
      requestKey,
      tokenPair: "WETH",
      platform: "D.O.S.",
    }

    // Add optional fields only if they have values
    if (body.description && body.description.trim() !== "") {
      clankerRequest.description = body.description
    }

    if (socialMediaUrls.length > 0) {
      clankerRequest.socialMediaUrls = socialMediaUrls
    }

    if (body.initialMarketCap && body.initialMarketCap > 0) {
      clankerRequest.initialMarketCap = body.initialMarketCap
    }

    if (body.vaultPercentage && body.vaultPercentage > 0) {
      clankerRequest.vaultPercentage = body.vaultPercentage
      clankerRequest.creatorRewardsPercentage = 100 - body.vaultPercentage
    } else {
      clankerRequest.creatorRewardsPercentage = 100
    }

    if (vaultUnlockTimestamp) {
      clankerRequest.vaultUnlockTimestamp = vaultUnlockTimestamp
    }

    clankerRequest.creatorRewardsAdmin = body.deployer

    console.log("[v0] Clanker v3.1.0 request payload:", JSON.stringify(clankerRequest, null, 2))
    console.log("[v0] Deploying token via Clanker v3.1.0 API (Uniswap V3)...")

    const clankerResponse = await fetch("https://www.clanker.world/api/tokens/deploy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLANKER_API_KEY || "",
      },
      body: JSON.stringify(clankerRequest),
    })

    const responseText = await clankerResponse.text()
    console.log("[v0] Clanker API response status:", clankerResponse.status)
    console.log("[v0] Clanker API response body:", responseText)

    if (!clankerResponse.ok) {
      console.error("[v0] Clanker v3.1.0 API error:", responseText)
      throw new Error(`Clanker API request failed (${clankerResponse.status}): ${responseText}`)
    }

    const result = JSON.parse(responseText)
    console.log("[v0] Clanker v3.1.0 API success:", result)

    return NextResponse.json({
      success: true,
      tokenAddress: result.address || result.expectedAddress || result.tokenAddress,
      message: result.message || "Token deployment initiated on Uniswap V3",
      requestKey,
      txHash: result.txHash || result.transactionHash,
      poolType: "Uniswap V3",
      castUrl: result.castUrl,
    })
  } catch (error: any) {
    console.error("[v0] Clanker v3.1.0 deployment error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to deploy token",
      },
      { status: 500 },
    )
  }
}
