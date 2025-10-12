"use client"

import { Button } from "@/components/ui/button"
import { Wallet, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWallet } from "@/hooks/use-wallet"

export function WalletConnect() {
  const { isConnected, address, balance, disconnectWallet, connectWallet, isConnecting } = useWallet()

  const handleConnect = async () => {
    try {
      await connectWallet("metamask")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-accent text-accent-foreground hover:bg-accent/90 neon-glow"
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/10 bg-transparent">
        Base
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <div className="flex items-center space-x-2">
              <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border border-border"
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-lg font-semibold">{balance} ETH</p>
          </div>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => window.open(`https://basescan.org/address/${address}`, "_blank")}
          >
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigator.clipboard.writeText(address || "")}>
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-red-400" onClick={disconnectWallet}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
