"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { formatEther, type Address } from "viem"
import { toast } from "sonner"
import { getPublicClient } from "@/lib/rpc-client"

interface WalletContextType {
  address: Address | null
  balance: string
  isConnecting: boolean
  isConnected: boolean
  connectWallet: (type?: "metamask" | "walletconnect") => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Alchemy public client for balance checks (avoid MetaMask rate limiting)
const publicClient = getPublicClient()

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null)
  const [balance, setBalance] = useState("0")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Fetch balance using Alchemy (not MetaMask)
  const fetchBalance = useCallback(async (addr: Address) => {
    try {
      console.log("[v0] Fetching balance via Alchemy for:", addr)
      const balanceWei = await publicClient.getBalance({ address: addr })
      const balanceEth = formatEther(balanceWei)
      setBalance(balanceEth)
      console.log("[v0] Balance fetched via Alchemy:", balanceEth, "ETH")
    } catch (error) {
      console.error("[v0] Error fetching balance:", error)
    }
  }, [])

  // Check for existing wallet connection (only once on mount)
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === "undefined" || !window.ethereum) return

      try {
        console.log("[v0] WalletProvider: Checking for existing wallet connection...")
        const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[]

        if (accounts.length > 0) {
          const addr = accounts[0] as Address
          console.log("[v0] WalletProvider: Found connected account:", addr)
          setAddress(addr)
          setIsConnected(true)
          await fetchBalance(addr)
        } else {
          console.log("[v0] WalletProvider: No accounts found")
        }
      } catch (error) {
        console.error("[v0] WalletProvider: Error checking connection:", error)
      }
    }

    checkConnection()
  }, [fetchBalance])

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("[v0] WalletProvider: Accounts changed:", accounts)
      if (accounts.length > 0) {
        const addr = accounts[0] as Address
        setAddress(addr)
        setIsConnected(true)
        fetchBalance(addr)
      } else {
        setAddress(null)
        setBalance("0")
        setIsConnected(false)
      }
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [fetchBalance])

  // Connect wallet
  const connectWallet = useCallback(
    async (type: "metamask" | "walletconnect" = "metamask") => {
      if (typeof window === "undefined" || !window.ethereum) {
        toast.error("Please install MetaMask to continue")
        return
      }

      setIsConnecting(true)
      try {
        console.log("[v0] WalletProvider: Requesting account access...")
        const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[]

        if (accounts.length > 0) {
          const addr = accounts[0] as Address
          console.log("[v0] WalletProvider: Accounts received:", accounts)
          setAddress(addr)
          setIsConnected(true)
          await fetchBalance(addr)

          // Switch to Base chain
          try {
            console.log("[v0] WalletProvider: Switching to Base chain...")
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x2105" }],
            })
            console.log("[v0] WalletProvider: Successfully switched to Base chain")
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x2105",
                    chainName: "Base",
                    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                    rpcUrls: ["https://mainnet.base.org"],
                    blockExplorerUrls: ["https://basescan.org"],
                  },
                ],
              })
            }
          }

          toast.success("Wallet connected successfully!")
        }
      } catch (error: any) {
        console.error("[v0] WalletProvider: Error connecting wallet:", error)
        toast.error(error.message || "Failed to connect wallet")
      } finally {
        setIsConnecting(false)
      }
    },
    [fetchBalance],
  )

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setBalance("0")
    setIsConnected(false)
    toast.success("Wallet disconnected")
  }, [])

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnecting,
        isConnected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWalletContext must be used within WalletProvider")
  }
  return context
}

export function useWallet() {
  const context = useWalletContext()

  // Return extended interface to match old useWallet hook
  return {
    ...context,
    network: "Base",
    walletType: context.isConnected ? ("metamask" as const) : null,
    isChecking: false, // No longer needed with centralized provider
  }
}
