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
  getCoin,
  getProfileBalances,
  getMostValuableCreatorCoins,
  getCoinsLastTradedUnique,
} from "@zoralabs/coins-sdk"
import type { WalletClient } from "viem"
import { put } from "@vercel/blob"
import { DEUS_TOKEN_ADDRESS } from "@/lib/constants"

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
  currency?: "ETH" | "DEUS" | "ZORA" | "USDC"
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
export async function queryCreatorCoins(
  filter?: "trending" | "new" | "top-volume" | "last-traded",
  limit = 50,
  cursor?: string,
) {
  console.log("[v0] Querying creator coins with filter:", filter, "limit:", limit, "cursor:", cursor)

  try {
    let result

    if (filter === "new") {
      console.log("[v0] Fetching new coins from Zora SDK")
      result = await getCoinsNew({ count: limit, after: cursor })
    } else if (filter === "top-volume") {
      console.log("[v0] Fetching top volume coins from Zora SDK")
      result = await getCoinsTopVolume24h({ count: limit, after: cursor })
    } else if (filter === "trending") {
      console.log("[v0] Fetching most valuable creator coins from Zora SDK")
      try {
        result = await getMostValuableCreatorCoins({ count: limit, after: cursor })
        console.log("[v0] Successfully fetched most valuable creator coins")
      } catch (mostValuableError) {
        console.error("[v0] getMostValuableCreatorCoins failed, falling back to new coins:", mostValuableError)
        result = await getCoinsNew({ count: limit, after: cursor })
      }
    } else if (filter === "last-traded") {
      console.log("[v0] Fetching last traded coins from Zora SDK")
      try {
        result = await getCoinsLastTradedUnique({ count: limit, after: cursor })
        console.log("[v0] Successfully fetched last traded coins")
      } catch (lastTradedError) {
        console.error("[v0] getCoinsLastTradedUnique failed, falling back to new coins:", lastTradedError)
        result = await getCoinsNew({ count: limit, after: cursor })
      }
    } else {
      console.log("[v0] Fetching all new coins from Zora SDK (default)")
      result = await getCoinsNew({ count: limit, after: cursor })
    }

    const coins = result?.data?.exploreList?.edges?.map((edge: any) => edge.node) || []
    console.log(`[v0] Successfully fetched ${coins.length} coins from Zora SDK`)

    if (coins.length > 0) {
      console.log("[v0] Sample coin structure:", {
        name: coins[0]?.name,
        symbol: coins[0]?.symbol,
        marketCap: coins[0]?.marketCap,
        volume24h: coins[0]?.volume24h,
      })
    }

    return {
      coins,
      totalCount: coins.length,
      nextCursor: result?.data?.exploreList?.pageInfo?.endCursor,
    }
  } catch (error: any) {
    console.error(`[v0] Error fetching creator coins:`, error.message)

    if (filter && filter !== "new") {
      console.log("[v0] Filter failed, falling back to 'new' coins")
      try {
        const fallbackResult = await getCoinsNew({ count: limit, after: cursor })
        const coins = fallbackResult?.data?.exploreList?.edges?.map((edge: any) => edge.node) || []
        console.log(`[v0] Fallback successful: fetched ${coins.length} new coins`)
        return {
          coins,
          totalCount: coins.length,
          nextCursor: fallbackResult?.data?.exploreList?.pageInfo?.endCursor,
        }
      } catch (fallbackError) {
        console.error("[v0] Fallback also failed:", fallbackError)
      }
    }

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
      address: coinAddress,
      chain: chainId,
    })

    console.log("[v0] getCoin result structure:", JSON.stringify(result, null, 2))

    // The Zora SDK returns data in result.data.zora20Token structure
    const anyResult = result as any
    const coin = anyResult?.data?.zora20Token || anyResult?.data?.coin || anyResult?.coin || anyResult?.data || anyResult

    if (!coin || !coin.address) {
      console.error("[v0] No valid coin data found in response")
      return null
    }

    console.log("[v0] Successfully fetched coin details from Zora SDK")
    return coin
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
  console.log("[v0] Uploading metadata to IPFS:", {
    name: metadata.name,
    symbol: metadata.symbol,
    description: metadata.description,
  })

  try {
    let mediaUrl = ""

    if (metadata.image) {
      console.log("[v0] Uploading media to Vercel Blob...")
      try {
        // Check file size before upload (Vercel Blob has a 4.5MB limit for free tier)
        const fileSizeInMB = metadata.image.size / (1024 * 1024)
        console.log(`[v0] File size: ${fileSizeInMB.toFixed(2)} MB`)

        if (fileSizeInMB > 4.5) {
          console.warn("[v0] File size exceeds 4.5MB limit, skipping upload")
          throw new Error("File size exceeds 4.5MB limit")
        }

        const blob = await put(`zora-coins/${Date.now()}-${metadata.image.name}`, metadata.image, {
          access: "public",
        })

        mediaUrl = blob.url
        console.log("[v0] Media uploaded to Vercel Blob:", mediaUrl)
      } catch (error: any) {
        console.error("[v0] Failed to upload media to Vercel Blob:", {
          message: error.message,
          name: error.name,
          cause: error.cause,
        })

        // Check if it's a size error
        if (error.message?.includes("too large") || error.message?.includes("4.5MB")) {
          console.warn("[v0] File too large for Vercel Blob, continuing without media")
        } else {
          console.warn("[v0] Media upload failed, continuing without media")
        }
        // Continue without media URL - don't throw
      }
    }

    // Create metadata object
    const metadataObject = {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description || "",
      image: mediaUrl || "",
      animation_url: mediaUrl && metadata.image?.type.startsWith("video/") ? mediaUrl : undefined,
      creator: creatorAddress,
      external_url: `https://zora.co/coins/${creatorAddress}`,
      attributes: [
        {
          trait_type: "Creator",
          value: creatorAddress,
        },
      ],
    }

    console.log("[v0] Uploading metadata object to Vercel Blob:", metadataObject)

    try {
      const metadataBlob = new Blob([JSON.stringify(metadataObject)], { type: "application/json" })
      const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" })

      const metadataUpload = await put(`zora-coins/metadata/${Date.now()}-metadata.json`, metadataFile, {
        access: "public",
      })

      const metadataUri = metadataUpload.url
      console.log("[v0] Metadata uploaded to IPFS:", metadataUri)
      return metadataUri
    } catch (metadataError: any) {
      console.error("[v0] Failed to upload metadata to Vercel Blob:", {
        message: metadataError.message,
        name: metadataError.name,
      })
      throw new Error(`Failed to upload metadata: ${metadataError.message}`)
    }
  } catch (error: any) {
    console.error("[v0] Error uploading metadata:", error)

    const fallbackMetadata = {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description || "",
      creator: creatorAddress,
    }

    try {
      console.log("[v0] Attempting fallback metadata upload...")
      const metadataBlob = new Blob([JSON.stringify(fallbackMetadata)], { type: "application/json" })
      const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" })

      const metadataUpload = await put(`zora-coins/metadata/${Date.now()}-fallback.json`, metadataFile, {
        access: "public",
      })

      console.log("[v0] Using fallback metadata URL:", metadataUpload.url)
      return metadataUpload.url
    } catch (fallbackError: any) {
      console.error("[v0] Fallback upload also failed:", {
        message: fallbackError.message,
        name: fallbackError.name,
      })
      throw new Error(`Failed to upload metadata: ${fallbackError.message}`)
    }
  }
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

    const currentChainId = walletClient.chain?.id
    console.log("[v0] Wallet client chain ID:", currentChainId)
    console.log("[v0] Wallet account:", account)

    if (currentChainId !== 8453 && currentChainId !== 84532) {
      throw new Error(
        `Wrong network. Please switch to Base network. Current chain ID: ${currentChainId}, Required: 8453 (Base) or 84532 (Base Sepolia)`,
      )
    }

    // Zora Factory contract address on Base mainnet
    const ZORA_FACTORY_ADDRESS = "0x777777751622c0d3258f214F9DF38E35BF45baF3"

    // Currency addresses on Base mainnet
    const ETH_ADDRESS = "0x0000000000000000000000000000000000000000"
    const ZORA_ADDRESS = "0x1111111111166b7fe7bd91427724b487980afc69"
    const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

    // Map currency to address
    let currencyAddress: string
    switch (params.currency) {
      case "DEUS":
        currencyAddress = DEUS_TOKEN_ADDRESS
        break
      case "ZORA":
        currencyAddress = ZORA_ADDRESS
        break
      case "USDC":
        currencyAddress = USDC_ADDRESS
        break
      case "ETH":
      default:
        currencyAddress = ETH_ADDRESS
        break
    }

    // Zora Factory ABI for the deploy function
    const ZORA_FACTORY_ABI = [
      {
        inputs: [
          { name: "payoutRecipient", type: "address" },
          { name: "owners", type: "address[]" },
          { name: "uri", type: "string" },
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "platformReferrer", type: "address" },
          { name: "currency", type: "address" },
          { name: "tickLower", type: "int24" },
          { name: "orderSize", type: "uint256" },
        ],
        name: "deploy",
        outputs: [
          { name: "coin", type: "address" },
          { name: "pool", type: "address" },
        ],
        stateMutability: "payable",
        type: "function",
      },
    ]

    console.log("[v0] Preparing contract deployment transaction...")
    console.log("[v0] Factory address:", ZORA_FACTORY_ADDRESS)
    console.log("[v0] Currency:", params.currency, "->", currencyAddress)
    console.log("[v0] Platform referrer:", params.platformReferrer || "none configured")

    if (params.platformReferrer && params.platformReferrer !== "0x0000000000000000000000000000000000000000") {
      console.log("[v0] ✓ Platform referrer is configured:", params.platformReferrer)
      console.log("[v0] ✓ This deployment WILL EARN 20% of all trading fees")
    } else {
      console.warn("[v0] ✗ No platform referrer configured - deployment will NOT earn referral fees")
    }

    // Prepare the transaction
    const hash = await walletClient.writeContract({
      address: ZORA_FACTORY_ADDRESS as `0x${string}`,
      abi: ZORA_FACTORY_ABI,
      functionName: "deploy",
      args: [
        params.payoutRecipient as `0x${string}`, // payoutRecipient
        [account as `0x${string}`], // owners array
        params.uri, // metadata URI
        params.name, // coin name
        params.symbol, // coin symbol
        params.platformReferrer
          ? (params.platformReferrer as `0x${string}`)
          : ("0x0000000000000000000000000000000000000000" as `0x${string}`), // platformReferrer
        currencyAddress as `0x${string}`, // currency (ETH, ZORA, or USDC)
        -887220, // tickLower (standard Uniswap V3 tick for wide range)
        BigInt("1000000000000000000"), // orderSize (1 token initial liquidity)
      ],
      account: account as `0x${string}`,
      chain: walletClient.chain,
    })

    console.log("[v0] Transaction submitted:", hash)
    console.log("[v0] Waiting for transaction confirmation...")

    // Wait for transaction receipt
    const receipt = await (walletClient as any).waitForTransactionReceipt?.({ hash })

    console.log("[v0] Transaction confirmed:", receipt)

    // Extract coin address from logs (the first log should be the coin creation event)
    let coinAddress = ""
    if (receipt?.logs && receipt.logs.length > 0) {
      // The coin address is typically in the first log's address field
      coinAddress = receipt.logs[0].address
      console.log("[v0] Extracted coin address from logs:", coinAddress)
    }

    return {
      success: true,
      coinAddress: coinAddress || undefined,
      transactionHash: hash,
      poolAddress: undefined, // Pool address would need to be extracted from logs as well
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
