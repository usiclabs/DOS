import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"
export const dynamic = "force-dynamic"

interface DeployRequest {
  name: string
  symbol: string
  description?: string
  imageUrl?: string
  socialLinks?: {
    website?: string
    twitter?: string
    telegram?: string
  }
  auditUrls?: string[]
  pool?: {
    type: "standard" | "project"
    pairedToken: string
    initialMarketCap: number
  }
  fees?: {
    type: "static" | "dynamic"
    clankerFee: number
    pairedFee: number
  }
  rewards?: {
    creatorPercentage: number
    rewardToken: "Both" | "Paired" | "Clanker"
  }
  vault?: {
    percentage: number
    durationInDays: number
  }
  devBuy?: {
    ethAmount: string
    maxSlippage: number
  }
  vanity?: boolean
  deployer: string
}

function getPairedTokenAddress(token: string): string {
  const addresses: Record<string, string> = {
    WETH: "0x4200000000000000000000000000000000000006",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    DEUS: "0xf44Ab962d787444F4Ae6674A7FB61A8e66581B07",
  }
  return addresses[token] || addresses.WETH
}

function getTickIfToken0IsClanker(pairedToken: string): number {
  // Tick values for different paired tokens
  // These are standard tick values for Uniswap V4 pools
  const ticks: Record<string, number> = {
    WETH: -276_325, // Standard tick for WETH pairs
    USDC: -276_325, // Standard tick for USDC pairs
    DEUS: -423_800, // Standard tick for DEUS pairs (lower price)
  }
  return ticks[pairedToken] || ticks.WETH
}

function getStandardPositions(poolType: string) {
  if (poolType === "project") {
    // Project pool: tighter liquidity range
    return [{ tickLower: -276_325, tickUpper: -100_000, positionBps: 10000 }]
  }
  // Standard/meme pool: wider liquidity range
  return [
    { tickLower: -276_325, tickUpper: -100_000, positionBps: 9500 },
    { tickLower: -100_000, tickUpper: 887_272, positionBps: 500 },
  ]
}

function getDeusPositions() {
  return [
    { tickLower: -423_800, tickUpper: -318_400, positionBps: 9500 },
    { tickLower: -318_400, tickUpper: -100_000, positionBps: 500 },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body: DeployRequest = await request.json()
    console.log("[v0] Clanker v4 deploy request:", body)

    // Validate required fields
    if (!body.name || !body.symbol || !body.deployer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const requestKey = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

    // Build social media URLs array
    const socialMediaUrls: string[] = []
    if (body.socialLinks?.website) socialMediaUrls.push(body.socialLinks.website)
    if (body.socialLinks?.twitter) socialMediaUrls.push(body.socialLinks.twitter)
    if (body.socialLinks?.telegram) socialMediaUrls.push(body.socialLinks.telegram)

    const clankerFee = Math.min(body.fees?.clankerFee || 1, 5)
    const pairedFee = Math.min(body.fees?.pairedFee || 1, 5)

    // The creatorPercentage from the modal is for fee distribution, not reward allocation
    const creatorAllocation = 100 // Must always be 100 for single recipient to satisfy API requirement

    const pairedTokenSymbol = body.pool?.pairedToken || "WETH"
    const pairedTokenAddress = getPairedTokenAddress(pairedTokenSymbol)
    const tickIfToken0IsClanker = getTickIfToken0IsClanker(pairedTokenSymbol)

    const positions =
      pairedTokenSymbol === "DEUS" ? getDeusPositions() : getStandardPositions(body.pool?.type || "standard")

    const imageUrl = body.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${body.symbol}`

    const metadata: any = {
      description: body.description || `${body.name} token deployed via D.O.S.`,
    }
    if (socialMediaUrls.length > 0) {
      metadata.socialMediaUrls = socialMediaUrls
    }
    if (body.auditUrls && body.auditUrls.length > 0) {
      metadata.auditUrls = body.auditUrls
    }

    const poolConfig: any = {
      type: body.pool?.type || "standard",
      pairedToken: pairedTokenAddress,
      tickIfToken0IsClanker,
      positions,
    }

    // Add initialMarketCap if provided (required for custom positions)
    if (body.pool?.initialMarketCap) {
      poolConfig.initialMarketCap = body.pool.initialMarketCap
    }

    const clankerRequest: any = {
      token: {
        name: body.name,
        symbol: body.symbol,
        tokenAdmin: body.deployer,
        requestKey,
        requestorAddress: body.deployer,
        image: imageUrl,
        metadata,
      },
      pool: poolConfig,
      fees: {
        type: body.fees?.type || "static",
        clankerFee,
        pairedFee,
      },
      rewards: [
        {
          admin: body.deployer,
          recipient: body.deployer,
          allocation: creatorAllocation, // Always 100 for single recipient
          rewardsToken: body.rewards?.rewardToken || "Paired",
        },
      ],
      chainId: 8453,
    }

    if (body.vault) {
      clankerRequest.vault = {
        percentage: body.vault.percentage,
        durationInDays: body.vault.durationInDays,
      }
    }

    if (body.devBuy) {
      clankerRequest.devBuy = {
        ethAmount: body.devBuy.ethAmount,
        maxSlippage: body.devBuy.maxSlippage,
      }
    }

    if (body.vanity) {
      clankerRequest.token.vanity = true
    }

    console.log("[v0] Clanker v4 request payload:", JSON.stringify(clankerRequest, null, 2))
    console.log("[v0] Deploying token via Clanker v4 API (Uniswap V4)...")

    const clankerResponse = await fetch("https://www.clanker.world/api/tokens/deploy/v4", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLANKER_API_KEY || "",
      },
      body: JSON.stringify(clankerRequest),
    })

    console.log("[v0] Clanker API response status:", clankerResponse.status)

    if (!clankerResponse.ok) {
      const errorData = await clankerResponse.json()
      console.error("[v0] Clanker v4 API error:", errorData)
      return NextResponse.json(
        {
          error: errorData.error || "Clanker API request failed",
        },
        { status: clankerResponse.status },
      )
    }

    const result = await clankerResponse.json()
    console.log("[v0] Clanker v4 API response:", result)

    return NextResponse.json({
      success: true,
      tokenAddress: result.expectedAddress || result.tokenAddress,
      message: result.message || "Token deployed successfully with Uniswap V4 pool",
      requestKey,
      txHash: result.txHash,
    })
  } catch (error: any) {
    console.error("[v0] Clanker v4 deployment error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to deploy token",
      },
      { status: 500 },
    )
  }
}
