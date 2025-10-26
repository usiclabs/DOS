"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  TrendingUp,
  Shield,
  Settings,
  Search,
  ExternalLink,
  Video,
  MessageCircle,
  Zap,
  Coins,
  Globe,
  Building2,
  CreditCard,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    description: "Learn the basics of DEUS Operating System",
    gradient: "from-blue-500/20 to-blue-500/5",
    articles: [
      {
        title: "Welcome to D.O.S.",
        description: "Learn the basics of our DEUS Operating System platform",
        readTime: "3 min",
        href: "/help/getting-started/welcome-to-dos",
      },
      {
        title: "Connecting Your Wallet",
        description: "Step-by-step wallet connection guide",
        readTime: "2 min",
        href: "/help/getting-started/connecting-wallet",
      },
      {
        title: "Understanding Pool Discovery",
        description: "How to find profitable DEUS liquidity pools",
        readTime: "5 min",
        href: "/help/getting-started/pool-discovery",
      },
      {
        title: "Your First Liquidity Deployment",
        description: "Deploy your first LP position with DEUS",
        readTime: "7 min",
        href: "/help/getting-started/first-deployment",
      },
    ],
  },
  {
    id: "pools",
    title: "Pool Management",
    icon: TrendingUp,
    description: "Master DEUS liquidity pool strategies",
    gradient: "from-green-500/20 to-green-500/5",
    articles: [
      {
        title: "Pool Analytics Explained",
        description: "Understanding APR, TVL, and volume metrics",
        readTime: "4 min",
        href: "/help/pools/pool-analytics",
      },
      {
        title: "Risk Assessment",
        description: "How to evaluate DEUS pool risks",
        readTime: "6 min",
        href: "/help/pools/risk-assessment",
      },
      {
        title: "Impermanent Loss Guide",
        description: "Understanding and managing IL in DEUS pools",
        readTime: "8 min",
        href: "/help/pools/impermanent-loss",
      },
      {
        title: "Advanced Filtering",
        description: "Using filters to find optimal opportunities",
        readTime: "3 min",
        href: "/help/pools/advanced-filtering",
      },
    ],
  },
  {
    id: "trading",
    title: "Trading & Swaps",
    icon: Zap,
    description: "Master token swapping and automated trading",
    gradient: "from-yellow-500/20 to-yellow-500/5",
    articles: [
      {
        title: "Token Swapping Basics",
        description: "How to swap tokens efficiently on D.O.S.",
        readTime: "4 min",
        href: "/help/trading/swap-basics",
      },
      {
        title: "Discover Mode",
        description: "Find and trade trending tokens with AI insights",
        readTime: "5 min",
        href: "/help/trading/discover-mode",
      },
      {
        title: "Auto-Trade Bots",
        description: "Set up automated trading strategies",
        readTime: "8 min",
        href: "/help/trading/auto-trade-bots",
      },
      {
        title: "Slippage Management",
        description: "Understanding and managing slippage",
        readTime: "6 min",
        href: "/help/trading/slippage-management",
      },
    ],
  },
  {
    id: "creators",
    title: "Token Creation",
    icon: Coins,
    description: "Create and launch your own tokens",
    gradient: "from-purple-500/20 to-purple-500/5",
    articles: [
      {
        title: "Token Factory Overview",
        description: "Create your own tokens on Base",
        readTime: "6 min",
        href: "/help/creators/token-factory",
      },
      {
        title: "Clanker Integration",
        description: "Deploy tokens using Clanker protocol",
        readTime: "5 min",
        href: "/help/creators/clanker-integration",
      },
      {
        title: "Zora Token Creation",
        description: "Launch tokens with Zora's creator tools",
        readTime: "5 min",
        href: "/help/creators/zora-creation",
      },
      {
        title: "Liquidity Bootstrapping",
        description: "Add initial liquidity to your new token",
        readTime: "7 min",
        href: "/help/creators/liquidity-bootstrap",
      },
    ],
  },
  {
    id: "ai-features",
    title: "AI Features",
    icon: Shield,
    description: "Leverage AI for smarter DEUS trading",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    articles: [
      {
        title: "AI Agent Overview",
        description: "How our DEUS AI assistant works",
        readTime: "4 min",
        href: "/help/ai-features/ai-overview",
      },
      {
        title: "Personalized Recommendations",
        description: "Getting tailored DEUS investment advice",
        readTime: "5 min",
        href: "/help/ai-features/ai-recommendations",
      },
      {
        title: "Risk Tolerance Settings",
        description: "Configuring your DEUS trading profile",
        readTime: "3 min",
        href: "/help/ai-features/risk-tolerance",
      },
      {
        title: "Market Analysis",
        description: "Understanding AI insights for DEUS ecosystem",
        readTime: "6 min",
        href: "/help/ai-features/market-analysis",
      },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Features",
    icon: Globe,
    description: "Cross-chain, strategies, and social trading",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    articles: [
      {
        title: "Cross-Chain Operations",
        description: "Trade across multiple chains",
        readTime: "7 min",
        href: "/help/advanced/cross-chain",
      },
      {
        title: "Automated Strategies",
        description: "Deploy automated liquidity strategies",
        readTime: "8 min",
        href: "/help/advanced/automated-strategies",
      },
      {
        title: "Social & Copy Trading",
        description: "Follow top traders and copy strategies",
        readTime: "6 min",
        href: "/help/advanced/social-trading",
      },
      {
        title: "Governance & Voting",
        description: "Participate in DEUS protocol governance",
        readTime: "5 min",
        href: "/help/advanced/governance",
      },
    ],
  },
  {
    id: "institutional",
    title: "Institutional",
    icon: Building2,
    description: "Enterprise-grade tools for institutions",
    gradient: "from-orange-500/20 to-orange-500/5",
    articles: [
      {
        title: "Institutional Features",
        description: "Enterprise-grade tools for institutional traders",
        readTime: "6 min",
        href: "/help/institutional/institutional-overview",
      },
      {
        title: "Treasury Management",
        description: "Manage large-scale DEUS treasury operations",
        readTime: "7 min",
        href: "/help/institutional/treasury-management",
      },
      {
        title: "API Access",
        description: "Programmatic access to D.O.S. features",
        readTime: "8 min",
        href: "/help/institutional/api-access",
      },
      {
        title: "Compliance & Reporting",
        description: "Generate reports for regulatory compliance",
        readTime: "6 min",
        href: "/help/institutional/compliance",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & x402",
    icon: CreditCard,
    description: "Instant stablecoin payments",
    gradient: "from-pink-500/20 to-pink-500/5",
    articles: [
      {
        title: "x402 Protocol Overview",
        description: "Instant stablecoin payments over HTTP",
        readTime: "5 min",
        href: "/help/payments/x402-overview",
      },
      {
        title: "Premium Features",
        description: "Access advanced features with x402 payments",
        readTime: "4 min",
        href: "/help/payments/premium-features",
      },
      {
        title: "Payment Setup",
        description: "Configure your wallet for x402 payments",
        readTime: "3 min",
        href: "/help/payments/payment-setup",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: Settings,
    description: "Resolve common DEUS platform issues",
    gradient: "from-red-500/20 to-red-500/5",
    articles: [
      {
        title: "Transaction Failed",
        description: "Common DEUS transaction issues and fixes",
        readTime: "4 min",
        href: "/help/troubleshooting/transaction-failed",
      },
      {
        title: "Wallet Connection Issues",
        description: "Resolving wallet connectivity problems",
        readTime: "3 min",
        href: "/help/troubleshooting/wallet-issues",
      },
      {
        title: "Gas Fee Optimization",
        description: "Tips for reducing transaction costs",
        readTime: "5 min",
        href: "/help/troubleshooting/gas-optimization",
      },
      {
        title: "Network Switching",
        description: "How to switch to Base network",
        readTime: "2 min",
        href: "/help/troubleshooting/network-switching",
      },
    ],
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const allArticles = helpCategories.flatMap((category) =>
    category.articles.map((article) => ({
      ...article,
      category: category.title,
      categoryId: category.id,
      gradient: category.gradient,
    })),
  )

  const filteredArticles = allArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background backdrop-blur-xl p-4 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center space-y-6 pt-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm text-accent font-medium">Premium Support Available 24/7</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">DEUS Help Center</h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
              Everything you need to master the DEUS Operating System and maximize your DeFi potential
            </p>
          </div>

          <div className="max-w-3xl mx-auto px-4">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input
                placeholder="Search help articles, guides, and tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-16 text-lg bg-card/50 backdrop-blur-sm border border-white/10 shadow-[0_0_40px_rgba(255,107,0,0.05)] focus:border-accent/50 focus:shadow-[0_0_60px_rgba(255,107,0,0.15)] transition-all duration-300"
              />
            </div>
          </div>

          {searchQuery ? (
            <div className="space-y-6 px-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Search Results</h2>
                <Badge className="bg-accent/10 text-accent border-accent/20">
                  {filteredArticles.length} {filteredArticles.length === 1 ? "result" : "results"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article, index) => (
                  <Link key={index} href={article.href}>
                    <Card className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg cursor-pointer hover:bg-white/5 hover:border-accent/30 hover:shadow-[0_0_40px_rgba(255,107,0,0.1)] transition-all duration-300 h-full group">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs border-white/20 bg-gradient-to-r ${article.gradient}`}
                            >
                              {article.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-white/20 bg-muted/30">
                              {article.readTime}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-white text-lg group-hover:text-accent transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{article.description}</p>
                          <div className="flex items-center justify-end">
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {helpCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg hover:border-accent/30 hover:shadow-[0_0_40px_rgba(255,107,0,0.1)] transition-all duration-300 group"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-4 text-white">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        >
                          <category.icon className="h-6 w-6 flex-shrink-0" />
                        </div>
                        <span className="text-lg">{category.title}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {category.articles.map((article, index) => (
                        <Link key={index} href={article.href}>
                          <div className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 border border-transparent hover:border-accent/20 transition-all duration-200 cursor-pointer group/article">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white group-hover/article:text-accent transition-colors">
                                  {article.title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {article.description}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs border-white/20 bg-muted/30 flex-shrink-0">
                                {article.readTime}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 px-4">
                <Card className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg hover:border-green-500/30 hover:shadow-[0_0_40px_rgba(34,197,94,0.1)] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-white">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                        <Video className="h-6 w-6 text-green-400" />
                      </div>
                      <span>Video Tutorials</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Watch step-by-step video guides for using DEUS platform features. Learn from experts.
                    </p>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg">
                      Browse Videos
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg hover:border-accent/30 hover:shadow-[0_0_40px_rgba(255,107,0,0.1)] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-white">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <span>Live Support</span>
                        <Badge className="ml-2 bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                          Online
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Get instant help from our DEUS support team, available 24/7. Average response time: 2 minutes.
                    </p>
                    <Button className="w-full bg-gradient-to-r from-accent to-accent/80 text-white hover:from-accent/90 hover:to-accent/70 shadow-lg">
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-white">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                        <ExternalLink className="h-6 w-6 text-blue-400" />
                      </div>
                      <span>Community</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Join our Discord community for discussions and peer support. 50,000+ active traders.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-blue-500/30"
                      onClick={() => window.open("https://discord.gg/deus", "_blank")}
                    >
                      Join Discord
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
