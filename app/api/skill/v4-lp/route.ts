import { NextRequest, NextResponse } from "next/server"
import {
  analyzePosition,
  collectFees,
  rebalancePosition,
  compoundFees,
  harvestClankerFees,
  executeAutoCompound,
  buyAndBurn,
  createSingleSidedLP,
  isV4Operational,
  type V4LPAgentConfig,
  type AgentAction,
} from "@/lib/autonomous-lp-agent"

export const maxDuration = 300 // 5 minutes for long-running operations

interface SkillRequest {
  skill: string
  params: Record<string, any>
  agentId?: string
  timestamp?: number
}

interface SkillResponse {
  success: boolean
  skill: string
  result?: any
  error?: string
  executedAt: number
  agentId?: string
}

/**
 * POST /api/skill/v4-lp
 *
 * Autonomous Liquidity Agent Skill for Uniswap V4
 *
 * Supported operations:
 * - analyze: Analyze position metrics
 * - collect-fees: Collect accrued fees
 * - rebalance: Rebalance position around current price
 * - compound: Auto-compound fees back into LP
 * - harvest: Claim and harvest Clanker protocol fees
 * - buy-burn: Execute buy & burn pipeline
 * - single-sided: Create single-sided LP positions
 * - auto-compound: Loop-based fee compounding with thresholds
 */
