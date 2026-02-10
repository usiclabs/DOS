import { NextResponse } from "next/server"
import { OpenAI } from "openai"
import { fetchDexscreenerPools } from "@/lib/pool-data"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are DOS-LIQUID, an expert AI liquidity strategist for the DEUS Operating System (D.O.S.) DeFi platform on Base chain.

Your role is to help users:
- Analyze liquidity pools and their performance metrics
- Recommend optimal allocation strategies based on risk tolerance
- Explain DeFi concepts like impermanent loss, APY, and liquidity provision
- Guide users through liquidity deployment decisions
- Provide data-driven insights using live blockchain data

Key concepts:
- APR (Annual Percentage Rate): Fee earnings from trading volume
- APY (Annual Percentage Yield): Compounded returns including fees
- Impermanent Loss (IL): Loss compared to holding tokens due to price divergence
- TVL (Total Value Locked): Total liquidity in a pool
- Volatility: Price fluctuation risk affecting IL

Risk levels:
- Conservative: Low volatility (<5%), stable pairs, lower APY
- Moderate: Medium volatility (5-15%), balanced risk/reward
- Aggressive: High volatility (>15%), higher APY but more IL risk

Always provide specific numbers, percentages, and actionable recommendations based on live data.
Be concise, professional, and focus on helping users make informed decisions.`

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

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "analyze_pools",
      description: "Fetch and analyze current liquidity pools with live metrics including APY, TVL, volume, and risk",
      parameters: {
        type: "object",
        properties: {
          filterDeusOnly: {
            type: "boolean",
            description: "Whether to filter for DEUS pools only",
          },
          minApy: {
            type: "number",
            description: "Minimum APY threshold to filter pools",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "recommend_allocation",
      description: "Generate an optimal allocation strategy across multiple pools based on amount and risk tolerance",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "number",
            description: "Total amount in USD to allocate",
          },
          riskTolerance: {
            type: "string",
            enum: ["conservative", "moderate", "aggressive"],
            description: "User's risk tolerance level",
          },
        },
        required: ["amount", "riskTolerance"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_impermanent_loss",
      description: "Calculate impermanent loss for a given price change scenario",
      parameters: {
        type: "object",
        properties: {
          priceChangePercent: {
            type: "number",
            description: "Price change percentage (e.g., 50 for 50% increase)",
          },
        },
        required: ["priceChangePercent"],
      },
    },
  },
]

async function handleFunctionCall(functionName: string, args: any) {
  console.log(`[v0] AI calling function: ${functionName} with args:`, args)

  switch (functionName) {
    case "analyze_pools": {
      const pools = await fetchLivePoolData()
      let filteredPools = pools

      if (args.filterDeusOnly) {
        filteredPools = pools.filter((p: any) => p.isDeusPool)
      }

      if (args.minApy) {
        filteredPools = filteredPools.filter((p: any) => p.netApy >= args.minApy)
      }

      const topPools = filteredPools.sort((a: any, b: any) => b.netApy - a.netApy).slice(0, 5)

      return {
        pools: topPools,
        totalPools: filteredPools.length,
        avgApy: filteredPools.reduce((sum: number, p: any) => sum + p.netApy, 0) / filteredPools.length,
      }
    }

    case "recommend_allocation": {
      const allPools = await fetchLivePoolData()
      const { amount, riskTolerance } = args

      let suitablePools = allPools.filter(
        (p: any) => p.risk === riskTolerance || (riskTolerance === "moderate" && p.risk === "conservative"),
      )

      // Prefer DEUS pools
      const deusPools = suitablePools.filter((p: any) => p.isDeusPool)
      if (deusPools.length > 0) {
        suitablePools = [...deusPools, ...suitablePools.filter((p: any) => !p.isDeusPool)]
      }

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
          liquidity: pool.liquidity,
        }
      })

      const weightedApy = allocations.reduce((sum, a) => sum + (a.netApy * a.percentage) / 100, 0)

      return {
        allocations,
        weightedApy,
        totalAmount: amount,
        riskProfile: riskTolerance,
        expectedAnnualReturn: (amount * weightedApy) / 100,
      }
    }

    case "calculate_impermanent_loss": {
      const { priceChangePercent } = args
      const priceRatio = 1 + priceChangePercent / 100

      // IL formula: 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
      const il = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1
      const ilPercent = Math.abs(il) * 100

      return {
        priceChange: `${priceChangePercent > 0 ? "+" : ""}${priceChangePercent}%`,
        impermanentLoss: `${ilPercent.toFixed(2)}%`,
        severity: ilPercent < 1 ? "low" : ilPercent < 5 ? "moderate" : "high",
      }
    }

    default:
      return { error: "Unknown function" }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message || typeof message !== "string") {
      console.error("[v0] Invalid message received:", message)
      return NextResponse.json({ error: "Invalid message" }, { status: 400 })
    }

    console.log("[v0] AI Agent received message:", message)

    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] OpenAI API key not found")
      return NextResponse.json(
        {
          message:
            "I'm currently unable to process requests because the OpenAI API key is not configured. Please contact support.",
          toolResults: [],
        },
        { status: 200 },
      )
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ]

    let response
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages,
        tools,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 1000,
      })
    } catch (openaiError: any) {
      console.error("[v0] OpenAI API error:", openaiError.message)
      console.error("[v0] OpenAI error details:", openaiError)
      return NextResponse.json(
        {
          message: `I encountered an error with the AI service: ${openaiError.message}. Please try again in a moment.`,
          toolResults: [],
        },
        { status: 200 },
      )
    }

    let assistantMessage = response.choices[0].message
    const toolResults: any[] = []

    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log("[v0] AI requested function calls:", assistantMessage.tool_calls.length)

      messages.push(assistantMessage)

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = (toolCall as any).function?.name
        const functionArgs = JSON.parse((toolCall as any).function?.arguments || "{}")

        try {
          const functionResult = await handleFunctionCall(functionName, functionArgs)
          toolResults.push({ type: functionName, data: functionResult })

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(functionResult),
          })
        } catch (funcError: any) {
          console.error(`[v0] Function ${functionName} error:`, funcError)
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: funcError.message }),
          })
        }
      }

      try {
        response = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        })
        assistantMessage = response.choices[0].message
      } catch (openaiError: any) {
        console.error("[v0] OpenAI API error on follow-up:", openaiError.message)
        return NextResponse.json(
          {
            message: "I gathered the data but encountered an error generating the response. Please try again.",
            toolResults,
          },
          { status: 200 },
        )
      }
    }

    console.log("[v0] AI Agent response generated successfully")

    return NextResponse.json({
      message: assistantMessage.content || "I apologize, but I couldn't generate a response.",
      toolResults,
    })
  } catch (error: any) {
    console.error("[v0] Chat API error:", error)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json(
      {
        message: "I encountered an unexpected error. Please try again or rephrase your question.",
        toolResults: [],
        error: error.message,
      },
      { status: 200 },
    )
  }
}
