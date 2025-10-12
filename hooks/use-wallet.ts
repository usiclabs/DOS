"use client"

import { useState, useEffect, useCallback } from "react"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      console.log("[v0] useWallet: Checking for existing wallet connection...")
      setIsChecking(true)

      if (typeof window !== "undefined" && window.ethereum) {
        try {
          console.log("[v0] useWallet: window.ethereum found, requesting accounts...")
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          console.log("[v0] useWallet: Accounts response:", accounts)

          if (accounts.length > 0) {
            console.log("[v0] useWallet: Found connected account:", accounts[0])
            setAddress(accounts[0])
            setIsConnected(true)
            await fetchBalance(accounts[0])
          } else {
            console.log("[v0] useWallet: No accounts found")
          }
        } catch (error) {
          console.error("[v0] useWallet: Failed to check wallet connection:", error)
        }
      } else {
        console.log("[v0] useWallet: window.ethereum not found")
      }

      setIsChecking(false)
    }

    // Add a small delay to ensure ethereum provider is ready
    const timer = setTimeout(checkConnection, 100)
    return () => clearTimeout(timer)
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("[v0] useWallet: Accounts changed:", accounts)
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          fetchBalance(accounts[0])
        } else {
          setAddress(null)
          setIsConnected(false)
          setBalance(null)
        }
      }

      const handleChainChanged = (chainId: string) => {
        console.log("[v0] useWallet: Chain changed:", chainId)
        // Reload the page when chain changes
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const fetchBalance = async (addr: string) => {
    try {
      if (window.ethereum) {
        const balanceHex = await window.ethereum.request({
          method: "eth_getBalance",
          params: [addr, "latest"],
        })
        const balanceWei = Number.parseInt(balanceHex, 16)
        const balanceEth = balanceWei / 1e18
        setBalance(balanceEth.toFixed(4))
        console.log("[v0] useWallet: Balance fetched:", balanceEth.toFixed(4), "ETH")
      }
    } catch (error) {
      console.error("[v0] useWallet: Failed to fetch balance:", error)
    }
  }

  const connectWallet = async (walletType?: string) => {
    console.log("[v0] useWallet: Connect wallet requested, type:", walletType)

    if (typeof window === "undefined" || !window.ethereum) {
      console.error("[v0] useWallet: No ethereum provider found. Please install MetaMask.")
      alert("Please install MetaMask or another Web3 wallet to continue.")
      return false
    }

    setIsConnecting(true)
    try {
      console.log("[v0] useWallet: Requesting account access...")

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      console.log("[v0] useWallet: Accounts received:", accounts)

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
        await fetchBalance(accounts[0])

        // Switch to Base chain (chainId: 8453 = 0x2105)
        try {
          console.log("[v0] useWallet: Switching to Base chain...")
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }],
          })
          console.log("[v0] useWallet: Successfully switched to Base chain")
        } catch (switchError: any) {
          console.log("[v0] useWallet: Switch error:", switchError)
          // Chain not added, try to add it
          if (switchError.code === 4902) {
            try {
              console.log("[v0] useWallet: Adding Base chain...")
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x2105",
                    chainName: "Base",
                    nativeCurrency: {
                      name: "Ethereum",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://mainnet.base.org"],
                    blockExplorerUrls: ["https://basescan.org"],
                  },
                ],
              })
              console.log("[v0] useWallet: Successfully added Base chain")
            } catch (addError) {
              console.error("[v0] useWallet: Failed to add Base chain:", addError)
            }
          }
        }

        setIsConnecting(false)
        console.log("[v0] useWallet: Connection successful!")
        return true
      }
    } catch (error) {
      console.error("[v0] useWallet: Failed to connect wallet:", error)
      setIsConnecting(false)
      return false
    }

    setIsConnecting(false)
    return false
  }

  const disconnectWallet = useCallback(() => {
    console.log("[v0] useWallet: Disconnecting wallet")
    setAddress(null)
    setIsConnected(false)
    setBalance(null)
  }, [])

  return {
    isConnected,
    address,
    balance,
    network: "Base",
    walletType: isConnected ? "metamask" : null,
    isConnecting,
    isChecking,
    connectWallet,
    disconnectWallet,
  }
}
