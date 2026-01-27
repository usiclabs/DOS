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

  // Listen for account changes and chain changes with improved event handling
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("[v0] WalletProvider: Accounts changed event fired, accounts:", accounts.length)
      if (accounts.length > 0) {
        const addr = accounts[0] as Address
        setAddress(addr)
        setIsConnected(true)
        fetchBalance(addr)
        console.log("[v0] WalletProvider: Wallet connected with address:", addr)
      } else {
        setAddress(null)
        setBalance("0")
        setIsConnected(false)
        console.log("[v0] WalletProvider: Wallet disconnected")
      }
    }

    const handleChainChanged = (chainId: string) => {
      console.log("[v0] WalletProvider: Chain changed to:", chainId)
      // Verify we're on Base (0x2105)
      if (chainId !== "0x2105") {
        console.warn("[v0] WalletProvider: Not on Base chain, chainId:", chainId)
      } else {
        console.log("[v0] WalletProvider: On Base chain (0x2105)")
      }
    }

    // Add event listeners with proper error handling
    const addListeners = () => {
      try {
        window.ethereum.on("accountsChanged", handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)
        console.log("[v0] WalletProvider: Event listeners registered")
      } catch (error) {
        console.error("[v0] WalletProvider: Error registering event listeners:", error)
      }
    }

    const removeListeners = () => {
      try {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum?.removeListener("chainChanged", handleChainChanged)
        console.log("[v0] WalletProvider: Event listeners removed")
      } catch (error) {
        console.error("[v0] WalletProvider: Error removing event listeners:", error)
      }
    }

    addListeners()
    return removeListeners
  }, [fetchBalance])

  // Connect wallet with improved state management
  const connectWallet = useCallback(
    async (type: "metamask" | "walletconnect" = "metamask") => {
      if (typeof window === "undefined" || !window.ethereum) {
        toast.error("Please install MetaMask to continue")
        console.error("[v0] WalletProvider: window.ethereum is not available")
        return
      }

      setIsConnecting(true)
      console.log("[v0] WalletProvider: Starting wallet connection process, type:", type)
      try {
        console.log("[v0] WalletProvider: Requesting account access...")
        const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[]

        if (accounts.length > 0) {
          const addr = accounts[0] as Address
          console.log("[v0] WalletProvider: Accounts received, setting address:", addr)
          
          // Update state immediately for UI responsiveness
          setAddress(addr)
          setIsConnected(true)
          console.log("[v0] WalletProvider: State updated - isConnected: true, address:", addr)
          
          // Fetch balance in parallel
          await fetchBalance(addr)

          // Switch to Base chain
          try {
            console.log("[v0] WalletProvider: Switching to Base chain (0x2105)...")
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x2105" }],
            })
            console.log("[v0] WalletProvider: Successfully switched to Base chain")
            toast.success("Wallet connected successfully!")
          } catch (switchError: any) {
            console.log("[v0] WalletProvider: Chain switch error code:", switchError.code)
            if (switchError.code === 4902) {
              try {
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
                console.log("[v0] WalletProvider: Base chain added successfully")
                toast.success("Wallet connected successfully!")
              } catch (addError) {
                console.error("[v0] WalletProvider: Error adding Base chain:", addError)
                toast.warning("Wallet connected but Base chain wasn't added. Please add it manually.")
              }
            } else {
              console.error("[v0] WalletProvider: Error switching chain:", switchError)
              toast.warning("Wallet connected but couldn't switch to Base chain.")
            }
          }
        } else {
          console.log("[v0] WalletProvider: No accounts returned from request")
          toast.error("No accounts found. Please try again.")
        }
      } catch (error: any) {
        console.error("[v0] WalletProvider: Error connecting wallet:", error)
        if (error.code === 4001) {
          // User rejected the request
          console.log("[v0] WalletProvider: User rejected connection request")
        } else {
          toast.error(error.message || "Failed to connect wallet")
        }
      } finally {
        setIsConnecting(false)
        console.log("[v0] WalletProvider: Connection process completed")
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
