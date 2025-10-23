"use client"

import { useState, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WalletConnectModal } from "@/components/wallet/wallet-connect-modal"
import { HelpCenter } from "@/components/help/help-center"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { SettingsModal } from "@/components/settings/settings-modal"
import { useWallet } from "@/hooks/use-wallet"
import { Menu, X, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/pools", label: "Pools" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/lp-manager", label: "LP Manager" },
  { href: "/creators", label: "Creators" },
  { href: "/analytics", label: "Analytics" },
  { href: "/treasury", label: "Treasury" },
  { href: "/swap", label: "Swap" },
  { href: "/token-factory", label: "Token Factory" },
  { href: "/auto-trade", label: "Auto-Trade" }, // Added auto-trade link
]

const NavItem = memo(
  ({ item, pathname, onClick }: { item: (typeof navItems)[0]; pathname: string; onClick?: () => void }) => {
    const isActive = pathname === item.href

    return (
      <Link href={item.href} onClick={onClick}>
        <Button
          variant="ghost"
          className={cn(
            "text-gray-300 hover:text-white hover:bg-accent/20 font-medium transition-all duration-300 px-3 py-2 rounded-xl text-xs",
            isActive && "text-orange-500 bg-accent/30 shadow-lg border border-accent/30 animate-pulse-glow",
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

  const { isConnected, address, balance, network, walletType, connectWallet, disconnectWallet } = useWallet()

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
      await connectWallet(walletType)
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
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" aria-label="DEUS Operating System Home">
              <motion.svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-300"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <rect
                  x="6"
                  y="6"
                  width="36"
                  height="36"
                  rx="8"
                  stroke="url(#gradient1)"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                <path
                  d="M 14 24 L 24 14 L 34 24 L 24 34 Z"
                  stroke="url(#gradient2)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  className="transition-all duration-300"
                />
                <line
                  x1="24"
                  y1="18"
                  x2="24"
                  y2="30"
                  stroke="url(#gradient3)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <line
                  x1="18"
                  y1="24"
                  x2="30"
                  y2="24"
                  stroke="url(#gradient3)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="gradient1" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#eb5a3c" />
                    <stop offset="100%" stopColor="#daa520" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="14" y1="14" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f56e50" />
                    <stop offset="100%" stopColor="#eb5a3c" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#daa520" />
                    <stop offset="100%" stopColor="#f56e50" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </Link>

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
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="hidden sm:flex items-center space-x-3 px-4 py-3 rounded-xl glass-card border border-accent/20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" aria-label="Connected"></div>
                    <span className="text-sm text-white font-medium">{formatAddress(address)}</span>
                  </motion.div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="glass-card border-accent/30 text-accent-light hover:bg-accent/20 hover:border-accent/50 px-4 py-2 bg-transparent"
                    aria-label="Disconnect wallet"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnectWallet}
                  className="btn-premium text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-6 py-3"
                  aria-label="Connect wallet"
                >
                  <Wallet className="h-4 w-4 mr-2" aria-hidden="true" />
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
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl glass-card">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" aria-label="Connected"></div>
                          <span className="text-sm text-white font-medium">{formatAddress(address)}</span>
                        </div>
                        <Button
                          variant="outline"
                          onClick={disconnectWallet}
                          className="w-full glass-card border-accent/30 text-accent-light hover:bg-accent/20 bg-transparent"
                          aria-label="Disconnect wallet"
                        >
                          Disconnect Wallet
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleConnectWallet}
                        className="w-full btn-premium text-white shadow-xl"
                        aria-label="Connect wallet"
                      >
                        <Wallet className="h-4 w-4 mr-2" aria-hidden="true" />
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
