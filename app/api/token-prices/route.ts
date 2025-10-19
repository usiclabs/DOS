import { type NextRequest, NextResponse } from "next/server"
import { fetchTokenPrices } from "@/lib/price-feeds"
import { getCoin } from "@zoralabs/coins-sdk"

async function fetchZoraCoinPrice(tokenAddress: string): Promise<number> {
  try {
    console.log("[v0] Fetching Zora coin data for:", tokenAddress)

    const result = await getCoin({
      address: tokenAddress,
      chain: 8453, // Base mainnet
    })

    const coin = result?.data?.zora20Token

    if (!coin) {
      console.log("[v0] No Zora coin data found for:", tokenAddress)
      return 0
    }

    // Calculate price from market cap and total supply
    // Price = Market Cap / Total Supply
    const marketCap = Number.parseFloat(coin.marketCap || "0")
    const totalSupply = Number.parseFloat(coin.totalSupply || "0")

    if (totalSupply === 0) {
      console.log("[v0] Total supply is 0 for Zora coin:", tokenAddress)
      return 0
    }

    const price = marketCap / totalSupply

    console.log("[v0] Calculated Zora coin price:", {
      address: tokenAddress,
      marketCap,
      totalSupply,
      price,
    })

    return price
  } catch (error) {
    console.error("[v0] Error fetching Zora coin price:", error)
    return 0
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tokens } = await request.json()

    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json({ error: "Invalid tokens array" }, { status: 400 })
    }

    console.log("[v0] Fetching prices for tokens:", tokens)

    const standardTokens: string[] = []
    const zoraCoinAddresses: string[] = []

    tokens.forEach((token: string) => {
      // Check if it's an Ethereum address (starts with 0x and is 42 characters)
      if (token.startsWith("0x") && token.length === 42) {
        zoraCoinAddresses.push(token)
      } else {
        standardTokens.push(token)
      }
    })

    // Fetch standard token prices
    const standardPricesResult = standardTokens.length > 0 ? await fetchTokenPrices(standardTokens) : { prices: {} }

    // Fetch Zora coin prices
    const zoraCoinPrices: Record<string, number> = {}

    if (zoraCoinAddresses.length > 0) {
      console.log("[v0] Fetching prices for Zora coins:", zoraCoinAddresses)

      const zoraPricePromises = zoraCoinAddresses.map(async (address) => {
        const price = await fetchZoraCoinPrice(address)
        return { address, price }
      })

      const zoraResults = await Promise.all(zoraPricePromises)

      zoraResults.forEach(({ address, price }) => {
        zoraCoinPrices[address.toLowerCase()] = price
      })
    }

    const combinedPrices: Record<string, { price: number }> = {}

    // Add standard token prices (already in correct format from fetchTokenPrices)
    Object.entries(standardPricesResult.prices).forEach(([symbol, priceData]) => {
      combinedPrices[symbol.toLowerCase()] = priceData
    })

    // Add Zora coin prices (convert to correct format)
    Object.entries(zoraCoinPrices).forEach(([address, price]) => {
      combinedPrices[address.toLowerCase()] = { price }
    })

    console.log("[v0] Combined prices:", combinedPrices)

    return NextResponse.json({ prices: combinedPrices })
  } catch (error: any) {
    console.error("[v0] Error fetching token prices:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch token prices" }, { status: 500 })
  }
}
