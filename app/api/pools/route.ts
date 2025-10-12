import { NextResponse } from "next/server"
import { fetchDexscreenerPools, type PoolData } from "@/lib/pool-data"

export const dynamic = "force-dynamic"

interface PoolsResponse {
  pools: PoolData[]
  totalCount: number
  page: number
  limit: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const sortBy = searchParams.get("sortBy") || "netApy"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const filterDeusOnly = searchParams.get("deusOnly") === "true"
    const minTvl = Number.parseFloat(searchParams.get("minTvl") || "0")
    const minVolume = Number.parseFloat(searchParams.get("minVolume") || "0")
    const poolType = searchParams.get("poolType")
    const priorityDexOnly = searchParams.get("priorityDexOnly") === "true"

    let pools = await fetchDexscreenerPools()

    // Apply filters
    if (filterDeusOnly) {
      pools = pools.filter((pool) => pool.isDeusPool)
    }

    if (minTvl > 0) {
      pools = pools.filter((pool) => pool.liquidity >= minTvl)
    }

    if (minVolume > 0) {
      pools = pools.filter((pool) => pool.volume24h >= minVolume)
    }

    if (poolType && poolType !== "all") {
      pools = pools.filter((pool) => pool.poolType === poolType)
    }

    if (priorityDexOnly) {
      pools = pools.filter(
        (pool) => pool.dexId.toLowerCase().includes("uniswap") || pool.dexId.toLowerCase().includes("aerodrome"),
      )
    }

    const getDexPriority = (dexId: string): number => {
      const dex = dexId.toLowerCase()
      if (dex.includes("uniswap")) return 100
      if (dex.includes("aerodrome")) return 90
      return 0
    }

    // Apply sorting with DEX priority
    pools.sort((a, b) => {
      const priorityDiff = getDexPriority(b.dexId) - getDexPriority(a.dexId)
      if (priorityDiff !== 0) return priorityDiff

      // Then sort by selected metric
      let aVal: number, bVal: number

      switch (sortBy) {
        case "feeApr":
          aVal = a.feeApr
          bVal = b.feeApr
          break
        case "volume24h":
          aVal = a.volume24h
          bVal = b.volume24h
          break
        case "liquidity":
          aVal = a.liquidity
          bVal = b.liquidity
          break
        case "volatility":
          aVal = a.volatility
          bVal = b.volatility
          break
        case "netApy":
        default:
          aVal = a.netApy
          bVal = b.netApy
          break
      }

      return sortOrder === "desc" ? bVal - aVal : aVal - bVal
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedPools = pools.slice(startIndex, startIndex + limit)

    const response: PoolsResponse = {
      pools: paginatedPools,
      totalCount: pools.length,
      page,
      limit,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in pools API:", error)
    return NextResponse.json({ pools: [], totalCount: 0, page: 1, limit: 20 }, { status: 500 })
  }
}
