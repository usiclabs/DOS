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
  getProfileBalances,
} from "@zoralabs/coins-sdk"
import type { WalletClient } from "viem"
import { base, baseSepolia } from "viem/chains"

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
  walletClient: WalletClient
  account: string
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

export interface CreatorProfileBalances {
  address: string
  handle: string
  displayName: string
  bio: string
  avatar: string
  holdings: {
    coin: {
      address: string
      name: string
      symbol: string
      image: string
    }
    balance: number
    priceUsd: number
    valueUsd: number
  }[]
  totalValue: number
  holdingsCount: number
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
    const { walletClient, account } = params

    if (!walletClient) {
      throw new Error("Wallet client is required")
    }

    const currentChainId = walletClient.chain.id
    console.log("[v0] Wallet client chain ID:", currentChainId)
    console.log("[v0] Wallet account:", account)

    if (currentChainId !== 8453 && currentChainId !== 84532) {
      throw new Error(
        `Wrong network. Please switch to Base network. Current chain ID: ${currentChainId}, Required: 8453 (Base) or 84532 (Base Sepolia)`,
      )
    }

    // This ensures the chain object structure matches what Zora SDK expects
    const chainToUse = currentChainId === 8453 ? base : baseSepolia

    const zoraSafeWalletClient = {
      ...walletClient,
      chain: chainToUse,
    } as WalletClient

    console.log("[v0] Using wallet client with chain:", zoraSafeWalletClient.chain.id)
    console.log("[v0] Chain name:", zoraSafeWalletClient.chain.name)

    const result = await createCoin({
      walletClient: zoraSafeWalletClient,
      account,
      name: params.name,
      symbol: params.symbol,
      uri: params.uri,
      owners: [account],
      payoutRecipient: params.payoutRecipient,
      platformReferrer: params.platformReferrer,
      currency: params.currency || "ETH",
      initialPurchase: params.initialPurchase,
    })

    console.log("[v0] Successfully deployed coin via Zora SDK:", result)

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

/**
 * Get profile coin balances and holdings
 * Shows how liquid/active a creator is in the Zora ecosystem
 */
export async function getCreatorProfileBalances(
  address: string,
  chainId = 8453,
): Promise<CreatorProfileBalances | null> {
  console.log("[v0] Fetching profile balances for:", address)

  try {
    const result = await getProfileBalances({
      identifier: address,
      count: 50, // Get up to 50 coin balances
    })

    const profile: any = result.data?.profile
    const balances = profile?.coinBalances?.edges?.map((edge: any) => edge.node) || []

    console.log(`[v0] Successfully fetched ${balances.length} coin balances for profile`)

    // Calculate total USD value of holdings
    let totalValue = 0
    const holdings = balances.map((balance: any) => {
      const coin = balance.coin
      const amount = Number.parseFloat(balance.balance || "0")
      const priceUsd = Number.parseFloat(coin?.tokenPrice?.priceInUsdc || "0")
      const valueUsd = amount * priceUsd

      totalValue += valueUsd

      return {
        coin: {
          address: coin?.address,
          name: coin?.name,
          symbol: coin?.symbol,
          image: coin?.mediaContent?.previewImage,
        },
        balance: amount,
        priceUsd,
        valueUsd,
      }
    })

    return {
      address: profile?.address || address,
      handle: profile?.handle,
      displayName: profile?.displayName,
      bio: profile?.bio,
      avatar: profile?.avatar?.medium,
      holdings,
      totalValue,
      holdingsCount: holdings.length,
    }
  } catch (error) {
    console.error("[v0] Error fetching profile balances:", error)
    return null
  }
}

/**
 * Get holders of a specific coin
 */
export async function getCoinHolders(coinAddress: string, chainId = 8453, count = 20, after?: string) {
  console.log("[v0] Fetching coin holders for:", coinAddress)

  try {
    const result = await fetchZoraAPI(`/coin/${coinAddress}/holders`, {
      chainId,
      count,
      after,
    })

    const holders = result?.data?.zora20Token?.tokenBalances?.edges?.map((edge: any) => edge.node) || []
    const pageInfo = result?.data?.zora20Token?.tokenBalances?.pageInfo

    console.log(`[v0] Successfully fetched ${holders.length} holders`)

    return {
      holders,
      pageInfo,
      totalCount: holders.length,
    }
  } catch (error) {
    console.error("[v0] Error fetching coin holders:", error)
    return {
      holders: [],
      pageInfo: null,
      totalCount: 0,
    }
  }
}

/**
 * Get swap/trading activity for a specific coin
 */
export async function getCoinSwaps(coinAddress: string, chainId = 8453, count = 20, after?: string) {
  console.log("[v0] Fetching coin swaps for:", coinAddress)

  try {
    const result = await fetchZoraAPI(`/coin/${coinAddress}/swaps`, {
      chainId,
      count,
      after,
    })

    const swaps = result?.data?.zora20Token?.swaps?.edges?.map((edge: any) => edge.node) || []
    const pageInfo = result?.data?.zora20Token?.swaps?.pageInfo

    console.log(`[v0] Successfully fetched ${swaps.length} swaps`)

    return {
      swaps,
      pageInfo,
      totalCount: swaps.length,
    }
  } catch (error) {
    console.error("[v0] Error fetching coin swaps:", error)
    return {
      swaps: [],
      pageInfo: null,
      totalCount: 0,
    }
  }
}
