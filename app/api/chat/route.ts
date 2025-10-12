import { NextResponse } from "next/server"
import { fetchDexscreenerPools } from "@/lib/pool-data"

export const dynamic = "force-dynamic"
export const maxDuration = 30

async function fetchLivePoolData() {
  try {
    const pools = await fetchDexscreenerPools()

    return pools.map((pool) => ({
      id: pool.id,
      baseToken: pool.baseToken.symbol,
      quoteToken: pool.quoteToken.symbol,
      feeApr: pool.feeApr,
      netApy: pool.netApy,
      volatility: pool.volatility,
      liquidity: pool.liquidity,
      volume24h: pool.volume24h,
      isDeusPool: pool.isDeusPool,
      poolType: pool.poolType,
      risk: pool.volatility < 5 ? "conservative" : pool.volatility < 15 ? "moderate" : "aggressive",
    }))
  } catch (error) {
    console.error("[v0] Error fetching live pool data:", error)
    return []
  }
}

// Rule-based intent detection
function detectIntent(message: string) {
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes("analyze") ||
    lowerMessage.includes("performance") ||
    lowerMessage.includes("metrics") ||
    lowerMessage.includes("pools")
  ) {
    return "analyze_pools"
  }

  if (
    lowerMessage.includes("allocation") ||
    lowerMessage.includes("recommend") ||
    lowerMessage.includes("distribute") ||
    lowerMessage.includes("invest")
  ) {
    return "recommend_allocation"
  }

  if (
    lowerMessage.includes("impermanent loss") ||
    lowerMessage.includes("il") ||
    lowerMessage.includes("risk") ||
    lowerMessage.includes("explain")
  ) {
    return "explain_il"
  }

  if (lowerMessage.includes("apy") || lowerMessage.includes("high") || lowerMessage.includes("best")) {
    return "best_apy"
  }

  if (lowerMessage.includes("deploy") || lowerMessage.includes("add liquidity")) {
    return "deploy"
  }

  return "general"
}

// Extract parameters from message
function extractParameters(message: string) {
  const lowerMessage = message.toLowerCase()

  // Extract amount (e.g., "$10k", "10000", "10k")
  const amountMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d+)?)\s*k?/i)
  let amount = 10000 // default
  if (amountMatch) {
    amount = Number.parseFloat(amountMatch[1].replace(/,/g, ""))
    if (lowerMessage.includes("k") && amount < 1000) {
      amount *= 1000
    }
  }

  // Extract risk tolerance
  let riskTolerance: "conservative" | "moderate" | "aggressive" = "moderate"
  if (lowerMessage.includes("conservative") || lowerMessage.includes("safe") || lowerMessage.includes("low risk")) {
    riskTolerance = "conservative"
  } else if (lowerMessage.includes("aggressive") || lowerMessage.includes("high risk")) {
    riskTolerance = "aggressive"
  }

  return { amount, riskTolerance }
}

async function handleAnalyzePools() {
  const pools = await fetchLivePoolData()
  const deusPools = pools.filter((p: any) => p.isDeusPool)

  const topPools = pools.slice(0, 5)

  let response = "📊 **DEUS Pool Performance Analysis**\n\n"

  if (deusPools.length > 0) {
    response += `Found ${deusPools.length} DEUS pools with the following metrics:\n\n`
  }

  topPools.forEach((pool: any, index: number) => {
    response += `**${index + 1}. ${pool.baseToken}/${pool.quoteToken}**\n`
    response += `• Fee APR: ${pool.feeApr.toFixed(2)}%\n`
    response += `• Net APY: ${pool.netApy.toFixed(2)}%\n`
    response += `• Volatility: ${pool.volatility.toFixed(1)}% (${pool.risk})\n`
    response += `• Liquidity: $${(pool.liquidity / 1e6).toFixed(2)}M\n`
    response += `• 24h Volume: $${(pool.volume24h / 1e3).toFixed(0)}K\n\n`
  })

  response += "\n💡 **Key Insights:**\n"
  response += `• Highest APY: ${topPools[0]?.baseToken}/${topPools[0]?.quoteToken} at ${topPools[0]?.netApy.toFixed(1)}%\n`
  response += `• Most liquid: ${pools.sort((a: any, b: any) => b.liquidity - a.liquidity)[0]?.baseToken}/${pools.sort((a: any, b: any) => b.liquidity - a.liquidity)[0]?.quoteToken}\n`
  response += `• Lowest risk: ${pools.filter((p: any) => p.risk === "conservative")[0]?.baseToken}/${pools.filter((p: any) => p.risk === "conservative")[0]?.quoteToken}\n`

  return { message: response, toolResults: [{ type: "analyze", data: topPools }] }
}

