import { http, fallback, type Transport } from "viem"

// All 8 BlastAPI endpoints for Base mainnet
const BLAST_API_ENDPOINTS = [
  "https://base-mainnet.blastapi.io/d6d4ab7c-d1de-4412-9a48-ae9c7965285c",
  "https://base-mainnet.blastapi.io/dfa72e0c-8da4-4ff8-81c9-7b841eb616bb",
  "https://base-mainnet.blastapi.io/eb546001-af94-4a0f-ae06-7f24c1cd7023",
  "https://base-mainnet.blastapi.io/fe9c30fc-3bc5-4064-91e2-6ab5887f8f4d",
  "https://base-mainnet.blastapi.io/35f59b2b-8068-46e5-b0c8-9625a9606bd9",
  "https://base-mainnet.blastapi.io/b5a802d8-151d-4443-90a7-699108dc4e01",
  "https://base-mainnet.blastapi.io/b2ba991b-e915-4fd6-8f73-2d60d2350ce5",
  "https://base-mainnet.blastapi.io/6108795a-137e-4af8-a28e-8c4bbd6336c2",
]

/**
 * Creates a viem transport with automatic fallback between multiple BlastAPI endpoints
 * When one endpoint is rate limited, it automatically tries the next one
 */
export function createMultiEndpointTransport(): Transport {
  // Create HTTP transports for each endpoint with retry configuration
  const transports = BLAST_API_ENDPOINTS.map((url) =>
    http(url, {
      retryCount: 0, // Don't retry on same endpoint, let fallback handle it
      timeout: 30_000, // 30 second timeout
    }),
  )

  // Use viem's fallback transport to automatically rotate between endpoints
  return fallback(transports, {
    rank: false, // Use endpoints in order, not by latency
  })
}
