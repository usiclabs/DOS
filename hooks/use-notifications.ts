"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useTickerStore } from "@/lib/ticker-store"

export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info" | "price" | "pool" | "ai" | "transaction"
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface PriceAlert {
  id: string
  type: "increase" | "decrease" | "volatility" | "volume_spike"
  threshold: number
  enabled: boolean
}

const DEFAULT_PRICE_ALERTS: PriceAlert[] = [
  { id: "price_increase_10", type: "increase", threshold: 10, enabled: true },
  { id: "price_decrease_10", type: "decrease", threshold: -10, enabled: true },
  { id: "price_increase_25", type: "increase", threshold: 25, enabled: true },
  { id: "price_decrease_25", type: "decrease", threshold: -25, enabled: true },
  { id: "volatility_high", type: "volatility", threshold: 50, enabled: true },
  { id: "volume_spike", type: "volume_spike", threshold: 200, enabled: true },
]

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [priceAlerts] = useState<PriceAlert[]>(DEFAULT_PRICE_ALERTS)
  const [lastPrice, setLastPrice] = useState<number | null>(null)
  const [lastVolume, setLastVolume] = useState<number | null>(null)
  const [lastStatus, setLastStatus] = useState<string | null>(null)
  const lastNotificationTime = useRef<Record<string, number>>({})
  const { data: tickerData, fetchTicker } = useTickerStore()

  useEffect(() => {
    const savedNotifications = localStorage.getItem("dos-notifications")
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }))
        setNotifications(parsed)
      } catch (error) {
        console.error("Failed to parse notifications:", error)
        setNotifications([])
      }
    }
  }, [])

  useEffect(() => {
    fetchTicker()
    const interval = setInterval(fetchTicker, 30000) // Fetch every 30 seconds
    return () => clearInterval(interval)
  }, [fetchTicker])

  useEffect(() => {
    if (!tickerData || tickerData.status === "error") return

    const currentPrice = tickerData.priceUsd
    const currentVolume = tickerData.volume24hUsd
    const priceChange24h = tickerData.change24hPct

    // Price change notifications
    if (lastPrice !== null && currentPrice > 0) {
      const priceChangePercent = ((currentPrice - lastPrice) / lastPrice) * 100

      priceAlerts.forEach((alert) => {
        if (!alert.enabled) return

        let shouldNotify = false
        let title = ""
        let message = ""

        switch (alert.type) {
          case "increase":
            if (priceChangePercent >= alert.threshold) {
              shouldNotify = true
              title = `🚀 DEUS Price Alert: +${priceChangePercent.toFixed(1)}%`
              message = `DEUS has increased by ${priceChangePercent.toFixed(1)}% to $${currentPrice.toFixed(6)} in the last update.`
            }
            break

          case "decrease":
            if (priceChangePercent <= alert.threshold) {
              shouldNotify = true
              title = `📉 DEUS Price Alert: ${priceChangePercent.toFixed(1)}%`
              message = `DEUS has decreased by ${Math.abs(priceChangePercent).toFixed(1)}% to $${currentPrice.toFixed(6)} in the last update.`
            }
            break

          case "volatility":
            if (Math.abs(priceChange24h) >= alert.threshold) {
              shouldNotify = true
              title = `⚡ High Volatility Alert`
              message = `DEUS is experiencing high volatility with a 24h change of ${priceChange24h > 0 ? "+" : ""}${priceChange24h.toFixed(1)}%.`
            }
            break

          case "volume_spike":
            if (lastVolume && currentVolume > lastVolume * (alert.threshold / 100)) {
              shouldNotify = true
              title = `📊 Volume Spike Alert`
              message = `DEUS trading volume has spiked to $${(currentVolume / 1000).toFixed(1)}K (24h), up ${(((currentVolume - lastVolume) / lastVolume) * 100).toFixed(0)}%.`
            }
            break
        }

        if (shouldNotify) {
          addNotification({
            type: "price",
            title,
            message,
            action: {
              label: "View Chart",
              onClick: () =>
                window.open(`https://dexscreener.com/base/0x73582df1cad3187cd0746b7a473d65c06386837e`, "_blank"),
            },
          })
        }
      })
    }

    // Status change notifications with throttling
    const now = Date.now()
    const NOTIFICATION_THROTTLE_MS = 5 * 60 * 1000 // 5 minutes

    if (tickerData.status === "degraded" && lastStatus !== "degraded") {
      const lastDegradedNotification = lastNotificationTime.current["status_degraded"] || 0
      const isLowLiquidity = tickerData.liquidityUsd < 10000
      const isLowVolume = tickerData.volume24hUsd < 100

      if ((isLowLiquidity || isLowVolume) && now - lastDegradedNotification > NOTIFICATION_THROTTLE_MS) {
        const reasons = []
        if (isLowLiquidity) reasons.push(`low liquidity ($${tickerData.liquidityUsd.toFixed(0)})`)
        if (isLowVolume) reasons.push(`low volume ($${tickerData.volume24hUsd.toFixed(0)})`)

        addNotification({
          type: "warning",
          title: "⚠️ Price Data Quality Degraded",
          message: `DEUS price data quality has been reduced due to ${reasons.join(" and ")}.`,
        })
        lastNotificationTime.current["status_degraded"] = now
      }
    }

    if (tickerData.status === "live" && lastStatus === "degraded") {
      const lastRestoredNotification = lastNotificationTime.current["status_restored"] || 0
      if (now - lastRestoredNotification > NOTIFICATION_THROTTLE_MS) {
        addNotification({
          type: "success",
          title: "✅ Price Data Quality Restored",
          message: "DEUS price data quality has been restored with improved liquidity and trading activity.",
        })
        lastNotificationTime.current["status_restored"] = now
      }
    }

    // Market cap milestones
    if (tickerData.marketCapUsd) {
      const marketCap = tickerData.marketCapUsd
      if (marketCap >= 100000000 && (!lastPrice || lastPrice * (tickerData.marketCapUsd / currentPrice) < 100000000)) {
        addNotification({
          type: "success",
          title: "🎉 Market Cap Milestone",
          message: `DEUS has reached a market cap of $${(marketCap / 1000000).toFixed(1)}M!`,
        })
      }
    }

    setLastPrice(currentPrice)
    setLastVolume(currentVolume)
    setLastStatus(tickerData.status)
  }, [tickerData, lastPrice, lastVolume, priceAlerts, lastStatus])

  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    localStorage.setItem("dos-notifications", JSON.stringify(newNotifications))
    setNotifications(newNotifications)
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, 50) // Keep only last 50 notifications
      localStorage.setItem("dos-notifications", JSON.stringify(updated))
      return updated
    })
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      localStorage.setItem("dos-notifications", JSON.stringify(updated))
      return updated
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      localStorage.setItem("dos-notifications", JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      localStorage.setItem("dos-notifications", JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    localStorage.removeItem("dos-notifications")
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("dos-welcome-seen")
    if (!hasSeenWelcome && notifications.length === 0) {
      addNotification({
        type: "success",
        title: "🎯 Welcome to D.O.S.!",
        message:
          "Your DEUS Operating System is now monitoring live price data and will alert you to important market movements.",
      })
      localStorage.setItem("dos-welcome-seen", "true")
    }
  }, [notifications.length, addNotification])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    tickerData,
    isLive: tickerData?.status === "live",
  }
}
