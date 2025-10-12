"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, Wallet, BarChart3, Droplets, Vote, Vault } from "lucide-react"
import { motion } from "framer-motion"
import { memo, useCallback } from "react"

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Pools",
    href: "/pools",
    icon: Droplets,
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: Wallet,
  },
  {
    name: "Treasury",
    href: "/treasury",
    icon: Vault,
  },
  {
    name: "Vote",
    href: "/governance",
    icon: Vote,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
]

const triggerHapticFeedback = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(10)
    } catch (error) {
      // Silently fail if vibration is not supported
    }
  }
}

const NavigationItem = memo(
  ({
    item,
    isActive,
    onClick,
  }: {
    item: (typeof navigationItems)[0]
    isActive: boolean
    onClick: () => void
  }) => {
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "relative flex flex-col items-center justify-center px-3 py-2 transition-all duration-300 min-w-0 flex-1 rounded-lg touch-manipulation",
          isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
        )}
        aria-label={item.name}
        aria-current={isActive ? "page" : undefined}
      >
        <motion.div
          animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        >
          <Icon className="h-5 w-5 mb-1" aria-hidden="true" />
        </motion.div>
        <span className="text-xs font-medium truncate">{item.name}</span>
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"
            style={{
              boxShadow:
                "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    )
  },
)
NavigationItem.displayName = "NavigationItem"

export function MobileNavigation() {
  const pathname = usePathname()

  const handleNavClick = useCallback(() => {
    triggerHapticFeedback()
  }, [])

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/30 backdrop-blur-xl border-t border-white/10"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navigationItems.map((item) => (
          <NavigationItem key={item.name} item={item} isActive={pathname === item.href} onClick={handleNavClick} />
        ))}
      </div>
    </nav>
  )
}
