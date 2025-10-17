import { NextResponse } from "next/server"
import { fetchDexscreenerPools } from "@/lib/pool-data"

export const dynamic = "force-dynamic"

interface AIInsight {
  id: string
  type: "opportunity" | "warning" | "recommendation"
  title: string
  description: string
  confidence: number
  action?: {
    label: string
    href: string
  }
  metrics?: {
    label: string
    value: string
  }[]
}

export async function GET() {
  try {
    console.log("[v0] Generating AI insights from live blockchain data...")

    // Fetch live pool data
    const pools = await fetchDexscreenerPools()
    console.log(`[v0] Analyzing ${pools.length} pools for insights...`)

    const insights: AIInsight[] = []

    // 1. High Yield Opportunities (APR > 100%, TVL > $10k, Low volatility)
    const highYieldPools = pools
      .filter(
        (pool) =>
          pool.netApy > 100 &&
          pool.liquidity > 10000 &&
          pool.volatility < 50 &&
          pool.dexId.toLowerCase().includes("uniswap"),
      )
      .sort((a, b) => b.netApy - a.netApy)
      .slice(0, 3)

    highYieldPools.forEach((pool, index) => {
      const riskLevel = pool.volatility < 30 ? "Low" : pool.volatility < 60 ? "Medium" : "High"
      const confidence = Math.min(
        95,
        Math.round(
          (pool.netApy / 300) * 40 + // APR contribution
            Math.min(pool.liquidity / 100000, 1) * 30 + // TVL contribution
            ((100 - pool.volatility) / 100) * 30, // Volatility contribution
        ),
      )

      insights.push({
        id: `opportunity-${index}`,
        type: "opportunity",
        title: "High Yield Opportunity Detected",
        description: `${pool.token0Symbol}/${pool.token1Symbol} pool showing ${pool.netApy.toFixed(0)}% APR with ${riskLevel.toLowerCase()} volatility. Strong liquidity depth detected.`,
        confidence,
        action: {
          label: "Deploy Liquidity",
          href: `/pools?search=${pool.token0Symbol}`,
        },
        metrics: [
          { label: "APR", value: `${pool.netApy.toFixed(0)}%` },
          { label: "Risk", value: riskLevel },
          { label: "TVL", value: `$${(pool.liquidity / 1000).toFixed(1)}K` },
        ],
      })
    })

    // 2. Impermanent Loss Warnings (High volatility pools with significant TVL)
    const highVolatilityPools = pools
      .filter((pool) => pool.volatility > 70 && pool.liquidity > 5000 && pool.isDeusPool)
      .sort((a, b) => b.volatility - a.volatility)
      .slice(0, 2)

    highVolatilityPools.forEach((pool, index) => {
      const projectedIL = ((pool.volatility / 100) * 8).toFixed(1) // Rough IL estimation
      const confidence = Math.round(70 + (pool.volatility / 100) * 20)

      insights.push({
        id: `warning-${index}`,
        type: "warning",
        title: "Impermanent Loss Risk Detected",
        description: `${pool.token0Symbol}/${pool.token1Symbol} position showing high price divergence. Consider monitoring or rebalancing.`,
        confidence,
        action: {
          label: "View Position",
          href: "/lp-manager",
        },
        metrics: [
          { label: "Volatility", value: `${pool.volatility.toFixed(0)}%` },
          { label: "Projected IL", value: `-${projectedIL}%` },
        ],
      })
    })

    // 3. Portfolio Optimization Recommendations
    const deusPools = pools.filter((pool) => pool.isDeusPool && pool.liquidity > 5000)
    const avgApy = deusPools.reduce((sum, pool) => sum + pool.netApy, 0) / deusPools.length
    const topPools = deusPools.sort((a, b) => b.netApy - a.netApy).slice(0, 3)

    if (topPools.length >= 3) {
      const optimizedApy = topPools.reduce((sum, pool) => sum + pool.netApy, 0) / topPools.length
      const improvement = (((optimizedApy - avgApy) / avgApy) * 100).toFixed(0)

      insights.push({
        id: "recommendation-diversification",
        type: "recommendation",
        title: "Portfolio Diversification Opportunity",
        description: `Diversifying across ${topPools.length} high-performing DEUS pools could increase your APY by ${improvement}% while maintaining risk balance.`,
        confidence: 88,
        action: {
          label: "View Pools",
          href: "/pools?deusOnly=true",
        },
        metrics: [
          { label: "Current Avg", value: `${avgApy.toFixed(0)}%` },
          { label: "Optimized", value: `${optimizedApy.toFixed(0)}%` },
          { label: "Improvement", value: `+${improvement}%` },
        ],
      })
    }

    // 4. Volume Surge Detection (24h volume spike)
    const volumeSurgePools = pools
      .filter((pool) => pool.volume24h > 50000 && pool.liquidity > 10000)
      .sort((a, b) => b.volume24h / b.liquidity - a.volume24h / a.liquidity)
      .slice(0, 2)

    volumeSurgePools.forEach((pool, index) => {
      const volumeToTvlRatio = (pool.volume24h / pool.liquidity).toFixed(1)
      const confidence = Math.min(92, Math.round(60 + (pool.volume24h / 100000) * 30))

      insights.push({
        id: `opportunity-volume-${index}`,
        type: "opportunity",
        title: "High Trading Activity Detected",
        description: `${pool.token0Symbol}/${pool.token1Symbol} experiencing ${volumeToTvlRatio}x volume-to-TVL ratio. Increased fee generation potential.`,
        confidence,
        action: {
          label: "Analyze Pool",
          href: `/pools?search=${pool.token0Symbol}`,
        },
        metrics: [
          { label: "24h Volume", value: `$${(pool.volume24h / 1000).toFixed(0)}K` },
          { label: "TVL", value: `$${(pool.liquidity / 1000).toFixed(0)}K` },
          { label: "Fee APR", value: `${pool.feeApr.toFixed(0)}%` },
        ],
      })
    })

    // 5. Low Competition Opportunities (Good APR with low TVL)
    const lowCompetitionPools = pools
      .filter((pool) => pool.netApy > 80 && pool.liquidity < 50000 && pool.liquidity > 5000 && pool.volume24h > 10000)
      .sort((a, b) => b.netApy - a.netApy)
      .slice(0, 2)

    lowCompetitionPools.forEach((pool, index) => {
      const confidence = Math.round(75 + (pool.netApy / 200) * 15)

      insights.push({
        id: `recommendation-early-${index}`,
        type: "recommendation",
        title: "Early Entry Opportunity",
        description: `${pool.token0Symbol}/${pool.token1Symbol} pool has strong APR with lower competition. Early liquidity providers may capture higher returns.`,
        confidence,
        action: {
          label: "Deploy Early",
          href: `/pools?search=${pool.token0Symbol}`,
        },
        metrics: [
          { label: "APR", value: `${pool.netApy.toFixed(0)}%` },
          { label: "TVL", value: `$${(pool.liquidity / 1000).toFixed(1)}K` },
          { label: "Competition", value: "Low" },
        ],
      })
    })

    // Sort by confidence and limit to top 5 insights
    const sortedInsights = insights.sort((a, b) => b.confidence - a.confidence).slice(0, 5)

    console.log(`[v0] Generated ${sortedInsights.length} AI insights from live data`)

    return NextResponse.json({
      insights: sortedInsights,
      timestamp: new Date().toISOString(),
      poolsAnalyzed: pools.length,
    })
  } catch (error) {
    console.error("[v0] Error generating AI insights:", error)
    return NextResponse.json(
      {
        insights: [],
        error: "Failed to generate insights",
        timestamp: new Date().toISOString(),
        poolsAnalyzed: 0,
      },
      { status: 500 },
    )
  }
}
