"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { formatEther, type Address } from "viem"
import { toast } from "sonner"
import { getPublicClient } from "@/lib/rpc-client"
import { SUPPORTED_CHAINS, getChainByHexId, type ChainConfig } from "@/lib/constants"

interface WalletContextType {
  address: Address | null
  balance: string
  isConnecting: boolean
  isConnected: boolean
  chainId: number | null
  activeChain: ChainConfig
  connectWallet: (type?: "metamask" | "walletconnect") => Promise<void>
  disconnectWallet: () => void
  switchChain: (chainKey: string) => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Alchemy public client for balance checks (avoid MetaMask rate limiting)
const publicClient = getPublicClient()

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null)
  const [balance, setBalance] = useState("0")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [activeChain, setActiveChain] = useState<ChainConfig>(SUPPORTED_CHAINS.base)

  // Fetch balance using Alchemy (not MetaMask)
  const fetchBalance = useCallback(async (addr: Address) => {
    try {
      console.log("[v0] Fetching balance via Alchemy for:", addr)
      const balanceWei = await publicClient!.getBalance({ address: addr })
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

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[]
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

    const handleChainChanged = (...args: unknown[]) => {
      const hexId = args[0] as string
      console.log("[v0] WalletProvider: Chain changed to:", hexId)
      const numId = parseInt(hexId, 16)
      setChainId(numId)
      const matched = getChainByHexId(hexId)
      if (matched) {
        setActiveChain(matched)
        console.log("[v0] WalletProvider: Switched to supported chain:", matched.name)
      } else {
        console.warn("[v0] WalletProvider: Unsupported chain:", hexId)
      }
    }

    // Add event listeners with proper error handling
    const addListeners = () => {
      try {
        window.ethereum!.on?.("accountsChanged", handleAccountsChanged)
        window.ethereum!.on?.("chainChanged", handleChainChanged)
        console.log("[v0] WalletProvider: Event listeners registered")
      } catch (error) {
        console.error("[v0] WalletProvider: Error registering event listeners:", error)
      }
    }

    const removeListeners = () => {
      try {
        window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged)
        window.ethereum?.removeListener?.("chainChanged", handleChainChanged)
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

          // Detect current chain
          try {
            const currentChainHex = await window.ethereum.request({ method: "eth_chainId" }) as string
            const numId = parseInt(currentChainHex, 16)
            setChainId(numId)
            const matched = getChainByHexId(currentChainHex)
            if (matched) setActiveChain(matched)
          } catch { /* ignore */ }

          toast.success("Wallet connected successfully!")
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

  // Switch chain
  const switchChain = useCallback(async (chainKey: string) => {
    const chain = SUPPORTED_CHAINS[chainKey]
    if (!chain) {
      toast.error("Unsupported chain")
      return
    }

    if (!window.ethereum) {
      toast.error("No wallet detected")
      return
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chain.hexId }],
      })
      setActiveChain(chain)
      setChainId(chain.id)
      toast.success(`Switched to ${chain.name}`)
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added yet — add it
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chain.hexId,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: chain.rpcUrls,
                blockExplorerUrls: [chain.blockExplorerUrl],
              },
            ],
          })
          setActiveChain(chain)
          setChainId(chain.id)
          toast.success(`${chain.name} added and selected`)
        } catch (addError) {
          console.error("[v0] WalletProvider: Error adding chain:", addError)
          toast.error(`Failed to add ${chain.name}`)
        }
      } else {
        console.error("[v0] WalletProvider: Error switching chain:", switchError)
        toast.error(`Failed to switch to ${chain.name}`)
      }
    }
  }, [])

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
        chainId,
        activeChain,
        connectWallet,
        disconnectWallet,
        switchChain,
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

  return {
    ...context,
    network: context.activeChain.name,
    walletType: context.isConnected ? ("metamask" as const) : null,
    isChecking: false,
  }
}
