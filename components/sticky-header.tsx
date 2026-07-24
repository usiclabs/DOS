"use client"

import { useState, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/ui/connect-wallet-button"
import { WalletConnectModal } from "@/components/wallet/wallet-connect-modal"
import { HelpCenter } from "@/components/help/help-center"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { SettingsModal } from "@/components/settings/settings-modal"
import { useWallet } from "@/hooks/use-wallet"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { SUPPORTED_CHAINS } from "@/lib/constants"

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/pools", label: "Pools" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/lp-manager", label: "LP Manager" },
  // { href: "/creators", label: "Creators" }, // Temporarily hidden
  { href: "/analytics", label: "Analytics" },
  { href: "/treasury", label: "Treasury" },
  { href: "/swap", label: "Swap" },
]

const NavItem = memo(
  ({ item, pathname, onClick }: { item: (typeof navItems)[0]; pathname: string; onClick?: () => void }) => {
    const isActive = pathname === item.href

    return (
      <Link href={item.href} onClick={onClick}>
        <Button
          variant="ghost"
          className={cn(
            "text-gray-400 hover:text-white hover:bg-accent/15 font-medium transition-all duration-300 px-3 py-2 rounded-[0.5rem] text-xs",
            isActive && "text-emerald-400 bg-accent/20 shadow-md border border-accent/40 neon-glow",
          )}
          aria-current={isActive ? "page" : undefined}
        >
          {item.label}
        </Button>
      </Link>
    )
  },
)
NavItem.displayName = "NavItem"

export function StickyHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  const { isConnected, address, balance, network, walletType, connectWallet, disconnectWallet, switchChain, activeChain } = useWallet()

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleConnectWallet = useCallback(() => {
    setIsWalletModalOpen(true)
  }, [])

  const handleWalletConnect = useCallback(
    async (walletType: string) => {
      await connectWallet(walletType as "metamask" | "walletconnect")
      setIsWalletModalOpen(false)
    },
    [connectWallet],
  )

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const formatAddress = useCallback((addr: string | undefined | null) => {
    if (!addr) return "0x0000...0000"
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full glass-card border-b border-accent/20 backdrop-blur-xl transition-all duration-300",
          isScrolled ? "shadow-2xl shadow-black/50" : "shadow-2xl",
        )}
        role="banner"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2">
                <NotificationCenter />
                <HelpCenter />
                <SettingsModal />
              </div>

              {isConnected ? (
                <ConnectWalletButton
                  isConnected={isConnected}
                  address={address}
                  balance={balance}
                  onConnect={handleWalletConnect}
                  onDisconnect={disconnectWallet}
                  onSwitchChain={switchChain}
                  network={activeChain.name}
                  activeChainKey={Object.keys(SUPPORTED_CHAINS).find(k => SUPPORTED_CHAINS[k].id === activeChain.id) ?? "base"}
                  variant="dropdown"
                  size="md"
                  className="hidden md:flex"
                />
              ) : (
                <Button
                  onClick={handleConnectWallet}
                  className="btn-premium text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-6 py-3 hidden md:flex gap-2 glow-button"
                  aria-label="Connect wallet"
                >
                  Connect Wallet
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-300 hover:text-white hover:bg-accent/20 rounded-xl"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                id="mobile-menu"
                className="lg:hidden border-t border-accent/20 py-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <nav className="flex flex-col space-y-3" role="navigation" aria-label="Mobile navigation">
                  {navItems.map((item) => (
                    <NavItem key={item.href} item={item} pathname={pathname} onClick={closeMenu} />
                  ))}

                  <div className="pt-4 border-t border-accent/20 space-y-3">
                    <div className="flex items-center space-x-2">
                      <NotificationCenter />
                      <HelpCenter />
                      <SettingsModal />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-accent/20">
                    {isConnected ? (
                      <ConnectWalletButton
                        isConnected={isConnected}
                        address={address}
                        balance={balance}
                        onConnect={handleWalletConnect}
                        onDisconnect={disconnectWallet}
                        onSwitchChain={switchChain}
                        network={activeChain.name}
                        activeChainKey={Object.keys(SUPPORTED_CHAINS).find(k => SUPPORTED_CHAINS[k].id === activeChain.id) ?? "base"}
                        variant="dropdown"
                        size="md"
                        className="w-full"
                      />
                    ) : (
                      <Button
                        onClick={handleConnectWallet}
                        className="w-full btn-premium text-white shadow-xl gap-2 glow-button"
                        aria-label="Connect wallet"
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </>
  )
}
