/**
 * Centralized RPC configuration for all blockchain interactions
 * Uses public endpoints on client, Alchemy API on server with automatic failover
 */

interface RpcEndpoint {
  url: string
  priority: number
  lastFailure?: number
  consecutiveFailures: number
}

class RpcManager {
  private endpoints: RpcEndpoint[]

  constructor() {
    const isServer = typeof window === "undefined"

    this.endpoints = [
      // Server-side: Use Alchemy with API key (highest priority)
      ...(isServer && process.env.ALCHEMY_API_KEY
        ? [
            {
              url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
              priority: 0,
              consecutiveFailures: 0,
            },
          ]
        : []),
      // Public endpoints (client and server fallback)
      {
        url: "https://mainnet.base.org",
        priority: 1,
        consecutiveFailures: 0,
      },
      {
        url: "https://base.llamarpc.com",
        priority: 2,
        consecutiveFailures: 0,
      },
    ]
  }

  private readonly FAILURE_TIMEOUT = 60000 // 1 minute cooldown after failure
  private readonly MAX_CONSECUTIVE_FAILURES = 3

  /**
   * Get the next available endpoint, skipping recently failed ones
   */
  private getNextEndpoint(): RpcEndpoint | null {
    const now = Date.now()

    // Filter out endpoints that are in cooldown
    const availableEndpoints = this.endpoints.filter((endpoint) => {
      if (endpoint.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        // Check if cooldown period has passed
        if (endpoint.lastFailure && now - endpoint.lastFailure < this.FAILURE_TIMEOUT) {
          return false
        }
        // Reset after cooldown
        endpoint.consecutiveFailures = 0
        endpoint.lastFailure = undefined
      }
      return true
    })

    if (availableEndpoints.length === 0) {
      // All endpoints are in cooldown, reset the one with oldest failure
      const oldestFailure = this.endpoints.reduce((oldest, current) => {
        if (!oldest.lastFailure) return current
        if (!current.lastFailure) return oldest
        return current.lastFailure < oldest.lastFailure ? current : oldest
      })
      oldestFailure.consecutiveFailures = 0
      oldestFailure.lastFailure = undefined
      return oldestFailure
    }

    // Sort by priority (lower number = higher priority)
    availableEndpoints.sort((a, b) => a.priority - b.priority)
    return availableEndpoints[0]
  }

  /**
   * Mark an endpoint as failed
   */
  private markEndpointFailed(url: string) {
    const endpoint = this.endpoints.find((e) => e.url === url)
    if (endpoint) {
      endpoint.consecutiveFailures++
      endpoint.lastFailure = Date.now()
      console.log(`[v0] RPC endpoint ${url} failed (${endpoint.consecutiveFailures}/${this.MAX_CONSECUTIVE_FAILURES})`)
    }
  }

  /**
   * Mark an endpoint as successful
   */
  private markEndpointSuccess(url: string) {
    const endpoint = this.endpoints.find((e) => e.url === url)
    if (endpoint && endpoint.consecutiveFailures > 0) {
      endpoint.consecutiveFailures = 0
      endpoint.lastFailure = undefined
      console.log(`[v0] RPC endpoint ${url} recovered`)
    }
  }

  /**
   * Add a new RPC endpoint
   */
  addEndpoint(url: string, priority?: number) {
    const exists = this.endpoints.find((e) => e.url === url)
    if (!exists) {
      this.endpoints.push({
        url,
        priority: priority || this.endpoints.length + 1,
        consecutiveFailures: 0,
      })
      console.log(`[v0] Added RPC endpoint: ${url} with priority ${priority || this.endpoints.length}`)
    }
  }

  /**
   * Make an RPC call with automatic failover
   */
  async call<T = any>(method: string, params: any[] = []): Promise<T> {
    let lastError: Error | null = null
    const maxAttempts = this.endpoints.length

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const endpoint = this.getNextEndpoint()
      if (!endpoint) {
        throw new Error("No available RPC endpoints")
      }

      try {
        console.log(`[v0] RPC call to ${endpoint.url}: ${method}`)
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method,
            params,
          }),
        })

        if (!response.ok) {
          // Check for rate limiting
          if (response.status === 429) {
            console.log(`[v0] Rate limited on ${endpoint.url}, trying next endpoint...`)
            this.markEndpointFailed(endpoint.url)
            lastError = new Error(`Rate limited: ${response.status}`)
            continue
          }
          throw new Error(`RPC call failed: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (data.error) {
          // Check if error is rate limiting
          if (data.error.message?.toLowerCase().includes("rate limit")) {
            console.log(`[v0] Rate limited on ${endpoint.url}, trying next endpoint...`)
            this.markEndpointFailed(endpoint.url)
            lastError = new Error(`RPC error: ${data.error.message}`)
            continue
          }
          throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`)
        }

        // Success! Mark endpoint as working
        this.markEndpointSuccess(endpoint.url)
        return data.result
      } catch (error) {
        console.error(`[v0] RPC call failed on ${endpoint.url}:`, error)
        this.markEndpointFailed(endpoint.url)
        lastError = error as Error

        // If this is the last attempt, throw the error
        if (attempt === maxAttempts - 1) {
          throw lastError
        }

        // Wait a bit before trying next endpoint
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    throw lastError || new Error("All RPC endpoints failed")
  }
}

// Create singleton instance
const rpcManager = new RpcManager()

export { rpcManager, RpcManager }

export const RPC_CONFIG = {
  BASE_MAINNET: {
    url:
      typeof window === "undefined" && process.env.ALCHEMY_API_KEY
        ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://mainnet.base.org", // Use public endpoint on client
    chainId: 8453,
    name: "Base Mainnet",
  },
} as const

export const BASE_RPC_URL = RPC_CONFIG.BASE_MAINNET.url
export const BASE_CHAIN_ID = RPC_CONFIG.BASE_MAINNET.chainId

export async function rpcCall<T = any>(method: string, params: any[] = [], rpcUrl?: string): Promise<T> {
  // If a specific RPC URL is provided, use it directly (for backwards compatibility)
  if (rpcUrl) {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      }),
    })

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`)
    }

    return data.result
  }

  // Otherwise, use the RpcManager with automatic failover
  return rpcManager.call<T>(method, params)
}
