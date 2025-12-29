"use client"

import type React from "react"

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
    gradient: "from-orange-500 to-red-500",
    description: "Platform overview",
    category: "Core",
  },
  {
    name: "Pools",
    href: "/pools",
    icon: Droplets,
    gradient: "from-blue-500 to-cyan-500",
    description: "Liquidity pools",
    category: "Core",
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: Wallet,
    gradient: "from-purple-500 to-pink-500",
    description: "Your holdings",
    category: "Core",
  },
  {
    name: "LP Manager",
    href: "/lp-manager",
    icon: TrendingUp,
    gradient: "from-green-500 to-emerald-500",
    description: "Manage positions",
    category: "Core",
  },
  {
    name: "Swap",
    href: "/swap",
    icon: ArrowLeftRight,
    gradient: "from-orange-500 to-amber-500",
    description: "Token swaps",
    category: "Core",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    gradient: "from-indigo-500 to-purple-500",
    description: "Platform metrics",
    category: "Core",
  },

  // DeFi Features
  {
    name: "Creators",
    href: "/creators",
    icon: Users,
    gradient: "from-pink-500 to-rose-500",
    description: "Token creators",
    category: "DeFi",
  },
  {
    name: "Token Factory",
    href: "/token-factory",
    icon: Sparkles,
    gradient: "from-yellow-500 to-orange-500",
    description: "Deploy tokens",
    category: "DeFi",
  },
  {
    name: "Treasury",
    href: "/treasury",
    icon: Vault,
    gradient: "from-emerald-500 to-teal-500",
    description: "Protocol treasury",
    category: "DeFi",
  },
  {
    name: "Governance",
    href: "/governance",
    icon: Vote,
    gradient: "from-blue-500 to-indigo-500",
    description: "Vote on proposals",
    category: "DeFi",
  },

  // Advanced Trading
  {
    name: "Auto-Trade",
    href: "/auto-trade",
    icon: Bot,
    gradient: "from-cyan-500 to-blue-500",
    description: "Automated trading",
    category: "Trading",
  },
  {
    name: "Trading",
    href: "/trading",
    icon: LineChart,
    gradient: "from-red-500 to-orange-500",
    description: "Advanced trading",
    category: "Trading",
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: UserCircle,
    gradient: "from-violet-500 to-purple-500",
    description: "Trading accounts",
    category: "Trading",
  },

  // Social & Strategy
  {
    name: "Social",
    href: "/social",
    icon: Share2,
    gradient: "from-pink-500 to-fuchsia-500",
    description: "Social trading",
    category: "Social",
  },
  {
    name: "Strategies",
    href: "/strategies",
    icon: Layers,
    gradient: "from-teal-500 to-cyan-500",
    description: "DeFi strategies",
    category: "Social",
  },

  // Enterprise
  {
    name: "Cross-Chain",
    href: "/cross-chain",
    icon: Globe,
    gradient: "from-blue-500 to-purple-500",
    description: "Multi-chain ops",
    category: "Enterprise",
  },
  {
    name: "Institutional",
    href: "/institutional",
    icon: Building2,
    gradient: "from-slate-500 to-zinc-500",
    description: "Enterprise tools",
    category: "Enterprise",
  },

  // Utilities
  {
    name: "Help",
    href: "/help",
    icon: HelpCircle,
    gradient: "from-amber-500 to-yellow-500",
    description: "Documentation",
    category: "Utilities",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    gradient: "from-gray-500 to-slate-500",
    description: "App settings",
    category: "Utilities",
  },
]

const categories = ["Core", "DeFi", "Trading", "Social", "Enterprise", "Utilities"]

export default function NavPage() {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black p-3 sm:p-6">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-20 md:pb-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white via-orange-200 to-red-400 bg-clip-text text-transparent">
              Platform Navigation
            </h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
              Access all features and tools in one place
            </p>
          </motion.div>

          {/* Categories */}
          <div className="max-w-7xl mx-auto space-y-12">
            {categories.map((category, categoryIndex) => {
              const categoryItems = navItems.filter((item) => item.category === category)

              if (categoryItems.length === 0) return null

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                >
                  {/* Category Header */}
                  <h2 className="text-xl font-semibold mb-4 text-white/80">{category}</h2>

                  {/* App Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
                    {categoryItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                      >
                        <Link href={item.href}>
                          <motion.div
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            className="group cursor-pointer"
                          >
                            {/* App Icon */}
                            <div
                              className={`
                              relative aspect-square rounded-2xl md:rounded-3xl
                              bg-gradient-to-br ${item.gradient}
                              shadow-lg shadow-black/20
                              flex items-center justify-center
                              mb-2
                              overflow-hidden
                              transition-all duration-300
                              group-hover:shadow-xl group-hover:shadow-black/30
                            `}
                            >
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              {/* Icon */}
                              <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />

                              {/* Glow effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                            </div>

                            {/* App Name */}
                            <div className="text-center">
                              <p className="text-xs md:text-sm font-medium text-white line-clamp-1">{item.name}</p>
                              <p className="text-[10px] md:text-xs text-gray-400 line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
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

          {/* Quick Stats Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-gray-400">{navItems.length} features available</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
