import { type NextRequest, NextResponse } from "next/server"
import { rpcCall } from "@/lib/rpc-config"

interface LPPosition {
  id: string
  tokenId?: number
  poolId: string
  pairAddress: string
  baseToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  quoteToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  dexId: string
  poolType: "v3" | "xlp" | "v2" | "v4"
  isDeusPool: boolean
  feeTier: string
  liquidityTokens: number
  totalValue: number
  initialValue: number
  currentApr: number
  feesEarned: number
  impermanentLoss: number
  netPnl: number
  poolShare: number
  entryDate: string
  lastUpdated: string
  tickLower?: number
  tickUpper?: number
  inRange?: boolean
}

interface LPManagerResponse {
  positions: LPPosition[]
  totalValue: number
  totalPnl: number
  totalFeesEarned: number
  positionCount: number
}

const DEUS_TOKEN_ADDRESS = "0x73582df1cad3187cD0746b7A473d65c06386837e" // Fixed DEUS token address
const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1"
const UNISWAP_V3_FACTORY = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD"

const TOKEN_METADATA: Record<string, { symbol: string; name: string; decimals: number }> = {
  "0x4200000000000000000000000000000000000006": { symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": { symbol: "USDC", name: "USD Coin", decimals: 6 },
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": { symbol: "DAI", name: "Dai Stablecoin", decimals: 18 },
  [DEUS_TOKEN_ADDRESS]: { symbol: "DEUS", name: "DEUS Finance", decimals: 18 },
}

async function getTokenMetadata(tokenAddress: string): Promise<{ symbol: string; name: string; decimals: number }> {
  try {
    // Check cache first
    if (TOKEN_METADATA[tokenAddress.toLowerCase()]) {
      return TOKEN_METADATA[tokenAddress.toLowerCase()]
    }

    console.log("[v0] Fetching token metadata for:", tokenAddress)

    // Fetch symbol, name, and decimals in parallel using BlastAPI
    const [symbolResult, nameResult, decimalsResult] = await Promise.all([
      rpcCall("eth_call", [{ to: tokenAddress, data: "0x95d89b41" }, "latest"]).catch(() => "0x"), // symbol()
      rpcCall("eth_call", [{ to: tokenAddress, data: "0x06fdde03" }, "latest"]).catch(() => "0x"), // name()
      rpcCall("eth_call", [{ to: tokenAddress, data: "0x313ce567" }, "latest"]).catch(() => "0x12"), // decimals()
    ])

    // Parse results
    const symbol = symbolResult !== "0x" ? parseString(symbolResult) : "UNKNOWN"
    const name = nameResult !== "0x" ? parseString(nameResult) : "Unknown Token"
    const decimals = decimalsResult !== "0x" ? Number.parseInt(decimalsResult, 16) : 18

    return { symbol, name, decimals }
  } catch (error) {
    console.error("[v0] Error fetching token metadata:", error)
    return { symbol: "UNKNOWN", name: "Unknown Token", decimals: 18 }
  }
}

function parseString(hex: string): string {
  try {
    const cleanHex = hex.slice(2)
    const length = Number.parseInt(cleanHex.slice(64, 128), 16)
    const data = cleanHex.slice(128, 128 + length * 2)
    return Buffer.from(data, "hex").toString("utf8").replace(/\0/g, "")
  } catch {
    return "UNKNOWN"
  }
}

async function getTokenPrice(tokenAddress: string): Promise<number> {
  try {
    if (tokenAddress.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()) {
      const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "http://localhost:3000"
      const response = await fetch(`${baseUrl}/api/deus/ticker`, {
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()
      return data.priceUsd || 0.00004877 // Use priceUsd field
    }

    if (tokenAddress.toLowerCase() === "0x4200000000000000000000000000000000000006") {
      // WETH - fetch ETH price
      const response = await fetch(
        "https://api.dexscreener.com/latest/dex/tokens/0x4200000000000000000000000000000000000006",
      )
      const data = await response.json()
      if (data.pairs && data.pairs.length > 0) {
        return Number.parseFloat(data.pairs[0].priceUsd) || 3200
      }
    }

    // Default prices for common tokens
    const defaultPrices: Record<string, number> = {
      "0x4200000000000000000000000000000000000006": 3200, // WETH
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": 1.0, // USDC
      "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": 1.0, // DAI
    }

    return defaultPrices[tokenAddress.toLowerCase()] || 0
  } catch (error) {
    console.error("[v0] Error fetching token price:", error)
    return tokenAddress.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase() ? 0.00004877 : 0
  }
}

async function fetchV3Positions(address: string): Promise<LPPosition[]> {
  try {
    console.log("[v0] Fetching V3 positions for:", address)

    // Step 1: Get balance of position NFTs
    const balanceData = await rpcCall("eth_call", [
      {
        to: UNISWAP_V3_POSITION_MANAGER,
        data: `0x70a08231${address.slice(2).padStart(64, "0")}`, // balanceOf(address)
      },
      "latest",
    ])

    const balance = Number.parseInt(balanceData, 16)
    console.log("[v0] User has", balance, "V3 position NFTs")

    if (balance === 0) {
      return []
    }

    const positions: LPPosition[] = []

    // Step 2: Get token IDs for each position
    for (let i = 0; i < Math.min(balance, 20); i++) {
      try {
        // Get token ID by index
        const tokenIdData = await rpcCall("eth_call", [
          {
            to: UNISWAP_V3_POSITION_MANAGER,
            data: `0x2f745c59${address.slice(2).padStart(64, "0")}${i.toString(16).padStart(64, "0")}`, // tokenOfOwnerByIndex(address, index)
          },
          "latest",
        ])

        const tokenId = Number.parseInt(tokenIdData, 16)
        console.log("[v0] Processing position NFT #", i, "- Token ID:", tokenId)

        // Step 3: Get position details
        const positionData = await rpcCall("eth_call", [
          {
            to: UNISWAP_V3_POSITION_MANAGER,
            data: `0x99fbab88${tokenId.toString(16).padStart(64, "0")}`, // positions(uint256)
          },
          "latest",
        ])

        if (!positionData || positionData === "0x") {
          console.log("[v0] No position data for token ID:", tokenId)
          continue
        }

        // Parse position data
        const cleanData = positionData.slice(2)
        const token0 = "0x" + cleanData.slice(88, 128)
        const token1 = "0x" + cleanData.slice(152, 192)
        const fee = Number.parseInt(cleanData.slice(192, 200), 16)
        const tickLowerHex = cleanData.slice(200, 208)
        const tickUpperHex = cleanData.slice(208, 216)
        const tickLower =
          Number.parseInt(tickLowerHex, 16) > 0x7fffffff
            ? Number.parseInt(tickLowerHex, 16) - 0x100000000
            : Number.parseInt(tickLowerHex, 16)
        const tickUpper =
          Number.parseInt(tickUpperHex, 16) > 0x7fffffff
            ? Number.parseInt(tickUpperHex, 16) - 0x100000000
            : Number.parseInt(tickUpperHex, 16)
        const liquidity = "0x" + cleanData.slice(216, 248)
        const tokensOwed0 = "0x" + cleanData.slice(376, 408)
        const tokensOwed1 = "0x" + cleanData.slice(408, 440)

        // Skip if liquidity is 0 (closed position)
        if (BigInt(liquidity) === 0n) {
          console.log("[v0] Position", tokenId, "has zero liquidity (closed)")
          continue
        }

        console.log("[v0] Position", tokenId, "details:", {
          token0: token0.slice(0, 10) + "...",
          token1: token1.slice(0, 10) + "...",
          fee,
          tickLower,
          tickUpper,
          liquidity,
        })

        // Step 4: Get pool address and current tick
        const poolAddressData = await rpcCall("eth_call", [
          {
            to: UNISWAP_V3_FACTORY,
            data: `0x1698ee82${token0.slice(2).padStart(64, "0")}${token1.slice(2).padStart(64, "0")}${fee.toString(16).padStart(64, "0")}`, // getPool(token0, token1, fee)
          },
          "latest",
        ])

        const poolAddress = "0x" + poolAddressData.slice(-40)

        if (poolAddress === "0x0000000000000000000000000000000000000000") {
          console.log("[v0] Pool not found for position", tokenId)
          continue
        }

        // Get pool slot0 (current tick and sqrtPriceX96)
        const slot0Data = await rpcCall("eth_call", [
          {
            to: poolAddress,
            data: "0x3850c7bd", // slot0()
          },
          "latest",
        ])

        const slot0Clean = slot0Data.slice(2)
        const sqrtPriceX96 = "0x" + slot0Clean.slice(0, 64)
        const tickHex = slot0Clean.slice(64, 128)
        const currentTick =
          Number.parseInt(tickHex, 16) > 0x7fffffffffffffffffffffffffffffff
            ? Number.parseInt(tickHex, 16) - 0x100000000000000000000000000000000
            : Number.parseInt(tickHex, 16)

        const inRange = currentTick >= tickLower && currentTick < tickUpper

        console.log("[v0] Pool state:", { currentTick, tickLower, tickUpper, inRange })

        // Step 5: Calculate token amounts
        const liquidityBigInt = BigInt(liquidity)
        const sqrtPriceX96BigInt = BigInt(sqrtPriceX96)
        const sqrtPriceLower = BigInt(Math.floor(Math.pow(1.0001, tickLower / 2) * Math.pow(2, 96)))
        const sqrtPriceUpper = BigInt(Math.floor(Math.pow(1.0001, tickUpper / 2) * Math.pow(2, 96)))

        let amount0 = 0
        let amount1 = 0

        if (currentTick < tickLower) {
          // Position entirely in token0
          const amt0 = Number((liquidityBigInt * (sqrtPriceUpper - sqrtPriceLower)) / sqrtPriceUpper / sqrtPriceLower)
          amount0 = amt0 / 1e18
        } else if (currentTick >= tickUpper) {
          // Position entirely in token1
          const amt1 = Number(liquidityBigInt * (sqrtPriceUpper - sqrtPriceLower))
          amount1 = amt1 / 1e18 / Math.pow(2, 96)
        } else {
          // Position in range
          const amt0 = Number(
            (liquidityBigInt * (sqrtPriceUpper - sqrtPriceX96BigInt)) / sqrtPriceUpper / sqrtPriceX96BigInt,
          )
          const amt1 = Number(liquidityBigInt * (sqrtPriceX96BigInt - sqrtPriceLower))
          amount0 = amt0 / 1e18
          amount1 = amt1 / 1e18 / Math.pow(2, 96)
        }

        // Add uncollected fees
        amount0 += Number(BigInt(tokensOwed0)) / 1e18
        amount1 += Number(BigInt(tokensOwed1)) / 1e18

        // Step 6: Get token metadata and prices
        const [token0Meta, token1Meta, token0Price, token1Price] = await Promise.all([
          getTokenMetadata(token0),
          getTokenMetadata(token1),
          getTokenPrice(token0),
          getTokenPrice(token1),
        ])

        // Adjust amounts for token decimals
        amount0 = amount0 * Math.pow(10, 18 - token0Meta.decimals)
        amount1 = amount1 * Math.pow(10, 18 - token1Meta.decimals)

        const totalValue = amount0 * token0Price + amount1 * token1Price
        const feesEarned =
          (Number(BigInt(tokensOwed0)) / 1e18) * token0Price + (Number(BigInt(tokensOwed1)) / 1e18) * token1Price
        const initialValue = totalValue - feesEarned
        const netPnl = totalValue - initialValue

        const isDeusPool =
          token0.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase() ||
          token1.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()

        positions.push({
          id: `uniswap-v3-${tokenId}`,
          tokenId,
          poolId: `${token0Meta.symbol}/${token1Meta.symbol}-${(fee / 10000).toFixed(2)}%`,
          pairAddress: poolAddress,
          baseToken: {
            address: token0,
            symbol: token0Meta.symbol,
            name: token0Meta.name,
            amount: amount0,
            value: amount0 * token0Price,
          },
          quoteToken: {
            address: token1,
            symbol: token1Meta.symbol,
            name: token1Meta.name,
            amount: amount1,
            value: amount1 * token1Price,
          },
          dexId: "Uniswap V3",
          poolType: "v3",
          isDeusPool,
          feeTier: `${(fee / 10000).toFixed(2)}%`,
          liquidityTokens: Number(liquidityBigInt / BigInt(1e15)) / 1000,
          totalValue,
          initialValue,
          currentApr: 0, // Would need historical data to calculate
          feesEarned,
          impermanentLoss: 0, // Would need entry price to calculate
          netPnl,
          poolShare: 0, // Would need total pool liquidity to calculate
          entryDate: new Date().toISOString(), // Would need to fetch from events
          lastUpdated: new Date().toISOString(),
          tickLower,
          tickUpper,
          inRange,
        })

        console.log("[v0] Successfully processed position", tokenId, "- Total value:", totalValue)
      } catch (error) {
        console.error("[v0] Error processing position NFT #", i, ":", error)
      }
    }

    return positions
  } catch (error) {
    console.error("[v0] Error fetching V3 positions:", error)
    return []
  }
}

async function fetchV2Positions(address: string): Promise<LPPosition[]> {
  // V2 positions are rare on Base, focusing on V3 for now
  return []
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } | Promise<{ address: string }> },
) {
  try {
    console.log("[v0] LP Manager API called")

    const resolvedParams = params instanceof Promise ? await params : params
    const { address } = resolvedParams

    if (!address) {
      console.log("[v0] LP Manager API error: No address provided")
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    console.log("[v0] LP Manager API processing address:", address)
    console.log("[v0] ALCHEMY_API_KEY present:", !!process.env.ALCHEMY_API_KEY)

    const [v2Positions, v3Positions] = await Promise.all([fetchV2Positions(address), fetchV3Positions(address)])

    console.log("[v0] Found V2 positions:", v2Positions.length)
    console.log("[v0] Found V3 positions:", v3Positions.length)

    const allPositions = [...v2Positions, ...v3Positions]

    const totalValue = allPositions.reduce((sum, p) => sum + p.totalValue, 0)
    const totalPnl = allPositions.reduce((sum, p) => sum + p.netPnl, 0)
    const totalFeesEarned = allPositions.reduce((sum, p) => sum + p.feesEarned, 0)

    const response: LPManagerResponse = {
      positions: allPositions,
      totalValue,
      totalPnl,
      totalFeesEarned,
      positionCount: allPositions.length,
    }

    console.log("[v0] LP Manager API response:", {
      positionCount: response.positionCount,
      totalValue: response.totalValue,
      totalPnl: response.totalPnl,
      v2Count: v2Positions.length,
      v3Count: v3Positions.length,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] LP Manager API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error("[v0] Error details:", { message: errorMessage, stack: errorStack })

    return NextResponse.json(
      {
        error: "Failed to fetch LP positions",
        details: errorMessage,
        positions: [],
        totalValue: 0,
        totalPnl: 0,
        totalFeesEarned: 0,
        positionCount: 0,
      },
      { status: 200 }, // Return 200 with error details instead of 500
    )
  }
}
