import { http, fallback, type Transport } from "viem"

const isServer = typeof window === "undefined"

const PRIMARY_ENDPOINT =
  isServer && process.env.ALCHEMY_API_KEY
    ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    : "https://mainnet.base.org"

// Public Base RPC endpoints as fallbacks
const FALLBACK_ENDPOINTS = ["https://mainnet.base.org", "https://base.llamarpc.com"]

/**
 * Creates a viem transport with automatic fallback between Alchemy (server) and public endpoints
 * On client: uses only public endpoints
 * On server: uses Alchemy with public fallbacks
 */
export function createMultiEndpointTransport(): Transport {
  // Create HTTP transports with primary and public fallbacks
  const transports = [
    http(PRIMARY_ENDPOINT, {
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
