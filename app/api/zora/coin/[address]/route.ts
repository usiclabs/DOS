import { NextResponse } from "next/server"
import { getCoinDetails } from "@/lib/zora-sdk"

async function fetchDexscreenerPrice(tokenAddress: string) {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`)
    if (!response.ok) return null

    const data = await response.json()
    const pairs = data.pairs || []
    const basePairs = pairs.filter((pair: any) => pair.chainId === "base")

    if (basePairs.length === 0) return null

    const bestPair = basePairs.reduce((best: any, current: any) => {
      const bestLiq = Number.parseFloat(best.liquidity?.usd || "0")
      const currentLiq = Number.parseFloat(current.liquidity?.usd || "0")
      return currentLiq > bestLiq ? current : best
    })

    return {
      price: Number.parseFloat(bestPair.priceUsd || "0"),
      priceChange24h: Number.parseFloat(bestPair.priceChange?.h24 || "0"),
      volume24h: Number.parseFloat(bestPair.volume?.h24 || "0"),
      liquidity: Number.parseFloat(bestPair.liquidity?.usd || "0"),
    }
  } catch (error) {
    console.error("Error fetching Dexscreener price:", error)
    return null
  }
}

export async function GET(request: Request, { params }: { params: { address: string } }) {
  try {
    const { address } = params

    console.log("[v0] Fetching coin details for:", address)

    const coinData = await getCoinDetails(address)

    console.log("[v0] coinData received:", coinData ? "exists" : "null")
    if (coinData) {
      console.log("[v0] coinData keys:", Object.keys(coinData))
      console.log("[v0] coinData.address:", coinData.address)
    }

    if (!coinData) {
      console.error("[v0] No coin data returned from getCoinDetails")
      return NextResponse.json({ error: "Coin not found" }, { status: 404 })
    }

    const dexData = await fetchDexscreenerPrice(address)

    let imageUrl = null
    if (coinData.mediaContent?.previewImage) {
      imageUrl =
        typeof coinData.mediaContent.previewImage === "object"
          ? coinData.mediaContent.previewImage.medium || coinData.mediaContent.previewImage.small
          : coinData.mediaContent.previewImage
    }

    const creatorProfile = coinData.creatorProfile || {}
    const creatorAvatar = creatorProfile.avatar?.previewImage?.small || creatorProfile.avatar?.previewImage?.medium

    const coin = {
      address: coinData.address,
      name: coinData.name,
      symbol: coinData.symbol,
      description: coinData.description || `${coinData.name} creator coin on Zora`,
      image: imageUrl,
      creator: {
        address: coinData.creatorAddress || "0x0000000000000000000000000000000000000000",
        name: creatorProfile.handle || `${coinData.name} Creator`,
        avatar: creatorAvatar || null,
      },
      metrics: {
        price: dexData?.price || Number.parseFloat(coinData.tokenPrice?.priceInUsdc || "0"),
        priceChange24h: dexData?.priceChange24h || 0,
        marketCap: Number.parseFloat(coinData.marketCap || "0"),
        volume24h: dexData?.volume24h || Number.parseFloat(coinData.volume24h || "0"),
        holders: coinData.uniqueHolders || 0,
        totalSupply: Number.parseFloat(coinData.totalSupply || "0"),
        liquidity: dexData?.liquidity || Number.parseFloat(coinData.totalVolume || "0") * 0.3,
      },
      poolAddress: coinData.uniswapV3PoolAddress,
      createdAt: coinData.createdAt || new Date().toISOString(),
    }

    console.log("[v0] Successfully fetched coin details")

    return NextResponse.json({ coin })
  } catch (error: any) {
    console.error("[v0] Error in coin details API route:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch coin details" }, { status: 500 })
  }
}
