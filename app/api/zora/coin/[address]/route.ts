import { type NextRequest, NextResponse } from "next/server"
import { getCoinDetails } from "@/lib/zora-sdk"

export const runtime = "edge"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params
    const chainId = 8453 // Base mainnet

    console.log("[v0] Fetching coin details for:", address)

    const coin = await getCoinDetails(address, chainId)

    if (!coin) {
      return NextResponse.json({ error: "Coin not found" }, { status: 404 })
    }

    // Fetch price from Dexscreener for accurate pricing
    const dexscreenerResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`)
    const dexscreenerData = await dexscreenerResponse.json()

    let price = 0
    let priceChange24h = 0
    let volume24h = 0
    let liquidity = 0

    if (dexscreenerData?.pairs && dexscreenerData.pairs.length > 0) {
      // Find the best Base chain pair with highest liquidity
      const basePairs = dexscreenerData.pairs.filter((pair: any) => pair.chainId === "base")
      if (basePairs.length > 0) {
        const bestPair = basePairs.reduce((best: any, current: any) => {
          const currentLiq = Number.parseFloat(current.liquidity?.usd || "0")
          const bestLiq = Number.parseFloat(best.liquidity?.usd || "0")
          return currentLiq > bestLiq ? current : best
        })

        price = Number.parseFloat(bestPair.priceUsd || "0")
        priceChange24h = Number.parseFloat(bestPair.priceChange?.h24 || "0")
        volume24h = Number.parseFloat(bestPair.volume?.h24 || "0")
        liquidity = Number.parseFloat(bestPair.liquidity?.usd || "0")
      }
    }

    const coinData = {
      address: coin.address,
      name: coin.name,
      symbol: coin.symbol,
      description: coin.description,
      image: coin.mediaContent?.previewImage || coin.mediaContent?.thumbnailImage,
      creator: {
        address: coin.creatorAddress,
        name: coin.creatorProfile?.displayName || coin.creatorProfile?.handle,
        avatar: coin.creatorProfile?.avatar?.medium,
        bio: coin.creatorProfile?.bio,
      },
      metrics: {
        price,
        priceChange24h,
        marketCap: Number.parseFloat(coin.marketCap || "0"),
        volume24h,
        liquidity,
        holders: coin.uniqueHolders || 0,
        totalSupply: Number.parseFloat(coin.totalSupply || "0"),
      },
      poolAddress: coin.poolAddress,
      createdAt: coin.createdAt,
      hookType: coin.hookType || "creator", // "creator" or "content"
    }

    return NextResponse.json({ coin: coinData })
  } catch (error) {
    console.error("[v0] Error fetching coin details:", error)
    return NextResponse.json({ error: "Failed to fetch coin details" }, { status: 500 })
  }
}
