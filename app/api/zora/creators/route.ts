import { NextResponse } from "next/server"
import { queryCreatorCoins } from "@/lib/zora-sdk"

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
  createdAt: string
  trending?: boolean
  verified?: boolean
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    console.log("[v0] Fetching Zora creator coins with filter:", filter)

    const filterParam = filter === "all" ? undefined : (filter as "trending" | "new" | "top-volume")
    const result = await queryCreatorCoins(filterParam, limit)
    console.log(`[v0] Received ${result.coins.length} coins from Zora SDK`)

    const transformedCoins: ZoraCreatorCoin[] = result.coins.map((coin: any) => {
      let imageUrl = null

      // Zora returns images as objects with small/medium/large properties
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

      console.log(`[v0] Coin ${coin.name} image:`, imageUrl)

      return {
        address: coin.address,
        name: coin.name,
        symbol: coin.symbol,
        description: coin.description || `${coin.name} creator coin on Zora`,
        image: imageUrl,
        creator: {
          address: coin.creatorAddress || coin.creator?.address || "0x0000000000000000000000000000000000000000",
          name: coin.creator?.name || coin.creatorName || `${coin.name} Creator`,
          avatar: coin.creator?.avatar || coin.creator?.profileImage || null,
          bio: coin.creator?.bio || `Creator of ${coin.name}`,
        },
        metrics: {
          price: Number.parseFloat(coin.price || "0"),
          priceChange24h: coin.priceChange24h || 0,
          marketCap: Number.parseFloat(coin.marketCap || "0"),
          volume24h: Number.parseFloat(coin.volume24h || "0"),
          holders: coin.uniqueHolders || coin.holders || 0,
          totalSupply: Number.parseFloat(coin.totalSupply || "0"),
          liquidity: Number.parseFloat(coin.marketCap || "0") * 0.3,
        },
        poolAddress: coin.poolAddress,
        createdAt: coin.createdAt || new Date().toISOString(),
        trending: Number.parseFloat(coin.volume24h || "0") > 10000,
        verified: coin.verified || false,
      }
    })

    console.log(`[v0] Successfully transformed ${transformedCoins.length} creator coins`)

    return NextResponse.json({
      coins: transformedCoins,
      totalCount: result.totalCount,
      filter,
    })
  } catch (error: any) {
    console.error("[v0] Error in creators API route:", error)
    return NextResponse.json({
      coins: [],
      totalCount: 0,
      filter: "all",
      error: "Unable to fetch creator coins at this time",
    })
  }
}
