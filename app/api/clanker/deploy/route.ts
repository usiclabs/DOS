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
}

export async function POST(request: NextRequest) {
  try {
    const body: DeployRequest = await request.json()
    console.log("[v0] Clanker deploy request:", body)

    // Validate required fields
    if (!body.name || !body.symbol || !body.deployer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate unique request key (32 characters)
    const requestKey = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

    // Build social media URLs array
    const socialMediaUrls: string[] = []
    if (body.socialLinks?.website) socialMediaUrls.push(body.socialLinks.website)
    if (body.socialLinks?.twitter) socialMediaUrls.push(body.socialLinks.twitter)
    if (body.socialLinks?.telegram) socialMediaUrls.push(body.socialLinks.telegram)

    // Prepare Clanker API request
    const clankerRequest = {
      token: {
        name: body.name,
        symbol: body.symbol,
        image: body.imageUrl || undefined,
        tokenAdmin: body.deployer,
        description: body.description || `${body.name} token deployed via D.O.S.`,
        socialMediaUrls: socialMediaUrls.length > 0 ? socialMediaUrls : undefined,
        requestKey,
      },
      rewards: [
        {
          admin: body.deployer,
          recipient: body.deployer,
          allocation: 100,
          rewardsToken: "Both",
        },
      ],
      pool: {
        type: "standard",
        pairedToken: "0x4200000000000000000000000000000000000006", // WETH on Base
        initialMarketCap: 1, // 1 ETH initial market cap
      },
      fees: {
        type: "static",
        clankerFee: 1,
        pairedFee: 1,
      },
      chainId: 8453, // Base chain
    }

    console.log("[v0] Deploying token via Clanker API...")

    // Call Clanker API
    const clankerResponse = await fetch("https://www.clanker.world/api/tokens/deploy/v4", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLANKER_API_KEY || "",
      },
      body: JSON.stringify(clankerRequest),
    })

    if (!clankerResponse.ok) {
      const errorData = await clankerResponse.json()
      console.error("[v0] Clanker API error:", errorData)
      throw new Error(errorData.error || "Clanker API request failed")
    }

    const result = await clankerResponse.json()
    console.log("[v0] Clanker API response:", result)

    return NextResponse.json({
      success: true,
      tokenAddress: result.expectedAddress,
      message: result.message,
      requestKey,
    })
  } catch (error: any) {
    console.error("[v0] Clanker deployment error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to deploy token",
      },
      { status: 500 },
    )
  }
}
