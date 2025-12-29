"use client"

import { useWallet } from "@/hooks/useWallet"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, LogOut, Loader2, Wallet } from "lucide-react"

export function WalletButton() {
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      await connectWallet()
    } catch (error) {
      console.error("[v0] Wallet connection failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isConnected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="glass-card hover:bg-accent/10 gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-sm">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card w-56">
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(address)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`https://basescan.org/address/${address}`, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View on BaseScan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button onClick={handleConnect} disabled={isLoading} className="btn-premium gap-2">
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Loader2 className="h-4 w-4" />
            </motion.div>
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    </motion.div>
  )
}
