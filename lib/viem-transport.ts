import { http, fallback, type Transport } from "viem"

// Alchemy Base mainnet endpoint with API key from environment
const ALCHEMY_ENDPOINT = `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`

// Fallback to public Base RPC if Alchemy fails
const FALLBACK_ENDPOINTS = ["https://mainnet.base.org", "https://base.llamarpc.com"]

/**
 * Creates a viem transport with automatic fallback between Alchemy and public endpoints
 * When Alchemy is rate limited, it automatically tries public endpoints
 */
export function createMultiEndpointTransport(): Transport {
  // Create HTTP transports with Alchemy primary and public fallbacks
  const transports = [
    http(ALCHEMY_ENDPOINT, {
      retryCount: 0,
      timeout: 30_000,
    }),
    ...FALLBACK_ENDPOINTS.map((url) =>
      http(url, {
        retryCount: 0,
        timeout: 30_000,
      }),
    ),
  ]

  // Use viem's fallback transport to automatically rotate between endpoints
  return fallback(transports, {
    rank: false, // Use endpoints in order, not by latency
  })
}