export async function POST(req: NextRequest): Promise<NextResponse<SkillResponse>> {
  try {
    // Check if V4 is operational
    if (!isV4Operational()) {
      return NextResponse.json(
        {
          success: false,
          skill: "v4-lp",
          error: "Uniswap V4 not yet deployed on Base mainnet",
          executedAt: Date.now(),
        },
        { status: 503 },
      )
    }

    const body = (await req.json()) as SkillRequest

    if (!body.skill) {
      return NextResponse.json(
        {
          success: false,
          skill: "v4-lp",
          error: "Missing 'skill' parameter",
          executedAt: Date.now(),
        },
        { status: 400 },
      )
    }

    let result: any
    const skillName = body.skill.toLowerCase()
    const params = body.params || {}

    console.log(`[v0] Executing V4 LP agent skill: ${skillName}`, params)

    switch (skillName) {
      case "analyze": {
        if (!params.tokenId || !params.poolAddress) {
          return NextResponse.json(
            {
              success: false,
              skill: "v4-lp",
              error: "Missing required params: tokenId, poolAddress",
              executedAt: Date.now(),
              agentId: body.agentId,
            },
            { status: 400 },
          )
        }

        result = await analyzePosition(params.tokenId, params.poolAddress)
        break
      }

      case "collect-fees": {
        if (!params.tokenId) {
          return NextResponse.json(
            {
              success: false,
              skill: "v4-lp",
              error: "Missing required param: tokenId",
              executedAt: Date.now(),
              agentId: body.agentId,
            },
            { status: 400 },
          )
        }

        result = await collectFees(params.tokenId)
        break
      }

      case "rebalance": {
        if (!params.tokenId || !params.poolAddress) {
          return NextResponse.json(
            {
              success: false,
              skill: "v4-lp",
              error: "Missing required params: tokenId, poolAddress",
              executedAt: Date.now(),
              agentId: body.agentId,
            },
            { status: 400 },
          )
        }

        result = await rebalancePosition(params.tokenId, params.poolAddress, params.tickRange)
        break
      }

      case "compound": {
        if (!params.tokenId || !params.poolAddress) {
          return NextResponse.json(
            {
              success: false,
              skill: "v4-lp",
              error: "Missing required params: tokenId, poolAddress",
              executedAt: Date.now(),
              agentId: body.agentId,
            },
            { status: 400 },
          )
        }

        result = await compoundFees(params.tokenId, params.poolAddress, params.compoundPercentage)
        break
      }

      case "harvest": {
        if (!params.tokenAddress) {
          return NextResponse.json(
            {
              success: false,
              skill: "v4-lp",
              error: "Missing required param: tokenAddress",
              executedAt: Date.now(),
              agentId: body.agentId,
            },
            { status: 400 },
          )
        }

        result = await harvestClankerFees(params.tokenAddress, {
          tokenId: params.tokenId,
          harvestAddress: params.harvestAddress,
          compoundPercentage: params.compoundPercentage,
          minUsdThreshold: params.minUsdThreshold,
          dryRun: params.dryRun || false,
        })
        break
      }

      case "auto-compound": {
        if (!params.tokenId || !params.poolAddress) {
          return NextResponse.json(
            {
              success: false,
              skill: "v4-lp",
              error: "Missing required params: tokenId, poolAddress",
              executedAt: Date.now(),
              agentId: body.agentId,
            },
            { status: 400 },
          )
        }

        const config: V4LPAgentConfig = {
          tokenId: params.tokenId,
          strategy: "auto-compound",
          minUsdThreshold: params.minUsdThreshold,
          compoundPercentage: params.compoundPercentage || 100,
          harvestAddress: params.harvestAddress,
          interval: params.interval || 3600,
          loop: params.loop !== false, // Default to true
        }

        result = await executeAutoCompound(params.tokenId, params.poolAddress, config)
        break
      }

      case "buy-burn": {
        if (!params.tokenAddress) {
          return NextResponse.json(
            {
              success: false,
              skill: "v4-lp",
              error: "Missing required param: tokenAddress",
              executedAt: Date.now(),
              agentId: body.agentId,
            },
            { status: 400 },
          )
        }

        result = await buyAndBurn(params.tokenAddress, {
          positionId: params.positionId,
          burnPercentage: params.burnPercentage || 50,
          dryRun: params.dryRun || false,
        })
        break
      }

      case "single-sided": {
        if (!params.tokenAddress || !params.amount) {
          return NextResponse.json(
            {
              success: false,
              skill: "v4-lp",
              error: "Missing required params: tokenAddress, amount",
              executedAt: Date.now(),
              agentId: body.agentId,
            },
            { status: 400 },
          )
        }

        result = await createSingleSidedLP(params.tokenAddress, params.amount, {
          side: params.side || "sell",
          targetMcap: params.targetMcap,
          rangeAboveOrBelow: params.rangeAboveOrBelow,
          tickLower: params.tickLower,
          tickUpper: params.tickUpper,
        })
        break
      }

      default:
        return NextResponse.json(
          {
            success: false,
            skill: "v4-lp",
            error: `Unknown skill: ${skillName}. Supported skills: analyze, collect-fees, rebalance, compound, harvest, auto-compound, buy-burn, single-sided`,
            executedAt: Date.now(),
            agentId: body.agentId,
          },
          { status: 400 },
        )
    }

    return NextResponse.json(
      {
        success: true,
        skill: "v4-lp",
        result,
        executedAt: Date.now(),
        agentId: body.agentId,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Skill execution error:", error)

    return NextResponse.json(
      {
        success: false,
        skill: "v4-lp",
        error: error instanceof Error ? error.message : String(error),
        executedAt: Date.now(),
      },
      { status: 500 },
    )
  }
}

/**
 * GET /api/skill/v4-lp
 *
 * Get skill documentation and available operations
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      skill: "v4-lp",
      name: "Uniswap V4 Liquidity Agent",
      version: "1.0.0",
      description:
        "Autonomous skill for managing concentrated liquidity positions on Uniswap V4, including auto-compounding, fee harvesting, and Clanker protocol integration",
      available: isV4Operational(),
      operations: [
        {
          name: "analyze",
          description: "Analyze position metrics including fees, range status, and value",
          params: {
            tokenId: "number (required) - Position NFT ID",
            poolAddress: "string (required) - Pool contract address",
          },
        },
        {
          name: "collect-fees",
          description: "Collect accrued fees from a position without removing liquidity",
          params: {
            tokenId: "number (required) - Position NFT ID",
          },
        },
        {
          name: "rebalance",
          description: "Rebalance position to a new tick range (default: ±600 ticks around current)",
          params: {
            tokenId: "number (required) - Position NFT ID",
            poolAddress: "string (required) - Pool contract address",
            tickRange: "object (optional) - { lower: number, upper: number }",
          },
        },
        {
          name: "compound",
          description: "Collect fees and automatically reinvest back into liquidity",
          params: {
            tokenId: "number (required) - Position NFT ID",
            poolAddress: "string (required) - Pool contract address",
            compoundPercentage: "number (optional, default: 100) - Percentage to compound",
          },
        },
        {
          name: "harvest",
          description: "Claim and harvest Clanker protocol fees with compound/harvest split",
          params: {
            tokenAddress: "string (required) - Token contract address",
            tokenId: "number (optional) - Position ID for compounding",
            harvestAddress: "string (optional) - Vault address for harvested fees",
            compoundPercentage: "number (optional, default: 50) - Percentage to compound vs harvest",
            minUsdThreshold: "number (optional) - Only act if fees > this USD amount",
            dryRun: "boolean (optional, default: false) - Simulate without executing",
          },
        },
        {
          name: "auto-compound",
          description: "Loop-based auto-compounding with time intervals and USD thresholds",
          params: {
            tokenId: "number (required) - Position NFT ID",
            poolAddress: "string (required) - Pool contract address",
            interval: "number (optional, default: 3600) - Interval between compounds in seconds",
            minUsdThreshold: "number (optional) - Minimum fee value in USD to trigger compound",
            compoundPercentage: "number (optional, default: 100) - Percentage to compound",
            loop: "boolean (optional, default: true) - Continue looping or run once",
          },
        },
        {
          name: "buy-burn",
          description: "Autonomous buy & burn pipeline: claim fees → swap → burn tokens",
          params: {
            tokenAddress: "string (required) - Token contract address",
            positionId: "number (optional) - Position ID for pool selection",
            burnPercentage: "number (optional, default: 50) - Percentage of WETH to burn",
            dryRun: "boolean (optional, default: false) - Simulate without executing",
          },
        },
        {
          name: "single-sided",
          description: "Create single-sided LP positions as distributed limit orders",
          params: {
            tokenAddress: "string (required) - Token to sell or buy",
            amount: "string (required) - Amount or 'all'",
            side: "string (optional, default: 'sell') - 'sell' or 'buy'",
            targetMcap: "number (optional) - Target market cap for sell/buy range",
            rangeAboveOrBelow: "number (optional) - Price change % for range",
            tickLower: "number (optional) - Custom lower tick",
            tickUpper: "number (optional) - Custom upper tick",
          },
        },
      ],
      contracts: {
        poolManager: "0x498581ff718922c3f8e6a244956af099b2652b2b",
        positionManager: "0x7c5f5a4bbd8fd63184577525326123b519429bdc",
        stateView: "0xa3c0c9b65bad0b08107aa264b0f3db444b867a71",
        permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
        clankerFeeStorage: "0xf3622742b1e446d92e45e22923ef11c2fcd55d68",
      },
      examples: {
        analyzePosition: {
          skill: "analyze",
          params: {
            tokenId: 12345,
            poolAddress: "0x123...",
          },
        },
        autoCompound: {
          skill: "auto-compound",
          params: {
            tokenId: 12345,
            poolAddress: "0x123...",
            interval: 3600,
            minUsdThreshold: 50,
            compoundPercentage: 80,
            loop: true,
          },
        },
        harvestWithCompound: {
          skill: "harvest",
          params: {
            tokenAddress: "0xTOKEN",
            tokenId: 12345,
            harvestAddress: "0xVAULT",
            compoundPercentage: 50,
            minUsdThreshold: 10,
          },
        },
      },
    },
    { status: 200 },
  )
}
