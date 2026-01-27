"use client"

import { useEffect, useState, useCallback } from "react"
import { useWallet } from "@/contexts/wallet-context"

export interface WalletConnectionStatus {
  isConnected: boolean
  isConnecting: boolean
  address: string | null
  hasPendingConnection: boolean
  error: string | null
}

/**
 * Hook to monitor wallet connection status with improved reactivity
 * Triggers re-renders when connection state changes
 */
export function useWalletConnectionStatus(): WalletConnectionStatus & {
  tryConnect: (type?: "metamask" | "walletconnect") => Promise<void>
  retry: () => void
} {
  const walletContext = useWallet()
  const { isConnected, isConnecting, address, connectWallet } = walletContext
  const [hasPendingConnection, setHasPendingConnection] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track connection state changes
  useEffect(() => {
    console.log("[v0] useWalletConnectionStatus: Connection status updated", {
      isConnected,
      isConnecting,
      address,
    })
    setError(null)
    setHasPendingConnection(false)
  }, [isConnected, address])

  useEffect(() => {
    if (isConnecting) {
      setHasPendingConnection(true)
    }
  }, [isConnecting])

  const tryConnect = useCallback(
    async (type: "metamask" | "walletconnect" = "metamask") => {
      setHasPendingConnection(true)
      setError(null)
      try {
        console.log("[v0] useWalletConnectionStatus: Attempting wallet connection")
        await connectWallet(type)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet"
        setError(errorMessage)
        console.error("[v0] useWalletConnectionStatus: Connection error:", err)
        setHasPendingConnection(false)
      }
    },
    [connectWallet],
  )

  const retry = useCallback(() => {
    console.log("[v0] useWalletConnectionStatus: Retrying connection")
    tryConnect()
  }, [tryConnect])

  return {
    isConnected,
    isConnecting: isConnecting || hasPendingConnection,
    address: address || null,
    hasPendingConnection,
    error,
    tryConnect,
    retry,
  }
}
