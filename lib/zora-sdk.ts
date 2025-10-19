/**
 * Zora Coins SDK Integration
 *
 * This module provides utilities for interacting with Zora's Coins SDK
 * to create and manage creator coins on the Base network.
 *
 * Documentation: https://docs.zora.co/coins/sdk
 */

import {
  setApiKey,
  getCoinsNew,
  getCoinsTopVolume24h,
  getCoinsTopGainers,
  getCoin,
  createCoin,
} from "@zoralabs/coins-sdk"
import { createWalletClient, custom } from "viem"
import { base } from "viem/chains"

const ZORA_API_KEY = "zora_api_a3bdc55dcf5cb9e9974348e5576525f6f4b1c81686700bf8cf52c088fef51207"

setApiKey(ZORA_API_KEY)

export interface ZoraCoin {
  id: string
  name: string
  description: string
  address: string
  symbol: string
  totalSupply: string
  totalVolume: string
  volume24h: string
  marketCap: string
  createdAt?: string
  creatorAddress?: string
  uniqueHolders?: number
  mediaContent?: {
    previewImage?: string
    thumbnailImage?: string
  }
  poolAddress?: string
  price?: string
  priceChange24h?: number
}

export interface ZoraCoinMetadata {
  name: string
  symbol: string
  description?: string
  image?: File
}

export interface CreateCoinParams {
  name: string
  symbol: string
  uri: string
  chainId?: number
  owners?: string[]
  payoutRecipient: string
  platformReferrer?: string
  currency?: "ZORA" | "ETH"
  initialPurchase?: {
    currency: "ETH" | "USDC" | "ZORA"
    amount: string
    amountOutMinimum?: string
  }
}

export interface CoinDeploymentResult {
  success: boolean
  coinAddress?: string
  transactionHash?: string
  poolAddress?: string
  error?: string
}

