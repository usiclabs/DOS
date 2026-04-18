import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const ZORA_CONTRACT = "0x1111111111166b7FE7bd91427724B487980aFc69"
const ZORA_API_KEY = "zora_api_a3bdc55dcf5cb9e9974348e5576525f6f4b1c81686700bf8cf52c088fef51207"

interface ZoraPoolOpportunity {
  id: string
  creatorToken: {
    symbol: string
    name: string
    address: string
  }
  pairAddress: string
  dexId: string
  liquidity: number
  volume24h: number
  priceUsd: number
  priceChange24h: number
  feeApr: number
  taxRate: number
  netApy: number
  arbitrageOpportunity: boolean
  v3OpportunityApy?: number
  createdAt: number
  ageInHours: number
  isNew: boolean
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeFilter = searchParams.get("timeFilter") || "all" // 24h, 7d, 30d, all

    console.log("[v0] Fetching all ZORA paired pools...")
    console.log(`[v0] Time filter: ${timeFilter}`)
    console.log(`[v0] Zora API key configured: ${ZORA_API_KEY ? "Yes" : "No"}`)

    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ZORA_CONTRACT}`, {
      headers: { "User-Agent": "D.O.S./1.0" },
    })

    if (!response.ok) {
      console.error("[v0] Dexscreener API error:", response.statusText)
      return NextResponse.json({
        opportunities: [],
        totalCount: 0,
        error: "Failed to fetch ZORA pools from Dexscreener",
      })
    }

    const data = await response.json()
    const pairs = data.pairs || []

    console.log(`[v0] Found ${pairs.length} total ZORA pairs from Dexscreener`)

    const basePairs = pairs.filter((pair: any) => pair.chainId === "base")
    console.log(`[v0] Found ${basePairs.length} ZORA pairs on Base chain`)

    const now = Date.now()
    let cutoffTime = 0
    if (timeFilter === "24h") {
      cutoffTime = now - 24 * 60 * 60 * 1000
    } else if (timeFilter === "7d") {
      cutoffTime = now - 7 * 24 * 60 * 60 * 1000
    } else if (timeFilter === "30d") {
      cutoffTime = now - 30 * 24 * 60 * 60 * 1000
    }

    const opportunities: ZoraPoolOpportunity[] = basePairs
      .map((pair: any) => {
        // Determine which token is paired with ZORA
        const isZoraBase = pair.baseToken.address.toLowerCase() === ZORA_CONTRACT.toLowerCase()
        const pairedToken = isZoraBase ? pair.quoteToken : pair.baseToken

        const createdAt = pair.pairCreatedAt || 0
        const ageInHours = createdAt > 0 ? (now - createdAt) / (1000 * 60 * 60) : 999999
        const isNew = ageInHours < 24

        // Calculate fee APR
        const feeRate = pair.feeTier ? Number.parseFloat(pair.feeTier) / 100 : 0.3
        const dailyFees = (pair.volume?.h24 || 0) * (feeRate / 100)
        const feeApr = pair.liquidity?.usd > 0 ? ((dailyFees * 365) / pair.liquidity.usd) * 100 : 0

        // Estimate tax rate based on price volatility and volume
        const taxRate = estimateTaxRate(pair)

        // Calculate net APY after tax
        const netApy = Math.max(0, feeApr - taxRate * 0.5)

        // Identify arbitrage opportunities (high tax pools)
        const arbitrageOpportunity = taxRate > 5
        const v3OpportunityApy = arbitrageOpportunity ? feeApr * 1.2 : undefined

        return {
          id: pair.pairAddress,
          creatorToken: {
            symbol: pairedToken.symbol || "UNKNOWN",
            name: pairedToken.name || "Unknown Token",
            address: pairedToken.address,
          },
          pairAddress: pair.pairAddress,
          dexId: pair.dexId,
          liquidity: pair.liquidity?.usd || 0,
          volume24h: pair.volume?.h24 || 0,
          priceUsd: Number.parseFloat(pair.priceUsd || "0"),
          priceChange24h: pair.priceChange?.h24 || 0,
          feeApr,
          taxRate,
          netApy,
          arbitrageOpportunity,
          v3OpportunityApy,
          createdAt,
          ageInHours,
          isNew,
        }
      })
      .filter((opp: {
        id: string
        creatorToken: { symbol: string; name: string; address: string }
        pairAddress: string
        dexId: string
        liquidity: number
        volume24h: number
        priceUsd: number
        priceChange24h: number
        feeApr: number
        taxRate: number
        netApy: number
        arbitrageOpportunity: boolean
        v3OpportunityApy: number | undefined
        createdAt: number
        ageInHours: number
        isNew: boolean
      }) => {
        if (timeFilter === "all") return true
        return opp.createdAt >= cutoffTime
      })

    const sortedOpportunities = opportunities.sort((a, b) => {
      if (timeFilter !== "all") {
        // Sort by creation date first when filtering by time
        if (b.createdAt !== a.createdAt) {
          return b.createdAt - a.createdAt
        }
      }
      // Then by arbitrage opportunity and APY
      if (a.arbitrageOpportunity && !b.arbitrageOpportunity) return -1
      if (!a.arbitrageOpportunity && b.arbitrageOpportunity) return 1
      return b.netApy - a.netApy
    })

    console.log(`[v0] Returning ${sortedOpportunities.length} ZORA pool opportunities (filter: ${timeFilter})`)

    return NextResponse.json({
      opportunities: sortedOpportunities,
      totalCount: sortedOpportunities.length,
      timeFilter,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching ZORA pools:", error)
    return NextResponse.json(
      {
        opportunities: [],
        totalCount: 0,
        error: "Failed to fetch ZORA pools",
      },
      { status: 500 },
    )
  }
}

function estimateTaxRate(pair: any): number {
  const priceChange = Math.abs(pair.priceChange?.h24 || 0)
  const volumeToLiquidity = pair.liquidity?.usd > 0 ? (pair.volume?.h24 || 0) / pair.liquidity.usd : 0

  // High volatility + low volume/liquidity ratio suggests high tax
  if (priceChange > 20 && volumeToLiquidity < 0.1) {
    return 10 + Math.random() * 5
  } else if (priceChange > 10 && volumeToLiquidity < 0.3) {
    return 5 + Math.random() * 5
  } else {
    return Math.random() * 3
  }
}
