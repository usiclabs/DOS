import { NextResponse } from "next/server"
import type { ProjectProposal } from "@/types/governance"

export async function GET() {
  try {
    console.log("[v0] Fetching live governance proposals from Dexscreener...")

    // Fetch top Base chain pairs from Dexscreener
    const response = await fetch("https://api.dexscreener.com/latest/dex/search?q=base", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Dexscreener API error: ${response.status}`)
    }

    const data = await response.json()
    const pairs = data.pairs || []

    // Filter for Base chain pairs with significant liquidity
    const basePairs = pairs
      .filter((pair: any) => {
        return (
          pair.chainId === "base" &&
          pair.liquidity?.usd > 50000 && // Minimum $50k liquidity
          pair.volume?.h24 > 10000 && // Minimum $10k 24h volume
          pair.priceUsd &&
          pair.fdv
        )
      })
      .slice(0, 20) // Get top 20 pairs

    console.log(`[v0] Found ${basePairs.length} eligible Base pairs`)

    // Transform Dexscreener data to ProjectProposal format
    const proposals: ProjectProposal[] = basePairs.map((pair: any, index: number) => {
      // Calculate APR based on volume/liquidity ratio (simplified)
      const volumeToLiquidityRatio = pair.volume.h24 / pair.liquidity.usd
      const estimatedApr = Math.min(volumeToLiquidityRatio * 365 * 0.3 * 100, 500) // Cap at 500%

      // Generate random votes for demonstration (in production, fetch from blockchain)
      const baseVotes = 100000 - index * 5000
      const randomVariation = Math.floor(Math.random() * 10000)
      const votes = Math.max(baseVotes + randomVariation, 1000)

      return {
        id: pair.pairAddress,
        name: pair.baseToken.symbol + "/" + pair.quoteToken.symbol,
        symbol: `${pair.baseToken.symbol}-${pair.quoteToken.symbol}`,
        tokenAddress: pair.baseToken.address,
        logoUrl: pair.info?.imageUrl || pair.baseToken.logo || "/placeholder.svg",
        description: `${pair.baseToken.name} paired with ${pair.quoteToken.name} on ${pair.dexId}`,
        tvl: pair.liquidity.usd,
        volume24h: pair.volume.h24,
        price: Number.parseFloat(pair.priceUsd),
        priceChange24h: pair.priceChange?.h24 || 0,
        apr: estimatedApr,
        votes: votes,
        myVotes: 0,
        dexId: pair.dexId,
        pairAddress: pair.pairAddress,
      }
    })

    // Sort by votes (descending)
    const sortedProposals = proposals.sort((a, b) => b.votes - a.votes)

    console.log(`[v0] Returning ${sortedProposals.length} live governance proposals`)

    return NextResponse.json({
      proposals: sortedProposals,
      totalProposals: sortedProposals.length,
      source: "dexscreener",
      chainId: "base",
    })
  } catch (error) {
    console.error("[v0] Error fetching live proposals:", error)

    // Return empty array on error instead of mock data
    return NextResponse.json(
      {
        error: "Failed to fetch live proposals",
        proposals: [],
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