async function handleRecommendAllocation(amount: number, riskTolerance: string) {
  const allPools = await fetchLivePoolData()
  let suitablePools = allPools.filter(
    (p: any) => p.risk === riskTolerance || (riskTolerance === "moderate" && p.risk === "conservative"),
  )

  // Prefer DEUS pools
  const deusPools = suitablePools.filter((p: any) => p.isDeusPool)
  if (deusPools.length > 0) {
    suitablePools = [...deusPools, ...suitablePools.filter((p: any) => !p.isDeusPool)]
  }

  // Sort by net APY
  suitablePools.sort((a: any, b: any) => b.netApy - a.netApy)

  const allocations = suitablePools.slice(0, 3).map((pool: any, index: number) => {
    const percentage = index === 0 ? 50 : index === 1 ? 30 : 20
    return {
      pool: `${pool.baseToken}/${pool.quoteToken}`,
      percentage,
      amount: (amount * percentage) / 100,
      expectedApr: pool.feeApr,
      netApy: pool.netApy,
      risk: pool.risk,
    }
  })

  const weightedApy = allocations.reduce((sum, a) => sum + (a.netApy * a.percentage) / 100, 0)

  let response = `💰 **Allocation Strategy for $${(amount / 1000).toFixed(1)}K (${riskTolerance})**\n\n`

  allocations.forEach((alloc, index) => {
    response += `**${index + 1}. ${alloc.pool}** - ${alloc.percentage}% ($${(alloc.amount / 1000).toFixed(1)}K)\n`
    response += `• Expected APR: ${alloc.expectedApr.toFixed(2)}%\n`
    response += `• Net APY: ${alloc.netApy.toFixed(2)}%\n`
    response += `• Risk Level: ${alloc.risk}\n\n`
  })

  response += `\n📈 **Portfolio Metrics:**\n`
  response += `• Weighted APY: ${weightedApy.toFixed(2)}%\n`
  response += `• Risk Profile: ${riskTolerance}\n`
  response += `• Diversification: ${allocations.length} pools\n`
  response += `• Expected Annual Return: $${((amount * weightedApy) / 100 / 1000).toFixed(2)}K\n`

  return { message: response, toolResults: [{ type: "allocation", data: allocations }] }
}

async function handleExplainIL() {
  const response = `📚 **Understanding Impermanent Loss (IL)**\n\n**What is IL?**\nImpermanent Loss occurs when the price ratio of your deposited tokens changes compared to when you deposited them. The bigger the change, the more IL you experience.\n\n**How it works:**\n• If you hold 1 ETH + 2000 USDC in a pool\n• ETH price doubles to $4000\n• The pool rebalances to ~0.707 ETH + 2828 USDC\n• You'd have more $ just holding = that's IL\n\n**IL by Price Change:**\n• 25% change: ~0.6% IL\n• 50% change: ~2.0% IL\n• 100% change: ~5.7% IL\n• 200% change: ~13.4% IL\n• 500% change: ~25.5% IL\n\n**Mitigation Strategies:**\n1. Choose stable pairs (USDC/USDT)\n2. Pick correlated assets (ETH/wstETH)\n3. Ensure fee APR > expected IL\n4. Use concentrated liquidity ranges\n5. Monitor and rebalance regularly\n\n💡 **Pro Tip:** IL is only "impermanent" if prices return to original ratio. Otherwise, it becomes permanent loss.`

  return { message: response, toolResults: [{ type: "education", topic: "impermanent_loss" }] }
}

async function handleBestAPY() {
  const pools = await fetchLivePoolData()
  const topAPY = pools.sort((a: any, b: any) => b.netApy - a.netApy).slice(0, 5)

  let response = `🚀 **Top 5 Pools by APY**\n\n`

  topAPY.forEach((pool: any, index: number) => {
    response += `**${index + 1}. ${pool.baseToken}/${pool.quoteToken}**\n`
    response += `• Net APY: ${pool.netApy.toFixed(2)}%\n`
    response += `• Fee APR: ${pool.feeApr.toFixed(2)}%\n`
    response += `• Risk: ${pool.risk}\n`
    response += `• Liquidity: $${(pool.liquidity / 1e6).toFixed(2)}M\n\n`
  })

  response += `\n⚠️ **Risk Warning:**\nHigher APY often means higher risk. Consider:\n• Volatility and IL risk\n• Liquidity depth\n• Token fundamentals\n• Smart contract audits\n\nBalance yield with risk tolerance!`

  return { message: response, toolResults: [{ type: "ranking", data: topAPY }] }
}

function handleGeneral() {
  const response = `👋 **Hello! I'm DOS-LIQUID, your AI liquidity strategist.**\n\nI can help you with:\n\n📊 **Pool Analysis**\n• Analyze DEUS pool performance\n• Compare metrics across pools\n• Identify best opportunities\n\n💰 **Allocation Strategy**\n• Recommend optimal allocations\n• Balance risk and return\n• Diversify across pools\n\n📚 **Education**\n• Explain impermanent loss\n• Understand fee mechanics\n• Learn risk management\n\n🚀 **Deployment**\n• Deploy liquidity with smart parameters\n• Optimize slippage settings\n• Maximize capital efficiency\n\nWhat would you like to know about DEUS liquidity strategies?`

  return { message: response, toolResults: [] }
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 })
    }

    // Detect intent and extract parameters
    const intent = detectIntent(message)
    const params = extractParameters(message)

    // Route to appropriate handler
    let result
    switch (intent) {
      case "analyze_pools":
        result = await handleAnalyzePools()
        break
      case "recommend_allocation":
        result = await handleRecommendAllocation(params.amount, params.riskTolerance)
        break
      case "explain_il":
        result = await handleExplainIL()
        break
      case "best_apy":
        result = await handleBestAPY()
        break
      case "general":
      default:
        result = handleGeneral()
        break
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        message: "I encountered an error processing your request. Please try again or rephrase your question.",
        toolResults: [],
      },
      { status: 200 },
    )
  }
}
