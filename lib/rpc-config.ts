/**
 * Centralized RPC configuration for all blockchain interactions
 * Uses multiple BlastAPI endpoints with automatic failover
 */

interface RpcEndpoint {
  url: string
  priority: number
  lastFailure?: number
  consecutiveFailures: number
}

class RpcManager {
  private endpoints: RpcEndpoint[] = [
    {
      url: "https://base-mainnet.blastapi.io/d6d4ab7c-d1de-4412-9a48-ae9c7965285c",
      priority: 1,
      consecutiveFailures: 0,
    },
    {
      url: "https://base-mainnet.blastapi.io/dfa72e0c-8da4-4ff8-81c9-7b841eb616bb",
      priority: 2,
      consecutiveFailures: 0,
    },
    {
      url: "https://base-mainnet.blastapi.io/eb546001-af94-4a0f-ae06-7f24c1cd7023",
      priority: 3,
      consecutiveFailures: 0,
    },
    {
      url: "https://base-mainnet.blastapi.io/fe9c30fc-3bc5-4064-91e2-6ab5887f8f4d",
      priority: 4,
      consecutiveFailures: 0,
    },
    {
      url: "https://base-mainnet.blastapi.io/35f59b2b-8068-46e5-b0c8-9625a9606bd9",
      priority: 5,
      consecutiveFailures: 0,
    },
    {
      url: "https://base-mainnet.blastapi.io/b5a802d8-151d-4443-90a7-699108dc4e01",
      priority: 6,
      consecutiveFailures: 0,
    },
    {
      url: "https://base-mainnet.blastapi.io/b2ba991b-e915-4fd6-8f73-2d60d2350ce5",
      priority: 7,
      consecutiveFailures: 0,
    },
    {
      url: "https://base-mainnet.blastapi.io/6108795a-137e-4af8-a28e-8c4bbd6336c2",
      priority: 8,
      consecutiveFailures: 0,
    },
  ]

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

// Export the manager for adding endpoints
export { rpcManager }

export const RPC_CONFIG = {
  BASE_MAINNET: {
    url: "https://base-mainnet.blastapi.io/d6d4ab7c-d1de-4412-9a48-ae9c7965285c",
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
