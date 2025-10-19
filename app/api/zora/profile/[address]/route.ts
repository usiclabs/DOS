import { type NextRequest, NextResponse } from "next/server"
import { getCreatorProfileBalances } from "@/lib/zora-sdk"

export const runtime = "edge"
export const dynamic = "force-dynamic"

const MIN_LIQUIDITY_USD = 1000 // Only include tokens with > $1k liquidity
const TOKEN_DECIMALS = 18 // Standard ERC-20 decimals

async function fetchDexscreenerPrice(tokenAddress: string): Promise<{
  price: number
  liquidity: number
  isCreatorCoin: boolean
}> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return { price: 0, liquidity: 0, isCreatorCoin: false }
    }

    const data = await response.json()
    const pairs = data.pairs || []

    if (pairs.length === 0) {
      return { price: 0, liquidity: 0, isCreatorCoin: false }
    }

    // Find the best pair (highest liquidity on Base chain)
    const basePairs = pairs.filter((pair: any) => pair.chainId === "base")
    if (basePairs.length === 0) {
      return { price: 0, liquidity: 0, isCreatorCoin: false }
    }

    const bestPair = basePairs.reduce((best: any, current: any) => {
      const bestLiq = Number.parseFloat(best.liquidity?.usd || "0")
      const currentLiq = Number.parseFloat(current.liquidity?.usd || "0")
      return currentLiq > bestLiq ? current : best
    })

    const price = Number.parseFloat(bestPair.priceUsd || "0")
    const liquidity = Number.parseFloat(bestPair.liquidity?.usd || "0")

    // Creator coins typically have "ZORA" or creator-related info in the pair
    // and have reasonable liquidity
    const isCreatorCoin = liquidity > 0 && price > 0

    return { price, liquidity, isCreatorCoin }
  } catch (error) {
    console.error(`[v0] Error fetching Dexscreener price for ${tokenAddress}:`, error)
    return { price: 0, liquidity: 0, isCreatorCoin: false }
  }
}

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    console.log("[v0] Fetching profile data for address:", address)

    const profileData = await getCreatorProfileBalances(address)

    if (!profileData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    console.log("[v0] Fetching Dexscreener prices for", profileData.holdings.length, "coins")

    const pricePromises = profileData.holdings.map((holding: any) => fetchDexscreenerPrice(holding.coin.address))
    const priceData = await Promise.all(pricePromises)

    const holdingsWithUsdValue = profileData.holdings
      .map((holding: any, index: number) => {
        const { price, liquidity, isCreatorCoin } = priceData[index]

        const rawBalance = Number.parseFloat(holding.balance || "0")
        const adjustedBalance = rawBalance / Math.pow(10, TOKEN_DECIMALS)
        const usdValue = adjustedBalance * price

        console.log(
          `[v0] ${holding.coin.symbol}: rawBalance=${rawBalance}, adjustedBalance=${adjustedBalance.toFixed(6)}, price=$${price}, liquidity=$${liquidity.toFixed(2)}, value=$${usdValue.toFixed(2)}, isCreatorCoin=${isCreatorCoin}`,
        )

        return {
          coin: {
            address: holding.coin.address,
            name: holding.coin.name,
            symbol: holding.coin.symbol,
            image: holding.coin.image || "", // Preserve image from Zora SDK
          },
          balance: adjustedBalance,
          price,
          liquidity,
          usdValue,
          isCreatorCoin,
        }
      })
      .filter((holding: any) => {
        const meetsLiquidityThreshold = holding.liquidity >= MIN_LIQUIDITY_USD
        const isValidCreatorCoin = holding.isCreatorCoin && holding.price > 0

        if (!meetsLiquidityThreshold || !isValidCreatorCoin) {
          console.log(
            `[v0] Filtering out ${holding.coin.symbol}: liquidity=$${holding.liquidity.toFixed(2)}, isCreatorCoin=${holding.isCreatorCoin}`,
          )
        }

        return meetsLiquidityThreshold && isValidCreatorCoin
      })

    const totalPortfolioValue = holdingsWithUsdValue.reduce((sum: number, holding: any) => sum + holding.usdValue, 0)

    console.log(`[v0] Total portfolio value (filtered): $${totalPortfolioValue.toFixed(2)}`)
    console.log(
      `[v0] Showing ${holdingsWithUsdValue.length} of ${profileData.holdingsCount} holdings (filtered for creator coins with liquidity > $${MIN_LIQUIDITY_USD})`,
    )

    return NextResponse.json({
      success: true,
      profile: {
        ...profileData,
        holdings: holdingsWithUsdValue,
        totalPortfolioValue,
        holdingsCount: holdingsWithUsdValue.length,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error in profile API route:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch profile data" }, { status: 500 })
  }
}
