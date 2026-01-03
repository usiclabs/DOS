import { type NextRequest, NextResponse } from "next/server"
import { getCreatorCoins } from "@/lib/zora-sdk"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function fetchDexscreenerPrice(tokenAddress: string): Promise<{
  price: number
  liquidity: number
  volume24h: number
}> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return { price: 0, liquidity: 0, volume24h: 0 }
    }

    const data = await response.json()
    const pairs = data.pairs || []

    if (pairs.length === 0) {
      return { price: 0, liquidity: 0, volume24h: 0 }
    }

    // Find the best pair (highest liquidity on Base chain)
    const basePairs = pairs.filter((pair: any) => pair.chainId === "base")
    if (basePairs.length === 0) {
      return { price: 0, liquidity: 0, volume24h: 0 }
    }

    const bestPair = basePairs.reduce((best: any, current: any) => {
      const bestLiq = Number.parseFloat(best.liquidity?.usd || "0")
      const currentLiq = Number.parseFloat(current.liquidity?.usd || "0")
      return currentLiq > bestLiq ? current : best
    })

    const price = Number.parseFloat(bestPair.priceUsd || "0")
    const liquidity = Number.parseFloat(bestPair.liquidity?.usd || "0")
    const volume24h = Number.parseFloat(bestPair.volume?.h24 || "0")

    return { price, liquidity, volume24h }
  } catch (error) {
    console.error(`[v0] Error fetching Dexscreener price for ${tokenAddress}:`, error)
    return { price: 0, liquidity: 0, volume24h: 0 }
  }
}

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    console.log("[v0] Fetching deployed coins for creator:", address)

    const result = await getCreatorCoins(address, 8453)

    if (!result || result.coins.length === 0) {
      console.log("[v0] No deployed coins found for creator:", address)
      return NextResponse.json({
        success: true,
        deployedCoins: [],
        totalCount: 0,
      })
    }

    console.log(`[v0] Found ${result.coins.length} deployed coins for creator`)

    // Fetch pricing for all coins
    const pricePromises = result.coins.map((coin: any) => fetchDexscreenerPrice(coin.address))
    const priceData = await Promise.all(pricePromises)

    const deployedCoins = result.coins.map((coin: any, index: number) => {
      const { price, liquidity, volume24h } = priceData[index]
      const marketCap = Number.parseFloat(coin.marketCap || "0")
      const balance = Number.parseFloat(coin.totalSupply || "0") / Math.pow(10, 18)

      return {
        address: coin.address,
        name: coin.name,
        symbol: coin.symbol,
        description: coin.description,
        image: coin.mediaContent?.previewImage || coin.image,
        price,
        liquidity,
        volume24h,
        marketCap,
        totalSupply: balance,
        holders: coin.uniqueHolders || coin.holders || 0,
        createdAt: coin.createdAt,
      }
    })

    const totalValue = deployedCoins.reduce((sum: number, coin: any) => sum + coin.marketCap, 0)

    return NextResponse.json({
      success: true,
      deployedCoins,
      totalCount: deployedCoins.length,
      totalValue,
    })
  } catch (error: any) {
    console.error("[v0] Error in deployed-coins API route:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch deployed coins" }, { status: 500 })
  }
}
