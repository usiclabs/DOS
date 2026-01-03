import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET() {
  try {
    console.log("[v0] Fetching trending tokens from Dexscreener...")

    // Fetch trending tokens directly using DexScreener's search for Base chain
    const response = await fetch(
      "https://api.dexscreener.com/latest/dex/search?q=WETH%20USDC%20DAI%20ETH%20BASE&chainId=base&limit=50",
    )

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`)
    }

    const data = await response.json()
    const pairs = data.pairs || []

    const basePairs = pairs.filter((pair: any) => pair.chainId === "base")
    console.log("[v0] Found", basePairs.length, "Base pairs from DexScreener")

    const tokenMap = new Map<string, any>()

    basePairs.forEach((pair: any) => {
      const tokenAddress = pair.baseToken.address.toLowerCase()

      if (!tokenMap.has(tokenAddress)) {
        tokenMap.set(tokenAddress, {
          address: pair.baseToken.address,
          symbol: pair.baseToken.symbol,
          name: pair.baseToken.name || pair.baseToken.symbol,
          priceUsd: Number.parseFloat(pair.priceUsd || "0"),
          priceChange24h: pair.priceChange?.h24 || 0,
          volume24h: 0,
          liquidity: 0,
          fdv: pair.fdv || 0,
          marketCap: pair.marketCap || 0,
          pairs: [],
          isTrending: true,
        })
      }

      const token = tokenMap.get(tokenAddress)
      token.volume24h += pair.volume?.h24 || 0
      token.liquidity += pair.liquidity?.usd || 0
      token.pairs.push({
        pairAddress: pair.pairAddress,
        dexId: pair.dexId,
        quoteToken: pair.quoteToken.symbol,
        liquidity: pair.liquidity?.usd || 0,
        volume24h: pair.volume?.h24 || 0,
      })
    })

    const tokenData = Array.from(tokenMap.values())
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 30)

    console.log("[v0] Processed", tokenData.length, "trending Base tokens")

    return NextResponse.json({
      tokens: tokenData,
      count: tokenData.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Failed to fetch trending tokens:", error)
    return NextResponse.json({ error: error.message, tokens: [], count: 0 }, { status: 500 })
  }
}
