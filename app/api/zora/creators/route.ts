import { NextResponse } from "next/server"
import { queryCreatorCoins } from "@/lib/zora-sdk"

export const dynamic = "force-dynamic"

const ZORA_API_KEY = "zora_api_a3bdc55dcf5cb9e9974348e5576525f6f4b1c81686700bf8cf52c088fef51207"

export interface ZoraCreatorCoin {
  address: string
  name: string
  symbol: string
  description?: string
  image?: string
  creator: {
    address: string
    name?: string
    avatar?: string
    bio?: string
  }
  metrics: {
    price: number
    priceChange24h: number
    marketCap: number
    volume24h: number
    holders: number
    totalSupply: number
    liquidity: number
  }
  poolAddress?: string
  uniswapV4PoolKey?: {
    token0Address: string
    token1Address: string
    fee: number
    tickSpacing: number
    hookAddress: string
  }
  createdAt: string
  trending?: boolean
  verified?: boolean
}

async function fetchDexscreenerPrice(tokenAddress: string): Promise<{
  price: number
  priceChange24h: number
  volume24h: number
  liquidity: number
} | null> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      console.log(`[v0] Dexscreener API error for ${tokenAddress}:`, response.status)
      return null
    }

    const data = await response.json()
    const pairs = data.pairs || []

    if (pairs.length === 0) {
      console.log(`[v0] No Dexscreener pairs found for ${tokenAddress}`)
      return null
    }

    // Find the best pair (highest liquidity on Base chain)
    const basePairs = pairs.filter((pair: any) => pair.chainId === "base")
    if (basePairs.length === 0) {
      console.log(`[v0] No Base chain pairs found for ${tokenAddress}`)
      return null
    }

    const bestPair = basePairs.reduce((best: any, current: any) => {
      const bestLiq = Number.parseFloat(best.liquidity?.usd || "0")
      const currentLiq = Number.parseFloat(current.liquidity?.usd || "0")
      return currentLiq > bestLiq ? current : best
    })

    const price = Number.parseFloat(bestPair.priceUsd || "0")
    const priceChange24h = Number.parseFloat(bestPair.priceChange?.h24 || "0")
    const volume24h = Number.parseFloat(bestPair.volume?.h24 || "0")
    const liquidity = Number.parseFloat(bestPair.liquidity?.usd || "0")

    console.log(
      `[v0] Dexscreener data for ${tokenAddress}: price=$${price}, change=${priceChange24h}%, volume=$${volume24h}`,
    )

    return { price, priceChange24h, volume24h, liquidity }
  } catch (error) {
    console.error(`[v0] Error fetching Dexscreener price for ${tokenAddress}:`, error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const cursor = searchParams.get("cursor") || undefined

    console.log("[v0] Fetching Zora creator coins with filter:", filter, "cursor:", cursor)

    const filterParam = filter === "all" ? undefined : (filter as "trending" | "new" | "top-volume" | "last-traded")

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout after 25 seconds")), 25000),
    )

    const fetchPromise = queryCreatorCoins(filterParam, limit, cursor)

    let result
    try {
      result = (await Promise.race([fetchPromise, timeoutPromise])) as any
    } catch (timeoutError) {
      console.error("[v0] API route timeout, returning empty result")
      return NextResponse.json({
        coins: [],
        totalCount: 0,
        filter,
        nextCursor: null,
        error: "Request timed out. The Zora API is currently slow. Please try again.",
      })
    }

    console.log(`[v0] Received ${result.coins.length} coins from Zora SDK`)

    if (result.coins.length === 0) {
      console.log("[v0] No coins returned from Zora SDK")
      return NextResponse.json({
        coins: [],
        totalCount: 0,
        filter,
        nextCursor: null,
        error: "No coins available at this time. The Zora API may be experiencing issues.",
      })
    }

    const dexscreenerPrices = await Promise.all(result.coins.map((coin: any) => fetchDexscreenerPrice(coin.address)))

    const transformedCoins: ZoraCreatorCoin[] = result.coins.map((coin: any, index: number) => {
      let imageUrl = null

      if (coin.mediaContent?.previewImage) {
        if (typeof coin.mediaContent.previewImage === "object") {
          imageUrl = coin.mediaContent.previewImage.medium || coin.mediaContent.previewImage.small
        } else {
          imageUrl = coin.mediaContent.previewImage
        }
      } else if (coin.mediaContent?.thumbnailImage) {
        if (typeof coin.mediaContent.thumbnailImage === "object") {
          imageUrl = coin.mediaContent.thumbnailImage.medium || coin.mediaContent.thumbnailImage.small
        } else {
          imageUrl = coin.mediaContent.thumbnailImage
        }
      } else if (coin.image) {
        if (typeof coin.image === "object") {
          imageUrl = coin.image.medium || coin.image.small
        } else {
          imageUrl = coin.image
        }
      }

      const dexData = dexscreenerPrices[index]
      const priceInUsdc = dexData?.price || Number.parseFloat(coin.tokenPrice?.priceInUsdc || coin.price || "0")
      const priceChange24h = dexData?.priceChange24h || 0
      const volume24h = dexData?.volume24h || Number.parseFloat(coin.volume24h || "0")
      const liquidity = dexData?.liquidity || Number.parseFloat(coin.totalVolume || coin.marketCap || "0") * 0.3

      const marketCap = Number.parseFloat(coin.marketCap || "0")

      const creatorProfile = coin.creatorProfile || {}
      const creatorAvatar = creatorProfile.avatar?.previewImage?.small || creatorProfile.avatar?.previewImage?.medium
      const creatorHandle = creatorProfile.handle || coin.creatorAddress?.slice(0, 8)

      return {
        address: coin.address,
        name: coin.name,
        symbol: coin.symbol,
        description: coin.description || `${coin.name} creator coin on Zora`,
        image: imageUrl,
        creator: {
          address: coin.creatorAddress || coin.creator?.address || "0x0000000000000000000000000000000000000000",
          name: creatorHandle || `${coin.name} Creator`,
          avatar: creatorAvatar || null,
          bio: `@${creatorHandle}`,
        },
        metrics: {
          price: priceInUsdc,
          priceChange24h: priceChange24h,
          marketCap: marketCap,
          volume24h: volume24h,
          holders: coin.uniqueHolders || coin.holders || 0,
          totalSupply: Number.parseFloat(coin.totalSupply || "0"),
          liquidity: liquidity,
        },
        poolAddress: coin.uniswapV3PoolAddress || coin.poolAddress,
        uniswapV4PoolKey: coin.uniswapV4PoolKey
          ? {
              token0Address: coin.uniswapV4PoolKey.token0Address,
              token1Address: coin.uniswapV4PoolKey.token1Address,
              fee: coin.uniswapV4PoolKey.fee,
              tickSpacing: coin.uniswapV4PoolKey.tickSpacing,
              hookAddress: coin.uniswapV4PoolKey.hookAddress,
            }
          : undefined,
        createdAt: coin.createdAt || new Date().toISOString(),
        trending: volume24h > 10000 || priceChange24h > 20,
        verified: coin.verified || false,
      }
    })

    console.log(`[v0] Successfully transformed ${transformedCoins.length} creator coins with Dexscreener prices`)

    return NextResponse.json({
      coins: transformedCoins,
      totalCount: result.totalCount,
      nextCursor: result.nextCursor || null,
      filter,
    })
  } catch (error: any) {
    console.error("[v0] Error in creators API route:", error)
    return NextResponse.json({
      coins: [],
      totalCount: 0,
      nextCursor: null,
      filter: "all",
      error: "Unable to fetch creator coins at this time",
    })
  }
}
