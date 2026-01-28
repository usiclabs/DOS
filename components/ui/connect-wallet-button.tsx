"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ConnectWalletButtonProps {
  /**
   * Callback when wallet connect button is clicked
   */
  onConnect: (walletType: string) => Promise<void>
  /**
   * Callback when wallet disconnect button is clicked
   */
  onDisconnect?: () => void
  /**
   * Whether wallet is currently connected
   */
  isConnected?: boolean
  /**
   * Wallet address (if connected)
   */
  address?: string | null
  /**
   * Wallet balance (if connected)
   */
  balance?: string
  /**
   * Whether connection is in progress
   */
  isConnecting?: boolean
  /**
   * Button size variant
   */
  size?: "sm" | "md" | "lg"
  /**
   * Custom className for the button
   */
  className?: string
  /**
   * Whether to show as inline button or dropdown
   */
  variant?: "button" | "dropdown"
  /**
   * Network display
   */
  network?: string
}

const formatAddress = (addr: string | undefined | null) => {
  if (!addr) return "0x0000...0000"
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function ConnectWalletButton({
  onConnect,
  onDisconnect,
  isConnected = false,
  address,
  balance = "0",
  isConnecting = false,
  size = "md",
  className,
  variant = "dropdown",
  network = "Base",
}: ConnectWalletButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = useCallback(async (walletType: string) => {
    setIsLoading(true)
    try {
      await onConnect(walletType)
    } catch (error) {
      console.error("[v0] Wallet connection failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [onConnect])

  const handleDisconnect = useCallback(() => {
    onDisconnect?.()
  }, [onDisconnect])

  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  }

  // Disconnected state - show connect button
  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={() => handleConnect("metamask")}
          disabled={isLoading || isConnecting}
          className={cn(
            "btn-premium gap-2 glow-button transition-all duration-300",
            sizeClasses[size],
            className,
          )}
        >
          {isLoading || isConnecting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Loader2 className="h-4 w-4" />
              </motion.div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </>
          )}
        </Button>
      </motion.div>
    )
  }

  // Connected state - show dropdown
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {variant === "dropdown" ? (
        <div className="flex items-center gap-2">
          {network && (
            <Button
              variant="outline"
              size="sm"
              className="glass-card border-accent/30 text-accent hover:bg-accent/10 bg-transparent"
            >
              {network}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={cn(
                  "bg-accent text-accent-foreground hover:bg-accent/90 glow-button gap-2 transition-all duration-300",
                  sizeClasses[size],
                  className,
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-mono">{formatAddress(address)}</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card w-56">
              {balance && (
                <>
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="text-sm font-semibold text-white">{balance} ETH</p>
                  </div>
                </>
              )}
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(address || "")}
                className="cursor-pointer text-xs"
              >
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`https://basescan.org/address/${address}`, "_blank")}
                className="cursor-pointer text-xs"
              >
                View on BaseScan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-xs text-destructive">
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Button
          onClick={handleDisconnect}
          className={cn(
            "bg-accent text-accent-foreground hover:bg-accent/90 glow-button gap-2 transition-all duration-300",
            sizeClasses[size],
            className,
          )}
        >
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono">{formatAddress(address)}</span>
        </Button>
      )}
    </motion.div>
  )
}