async function fetchZoraAPI(endpoint: string, params?: Record<string, any>) {
  console.log("[v0] Fetching from Zora API:", endpoint)

  const url = new URL(`https://api-sdk.zora.engineering${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ZORA_API_KEY,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Zora API error (${response.status}):`, errorText)
      throw new Error(`Zora API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Successfully fetched data from Zora API")
    return data
  } catch (error) {
    console.error("[v0] Error fetching from Zora API:", error)
    throw error
  }
}

/**
 * Initialize Zora SDK with API key
 * In production, this would use: import { setApiKey } from "@zoralabs/coins-sdk"
 */
export function initializeZoraSDK() {
  // Production code (uncomment when @zoralabs/coins-sdk is installed):
  // import { setApiKey } from "@zoralabs/coins-sdk"
  // setApiKey(ZORA_API_KEY)

  console.log("[v0] Zora SDK initialized with API key")
}

/**
 * Query all creator coins with optional filtering
 * Uses the Zora Coins SDK explore queries
 */
export async function queryCreatorCoins(filter?: "trending" | "new" | "top-volume", limit = 50) {
  console.log("[v0] Querying creator coins with filter:", filter, "limit:", limit)

  try {
    let result

    if (filter === "new") {
      console.log("[v0] Fetching new coins from Zora SDK")
      result = await getCoinsNew({ chainId: 8453, count: limit })
    } else if (filter === "top-volume") {
      console.log("[v0] Fetching top volume coins from Zora SDK")
      result = await getCoinsTopVolume24h({ chainId: 8453, count: limit })
    } else if (filter === "trending") {
      console.log("[v0] Fetching trending coins from Zora SDK")
      result = await getCoinsTopGainers({ chainId: 8453, count: limit })
    } else {
      console.log("[v0] Fetching all new coins from Zora SDK")
      result = await getCoinsNew({ chainId: 8453, count: limit })
    }

    const coins = result?.data?.exploreList?.edges?.map((edge: any) => edge.node) || []
    console.log(`[v0] Successfully fetched ${coins.length} coins from Zora SDK`)

    if (coins.length > 0) {
      console.log("[v0] Sample coin data:", JSON.stringify(coins[0], null, 2))
    }

    return {
      coins,
      totalCount: coins.length,
    }
  } catch (error) {
    console.error("[v0] Error fetching creator coins from Zora SDK:", error)
    return {
      coins: [],
      totalCount: 0,
    }
  }
}

/**
 * Get detailed information about a specific coin
 */
export async function getCoinDetails(coinAddress: string, chainId = 8453) {
  console.log("[v0] Fetching coin details for:", coinAddress)

  try {
    const result = await getCoin({
      coinAddress,
      chainId,
    })

    console.log("[v0] Successfully fetched coin details from Zora SDK")
    return result?.data?.coin || null
  } catch (error) {
    console.error("[v0] Error fetching coin details from Zora SDK:", error)
    return null
  }
}

/**
 * Get detailed metrics for a specific coin
 */
export async function getCoinMetrics(coinAddress: string, chainId = 8453) {
  console.log("[v0] Fetching metrics for coin:", coinAddress)

  try {
    const coin = await getCoinDetails(coinAddress, chainId)
    if (!coin) return null

    return {
      price: coin.price || "0",
      marketCap: coin.marketCap || "0",
      volume24h: coin.volume24h || "0",
      totalVolume: coin.totalVolume || "0",
      holders: coin.uniqueHolders || 0,
      totalSupply: coin.totalSupply || "0",
      creatorEarnings: coin.creatorEarnings || [],
    }
  } catch (error) {
    console.error("[v0] Error fetching coin metrics:", error)
    return null
  }
}

/**
 * Query Zora coins created by a specific address
 */
export async function getCreatorCoins(creatorAddress: string, chainId = 8453) {
  console.log("[v0] Fetching coins for creator:", creatorAddress)

  try {
    const data = await fetchZoraAPI(`/profile/${creatorAddress}/coins`, {
      chainId,
    })

    const coins = data?.data?.profile?.coins || []

    return {
      coins,
      totalCount: coins.length,
    }
  } catch (error) {
    console.error("[v0] Error fetching creator coins:", error)
    return {
      coins: [],
      totalCount: 0,
    }
  }
}

/**
 * Upload metadata to IPFS and return the URI
 */
export async function uploadMetadataToIPFS(metadata: ZoraCoinMetadata, creatorAddress: string): Promise<string> {
  console.log("[v0] Uploading metadata to IPFS:", metadata)

  // In production, this would use the Zora SDK's metadata builder
  // For now, simulate IPFS upload
  const mockIpfsHash = "bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy"
  return `ipfs://${mockIpfsHash}`
}

/**
 * Deploy a new Zora coin with the specified parameters
 */
export async function deployCoin(params: CreateCoinParams): Promise<CoinDeploymentResult> {
  console.log("[v0] Deploying Zora coin with params:", params)

  try {
    if (typeof window === "undefined") {
      throw new Error("Coin deployment must be called from the browser")
    }

    // Get wallet client from browser
    const walletClient = createWalletClient({
      chain: base,
      transport: custom((window as any).ethereum),
    })

    const [account] = await walletClient.getAddresses()

    // Create the coin using Zora SDK
    const result = await createCoin({
      walletClient,
      account,
      name: params.name,
      symbol: params.symbol,
      uri: params.uri,
      chainId: params.chainId || 8453,
      owners: params.owners || [account],
      payoutRecipient: params.payoutRecipient,
      platformReferrer: params.platformReferrer,
      currency: params.currency || "ETH",
      initialPurchase: params.initialPurchase,
    })

    console.log("[v0] Successfully deployed coin via Zora SDK")

    return {
      success: true,
      coinAddress: result.coinAddress,
      transactionHash: result.transactionHash,
      poolAddress: result.poolAddress,
    }
  } catch (error: any) {
    console.error("[v0] Error deploying Zora coin:", error)
    return {
      success: false,
      error: error.message || "Failed to deploy coin",
    }
  }
}
