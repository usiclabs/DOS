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
  { href: "/auto-trade", label: "Auto-Trade" },
  { href: "/taxes", label: "Taxes" },
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
            <Link href="/" className="flex items-center gap-3 group" aria-label="Clanker Operating System Home">
              <motion.div className="relative" whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-all duration-300"
                >
                  <path
                    d="M8 38 L24 8 L40 38 Z"
                    fill="url(#wizardGradient)"
                    stroke="url(#wizardStroke)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <ellipse
                    cx="24"
                    cy="38"
                    rx="18"
                    ry="4"
                    fill="url(#brimGradient)"
                    stroke="url(#wizardStroke)"
                    strokeWidth="1.5"
                  />
                  <circle cx="24" cy="20" r="2" fill="#22d3ee" opacity="0.9" />
                  <circle cx="20" cy="26" r="1.5" fill="#a78bfa" opacity="0.8" />
                  <circle cx="28" cy="26" r="1.5" fill="#a78bfa" opacity="0.8" />
                  <circle cx="24" cy="30" r="1" fill="#22d3ee" opacity="0.7" />
                  <path d="M16 16 L17 18 L16 20 L14 18 Z" fill="#22d3ee" opacity="0.6" />
                  <path d="M32 16 L33 18 L32 20 L30 18 Z" fill="#a78bfa" opacity="0.6" />
                  <defs>
                    <linearGradient id="wizardGradient" x1="24" y1="8" x2="24" y2="38" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#6d28d9" />
                    </linearGradient>
                    <linearGradient id="wizardStroke" x1="8" y1="8" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                    <linearGradient id="brimGradient" x1="6" y1="38" x2="42" y2="38" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6d28d9" />
                      <stop offset="50%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#6d28d9" />
                    </linearGradient>
                  </defs>
                </svg>
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
                CLANKER
              </span>
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
