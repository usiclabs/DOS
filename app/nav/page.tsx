"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import {
  LayoutDashboard,
  Droplets,
  Wallet,
  TrendingUp,
  Users,
  BarChart3,
  Vault,
  Vote,
  ArrowLeftRight,
  Sparkles,
  Bot,
  LineChart,
  UserCircle,
  Share2,
  Layers,
  Globe,
  Building2,
  Settings,
  HelpCircle,
  Zap,
  Search,
  X,
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  gradient: string
  description: string
  category: string
}

const navItems: NavItem[] = [
  // Core Features
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    gradient: "from-red-500 to-orange-600",
    description: "Platform overview",
    category: "Core",
  },
  {
    name: "Pools",
    href: "/pools",
    icon: Droplets,
    gradient: "from-cyan-500 to-blue-600",
    description: "Liquidity pools",
    category: "Core",
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: Wallet,
    gradient: "from-purple-500 to-pink-600",
    description: "Your holdings",
    category: "Core",
  },
  {
    name: "LP Manager",
    href: "/lp-manager",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-green-600",
    description: "Manage positions",
    category: "Core",
  },
  {
    name: "Swap",
    href: "/swap",
    icon: ArrowLeftRight,
    gradient: "from-orange-500 to-amber-600",
    description: "Token swaps",
    category: "Core",
  },
  {
    name: "DEX",
    href: "/dex",
    icon: TrendingUp,
    gradient: "from-red-500 to-orange-600",
    description: "Trending tokens",
    category: "Core",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    gradient: "from-indigo-500 to-purple-600",
    description: "Platform metrics",
    category: "Core",
  },

  // DeFi Features
  {
    name: "Creators",
    href: "/creators",
    icon: Users,
    gradient: "from-pink-500 to-rose-600",
    description: "Token creators",
    category: "DeFi",
  },
  {
    name: "Token Factory",
    href: "/token-factory",
    icon: Sparkles,
    gradient: "from-yellow-500 to-orange-600",
    description: "Deploy tokens",
    category: "DeFi",
  },
  {
    name: "Clanker",
    href: "/clanker",
    icon: Sparkles,
    gradient: "from-orange-500 to-red-600",
    description: "Token launcher",
    category: "DeFi",
  },
  {
    name: "Migration",
    href: "/migration",
    icon: ArrowLeftRight,
    gradient: "from-red-500 to-orange-600",
    description: "Token migration",
    category: "DeFi",
  },
  {
    name: "Treasury",
    href: "/treasury",
    icon: Vault,
    gradient: "from-emerald-500 to-teal-600",
    description: "Protocol treasury",
    category: "DeFi",
  },
  {
    name: "Governance",
    href: "/governance",
    icon: Vote,
    gradient: "from-blue-500 to-indigo-600",
    description: "Vote on proposals",
    category: "DeFi",
  },

  // Advanced Trading
  {
    name: "Auto-Trade",
    href: "/auto-trade",
    icon: Bot,
    gradient: "from-cyan-500 to-blue-600",
    description: "Automated trading",
    category: "Trading",
  },
  {
    name: "Trading",
    href: "/trading",
    icon: LineChart,
    gradient: "from-red-500 to-orange-600",
    description: "Advanced trading",
    category: "Trading",
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: UserCircle,
    gradient: "from-violet-500 to-purple-600",
    description: "Trading accounts",
    category: "Trading",
  },

  // Social & Strategy
  {
    name: "Social",
    href: "/social",
    icon: Share2,
    gradient: "from-pink-500 to-fuchsia-600",
    description: "Social trading",
    category: "Social",
  },
  {
    name: "Strategies",
    href: "/strategies",
    icon: Layers,
    gradient: "from-teal-500 to-cyan-600",
    description: "DeFi strategies",
    category: "Social",
  },

  // Enterprise
  {
    name: "Cross-Chain",
    href: "/cross-chain",
    icon: Globe,
    gradient: "from-blue-500 to-purple-600",
    description: "Multi-chain ops",
    category: "Enterprise",
  },
  {
    name: "Institutional",
    href: "/institutional",
    icon: Building2,
    gradient: "from-slate-500 to-zinc-600",
    description: "Enterprise tools",
    category: "Enterprise",
  },

  // Utilities
  {
    name: "Help",
    href: "/help",
    icon: HelpCircle,
    gradient: "from-amber-500 to-yellow-600",
    description: "Documentation",
    category: "Utilities",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    gradient: "from-gray-500 to-slate-600",
    description: "App settings",
    category: "Utilities",
  },
]

const categories = ["Core", "DeFi", "Trading", "Social", "Enterprise", "Utilities"]

export default function NavPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = useMemo(() => {
    return navItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => filteredItems.some((item) => item.category === cat))
  }, [filteredItems])

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black p-3 sm:p-6">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-20 md:pb-8 max-w-7xl">
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white via-orange-200 to-red-400 bg-clip-text text-transparent">
              Platform Navigation
            </h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
              Access all features and tools in one place. Search to find what you need.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search features, tools, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder-gray-500 text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Results count */}
          {searchQuery && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-sm text-gray-400">
              Found {filteredItems.length} feature{filteredItems.length !== 1 ? "s" : ""}
            </motion.div>
          )}

          {/* Categories Grid */}
          <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
            {filteredCategories.map((category, categoryIndex) => {
              const categoryItems = filteredItems.filter((item) => item.category === category)

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-5 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white">{category}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                    <span className="text-xs sm:text-sm text-gray-400 font-medium">{categoryItems.length} items</span>
                  </div>

                  {/* App Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                    {categoryItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                      >
                        <Link href={item.href}>
                          <motion.div
                            whileHover={{ scale: 1.08, y: -6 }}
                            whileTap={{ scale: 0.92 }}
                            className="group cursor-pointer h-full"
                          >
                            {/* Card Container */}
                            <div className="h-full flex flex-col items-center">
                              {/* App Icon */}
                              <div
                                className={`
                                relative aspect-square w-full rounded-2xl md:rounded-3xl
                                bg-gradient-to-br ${item.gradient}
                                shadow-lg shadow-black/40
                                flex items-center justify-center
                                mb-3 sm:mb-4
                                overflow-hidden
                                transition-all duration-300
                                group-hover:shadow-2xl group-hover:shadow-primary/20
                                border border-white/10 group-hover:border-white/20
                              `}
                              >
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Icon */}
                                <item.icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white relative z-10" />

                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent group-hover:from-white/10" />
                              </div>

                              {/* App Info */}
                              <div className="text-center w-full px-1">
                                <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1 group-hover:text-primary transition-colors">
                                  {item.name}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1 mt-0.5 group-hover:text-gray-300 transition-colors">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && searchQuery && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <p className="text-gray-400 text-sm sm:text-base mb-2">No features found matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Clear search
              </button>
            </motion.div>
          )}

          {/* Quick Stats Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-14 sm:mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm text-gray-300">{navItems.length} features available</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
