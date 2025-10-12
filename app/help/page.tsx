"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp, Shield, Settings, Search, ExternalLink, Video, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    description: "Learn the basics of DEUS Operating System",
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
    id: "ai-features",
    title: "AI Features",
    icon: Shield,
    description: "Leverage AI for smarter DEUS trading",
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
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: Settings,
    description: "Resolve common DEUS platform issues",
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

      <div className="min-h-screen bg-background/40 backdrop-blur-xl p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">DEUS Help Center</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about using the DEUS Operating System for DeFi trading
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg bg-card border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]"
              />
            </div>
          </div>

          {searchQuery ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article, index) => (
                  <Link key={index} href={article.href}>
                    <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] cursor-pointer hover:bg-white/5 transition-all duration-200 h-full">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs border-white/20">
                              {article.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-white/20">
                              {article.readTime}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-white">{article.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{article.description}</p>
                          <div className="flex items-center justify-end">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {helpCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-white">
                        <category.icon className="h-6 w-6" />
                        <span>{category.title}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {category.articles.map((article, index) => (
                        <Link key={index} href={article.href}>
                          <div className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <h4 className="text-sm font-medium text-white">{article.title}</h4>
                                <p className="text-xs text-muted-foreground">{article.description}</p>
                              </div>
                              <Badge variant="outline" className="text-xs ml-2 border-white/20">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Video className="h-5 w-5" />
                      <span>Video Tutorials</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Watch step-by-step video guides for using DEUS platform features.
                    </p>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Browse Videos
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <MessageCircle className="h-5 w-5" />
                      <span>Live Support</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Get instant help from our DEUS support team, available 24/7.
                    </p>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Start Chat</Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <ExternalLink className="h-5 w-5" />
                      <span>Community</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Join our Discord community for discussions and peer support.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
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
