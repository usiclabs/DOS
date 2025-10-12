"use client"

import { create } from "zustand"

interface DeusTickerData {
  priceUsd: number
  change24hPct: number
  volume24hUsd: number
  liquidityUsd: number
  marketCapUsd?: number
  fdvUsd?: number
  holders?: number
  topPairs: { base: string; quote: string; feeTier?: string; apy24h?: number; dexId?: string }[]
  lastUpdatedISO: string
  status: "live" | "degraded" | "error"
}

interface TickerStore {
  data: DeusTickerData | null
  isLoading: boolean
  error: string | null
  lastFetch: number
  fetchTicker: () => Promise<void>
}

const CACHE_DURATION = 30000 // 30 seconds cache
const EMPTY_DATA: DeusTickerData = {
  priceUsd: 0,
  change24hPct: 0,
  volume24hUsd: 0,
  liquidityUsd: 0,
  topPairs: [],
  lastUpdatedISO: new Date().toISOString(),
  status: "error" as const,
}

export const useTickerStore = create<TickerStore>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  lastFetch: 0,

  fetchTicker: async () => {
    const now = Date.now()
    const { lastFetch, isLoading } = get()

    if (isLoading || now - lastFetch < CACHE_DURATION) {
      return
    }

    set({ isLoading: true, error: null })

    try {
      const response = await fetch("/api/deus/ticker")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.priceUsd > 0) {
        set({
          data,
          isLoading: false,
          lastFetch: now,
          error: null,
        })
      } else {
        set({
          data: null,
          isLoading: false,
          error: "No live data available",
          lastFetch: now,
        })
      }
    } catch (error) {
      console.error("[v0] Ticker fetch error:", error)
      set({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch live data",
        lastFetch: now,
      })
    }
  },
}))
