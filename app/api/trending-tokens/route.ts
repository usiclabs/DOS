import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET() {
  try {
    console.log("[v0] Fetching trending tokens from Dexscreener...")

    const [wethResponse, usdcResponse, daiResponse] = await Promise.all([
      fetch("https://api.dexscreener.com/latest/dex/tokens/0x4200000000000000000000000000000000000006"), // WETH
      fetch("https://api.dexscreener.com/latest/dex/tokens/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"), // USDC
      fetch("https://api.dexscreener.com/latest/dex/tokens/0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"), // DAI
    ])

    const [wethData, usdcData, daiData] = await Promise.all([
      wethResponse.ok ? wethResponse.json() : { pairs: [] },
      usdcResponse.ok ? usdcResponse.json() : { pairs: [] },
      daiResponse.ok ? daiResponse.json() : { pairs: [] },
    ])

    const allPairs = [...(wethData.pairs || []), ...(usdcData.pairs || []), ...(daiData.pairs || [])]

    const basePairs = allPairs.filter((pair: any) => pair.chainId === "base")
    console.log("[v0] Found", basePairs.length, "Base pairs from token searches")

    const tokenMap = new Map<string, any>()

    basePairs.forEach((pair: any) => {
      const tokenAddress = pair.baseToken.address.toLowerCase()

      if (!tokenMap.has(tokenAddress)) {
        tokenMap.set(tokenAddress, {
          address: pair.baseToken.address,
          symbol: pair.baseToken.symbol,
          name: pair.baseToken.name,
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
    })
  } catch (error: any) {
    console.error("[v0] Failed to fetch trending tokens:", error)
    return NextResponse.json({ error: error.message, tokens: [] }, { status: 500 })
  }
}
