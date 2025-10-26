"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  HelpCircle,
  Search,
  BookOpen,
  Video,
  MessageCircle,
  ExternalLink,
  TrendingUp,
  Shield,
  Settings,
  Zap,
  Coins,
  Globe,
  Building2,
  CreditCard,
} from "lucide-react"

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    articles: [
      {
        id: "welcome",
        title: "Welcome to D.O.S.",
        description: "Learn the basics of our DEUS Operating System platform",
        readTime: "3 min",
        slug: "welcome-to-dos",
      },
      {
        id: "wallet",
        title: "Connecting Your Wallet",
        description: "Step-by-step wallet connection guide for MetaMask and other wallets",
        readTime: "2 min",
        slug: "connecting-wallet",
      },
      {
        id: "pools",
        title: "Understanding Pool Discovery",
        description: "How to find profitable DEUS liquidity pools",
        readTime: "5 min",
        slug: "pool-discovery",
      },
      {
        id: "deploy",
        title: "Your First Liquidity Deployment",
        description: "Deploy your first LP position with DEUS tokens",
        readTime: "7 min",
        slug: "first-deployment",
      },
    ],
  },
  {
    id: "pools",
    title: "Pool Management",
    icon: TrendingUp,
    articles: [
      {
        id: "analytics",
        title: "Pool Analytics Explained",
        description: "Understanding APR, TVL, and volume metrics for DEUS pools",
        readTime: "4 min",
        slug: "pool-analytics",
      },
      {
        id: "risk",
        title: "Risk Assessment",
        description: "How to evaluate DEUS pool risks and market conditions",
        readTime: "6 min",
        slug: "risk-assessment",
      },
      {
        id: "il",
        title: "Impermanent Loss Guide",
        description: "Understanding and managing IL in DEUS liquidity pools",
        readTime: "8 min",
        slug: "impermanent-loss",
      },
      {
        id: "filters",
        title: "Advanced Filtering",
        description: "Using filters to find optimal DEUS trading opportunities",
        readTime: "3 min",
        slug: "advanced-filtering",
      },
      {
        id: "fee-tiers",
        title: "Uniswap Fee Tier Selection",
        description: "Choosing the right fee tier for your liquidity positions",
        readTime: "5 min",
        slug: "fee-tier-selection",
      },
    ],
  },
  {
    id: "trading",
    title: "Trading & Swaps",
    icon: Zap,
    articles: [
      {
        id: "swap-basics",
        title: "Token Swapping Basics",
        description: "How to swap tokens efficiently on D.O.S.",
        readTime: "4 min",
        slug: "swap-basics",
      },
      {
        id: "discover-mode",
        title: "Discover Mode",
        description: "Find and trade trending tokens with AI insights",
        readTime: "5 min",
        slug: "discover-mode",
      },
      {
        id: "auto-trade",
        title: "Auto-Trade Bots",
        description: "Set up automated trading strategies with DEUS",
        readTime: "8 min",
        slug: "auto-trade-bots",
      },
      {
        id: "slippage",
        title: "Slippage & Price Impact",
        description: "Understanding and managing slippage in trades",
        readTime: "6 min",
        slug: "slippage-management",
      },
    ],
  },
  {
    id: "creators",
    title: "Token Creation",
    icon: Coins,
    articles: [
      {
        id: "token-factory",
        title: "Token Factory Overview",
        description: "Create your own tokens on Base with DEUS",
        readTime: "6 min",
        slug: "token-factory",
      },
      {
        id: "clanker",
        title: "Clanker Integration",
        description: "Deploy tokens using Clanker protocol",
        readTime: "5 min",
        slug: "clanker-integration",
      },
      {
        id: "zora",
        title: "Zora Token Creation",
        description: "Launch tokens with Zora's creator tools",
        readTime: "5 min",
        slug: "zora-creation",
      },
      {
        id: "liquidity-bootstrap",
        title: "Liquidity Bootstrapping",
        description: "Add initial liquidity to your new token",
        readTime: "7 min",
        slug: "liquidity-bootstrap",
      },
    ],
  },
  {
    id: "ai-features",
    title: "AI Features",
    icon: Shield,
    articles: [
      {
        id: "ai-overview",
        title: "AI Agent Overview",
        description: "How our DEUS AI assistant analyzes markets and provides insights",
        readTime: "4 min",
        slug: "ai-overview",
      },
      {
        id: "recommendations",
        title: "Personalized Recommendations",
        description: "Getting tailored DEUS investment advice from AI",
        readTime: "5 min",
        slug: "ai-recommendations",
      },
      {
        id: "risk-profile",
        title: "Risk Tolerance Settings",
        description: "Configuring your DEUS trading risk profile",
        readTime: "3 min",
        slug: "risk-tolerance",
      },
      {
        id: "market-analysis",
        title: "Market Analysis",
        description: "Understanding AI market insights for DEUS ecosystem",
        readTime: "6 min",
        slug: "market-analysis",
      },
      {
        id: "ai-insights",
        title: "AI Pool Insights",
        description: "Leverage AI to identify high-yield opportunities",
        readTime: "5 min",
        slug: "ai-insights",
      },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Features",
    icon: Globe,
    articles: [
      {
        id: "cross-chain",
        title: "Cross-Chain Operations",
        description: "Trade and manage liquidity across multiple chains",
        readTime: "7 min",
        slug: "cross-chain",
      },
      {
        id: "strategies",
        title: "Automated Strategies",
        description: "Deploy automated liquidity management strategies",
        readTime: "8 min",
        slug: "automated-strategies",
      },
      {
        id: "social-trading",
        title: "Social & Copy Trading",
        description: "Follow top traders and copy their strategies",
        readTime: "6 min",
        slug: "social-trading",
      },
      {
        id: "governance",
        title: "Governance & Voting",
        description: "Participate in DEUS protocol governance",
        readTime: "5 min",
        slug: "governance",
      },
    ],
  },
  {
    id: "institutional",
    title: "Institutional",
    icon: Building2,
    articles: [
      {
        id: "institutional-overview",
        title: "Institutional Features",
        description: "Enterprise-grade tools for institutional traders",
        readTime: "6 min",
        slug: "institutional-overview",
      },
      {
        id: "treasury",
        title: "Treasury Management",
        description: "Manage large-scale DEUS treasury operations",
        readTime: "7 min",
        slug: "treasury-management",
      },
      {
        id: "api-access",
        title: "API Access",
        description: "Programmatic access to D.O.S. features",
        readTime: "8 min",
        slug: "api-access",
      },
      {
        id: "compliance",
        title: "Compliance & Reporting",
        description: "Generate reports for regulatory compliance",
        readTime: "6 min",
        slug: "compliance",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & x402",
    icon: CreditCard,
    articles: [
      {
        id: "x402-overview",
        title: "x402 Protocol Overview",
        description: "Instant stablecoin payments over HTTP",
        readTime: "5 min",
        slug: "x402-overview",
      },
      {
        id: "premium-features",
        title: "Premium Features",
        description: "Access advanced features with x402 payments",
        readTime: "4 min",
        slug: "premium-features",
      },
      {
        id: "payment-setup",
        title: "Payment Setup",
        description: "Configure your wallet for x402 payments",
        readTime: "3 min",
        slug: "payment-setup",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: Settings,
    articles: [
      {
        id: "tx-failed",
        title: "Transaction Failed",
        description: "Common DEUS transaction issues and fixes",
        readTime: "4 min",
        slug: "transaction-failed",
      },
      {
        id: "wallet-issues",
        title: "Wallet Connection Issues",
        description: "Resolving wallet connectivity problems with DEUS platform",
        readTime: "3 min",
        slug: "wallet-issues",
      },
      {
        id: "gas-fees",
        title: "Gas Fee Optimization",
        description: "Tips for reducing transaction costs on Base network",
        readTime: "5 min",
        slug: "gas-optimization",
      },
      {
        id: "network",
        title: "Network Switching",
        description: "How to switch to Base network for DEUS trading",
        readTime: "2 min",
        slug: "network-switching",
      },
      {
        id: "price-range",
        title: "Price Range Calculation Errors",
        description: "Fixing liquidity deployment price range issues",
        readTime: "4 min",
        slug: "price-range-errors",
      },
    ],
  },
]

const videoTutorials = [
  {
    id: "overview",
    title: "DEUS Platform Overview",
    duration: "5:32",
    thumbnail: "/deus-platform-overview.jpg",
    slug: "platform-overview",
  },
  {
    id: "discovery",
    title: "Pool Discovery Walkthrough",
    duration: "8:15",
    thumbnail: "/pool-discovery-tutorial.jpg",
    slug: "pool-discovery-video",
  },
  {
    id: "liquidity",
    title: "Deploying DEUS Liquidity",
    duration: "6:45",
    thumbnail: "/liquidity-deployment.jpg",
    slug: "liquidity-deployment",
  },
  {
    id: "ai",
    title: "Using AI Recommendations",
    duration: "4:20",
    thumbnail: "/ai-recommendations.jpg",
    slug: "ai-recommendations-video",
  },
  {
    id: "auto-trade",
    title: "Auto-Trade Bot Setup",
    duration: "7:10",
    thumbnail: "/auto-trade-bot.jpg",
    slug: "auto-trade-setup",
  },
  {
    id: "token-creation",
    title: "Creating Your First Token",
    duration: "9:30",
    thumbnail: "/token-creation.jpg",
    slug: "token-creation-video",
  },
]

interface HelpCenterProps {
  onArticleClick?: (categoryId: string, articleId: string) => void
  onVideoClick?: (videoId: string) => void
}

export function HelpCenter({ onArticleClick, onVideoClick }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("getting-started")

  const filteredArticles =
    helpCategories
      .find((cat) => cat.id === selectedCategory)
      ?.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || []

  const handleArticleClick = (article: any) => {
    if (onArticleClick) {
      onArticleClick(selectedCategory, article.id)
    } else {
      window.open(`/help/${selectedCategory}/${article.slug}`, "_blank")
    }
  }

  const handleVideoClick = (video: any) => {
    if (onVideoClick) {
      onVideoClick(video.id)
    } else {
      window.open(`/help/videos/${video.slug}`, "_blank")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4 mr-1" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-background/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(255,107,0,0.15)] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-white/5">
          <DialogTitle className="flex items-center space-x-3 text-white text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-accent" />
            </div>
            <span>DEUS Help Center</span>
            <Badge className="ml-auto bg-accent/10 text-accent border-accent/20">Premium Support</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 border border-white/5 shadow-lg backdrop-blur-sm">
              <TabsTrigger
                value="articles"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-accent/10 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Articles
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-accent/10 data-[state=active]:text-white"
              >
                <Video className="h-4 w-4 mr-2" />
                Video Tutorials
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-accent/10 data-[state=active]:text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="mt-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search DEUS help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-muted/50 border border-white/10 shadow-lg backdrop-blur-sm text-base focus:border-accent/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-1 space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2">Categories</h3>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-1 pr-2">
                      {helpCategories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "secondary" : "ghost"}
                          className={`w-full justify-start transition-all duration-200 ${
                            selectedCategory === category.id
                              ? "bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/20 text-white shadow-lg"
                              : "hover:bg-white/5 border border-transparent"
                          }`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <category.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span className="text-sm truncate">{category.title}</span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="lg:col-span-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {filteredArticles.map((article) => (
                        <Card
                          key={article.id}
                          className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg cursor-pointer hover:bg-white/5 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(255,107,0,0.1)] transition-all duration-300 group"
                          onClick={() => handleArticleClick(article)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <h4 className="font-semibold text-white text-base group-hover:text-accent transition-colors">
                                  {article.title}
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{article.description}</p>
                              </div>
                              <div className="flex items-center space-x-3 ml-4">
                                <Badge
                                  variant="outline"
                                  className="text-xs border-white/20 text-muted-foreground bg-muted/30"
                                >
                                  {article.readTime}
                                </Badge>
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="videos" className="mt-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">DEUS Video Tutorials</h3>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videoTutorials.map((video) => (
                      <Card
                        key={video.id}
                        className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg cursor-pointer hover:bg-white/5 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(255,107,0,0.1)] transition-all duration-300 group overflow-hidden"
                        onClick={() => handleVideoClick(video)}
                      >
                        <CardContent className="p-0">
                          <div className="space-y-3">
                            <div className="relative overflow-hidden">
                              <img
                                src={video.thumbnail || "/placeholder.svg"}
                                alt={video.title}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-accent/90 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                  <Video className="h-7 w-7 text-white ml-1" />
                                </div>
                              </div>
                              <Badge className="absolute bottom-3 right-3 bg-black/80 text-white text-xs backdrop-blur-sm">
                                {video.duration}
                              </Badge>
                            </div>
                            <div className="px-4 pb-4">
                              <h4 className="font-semibold text-white group-hover:text-accent transition-colors">
                                {video.title}
                              </h4>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg hover:border-accent/30 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-white">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <span>Live Chat</span>
                      <Badge className="ml-auto bg-green-500/10 text-green-400 border-green-500/20">Online</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Get instant help from our DEUS support team. Available 24/7 for platform assistance with average
                      response time under 2 minutes.
                    </p>
                    <Button className="w-full bg-gradient-to-r from-accent to-accent/80 text-white hover:from-accent/90 hover:to-accent/70 shadow-lg">
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg hover:border-accent/30 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-white">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                        <ExternalLink className="h-5 w-5 text-blue-400" />
                      </div>
                      <span>Community Discord</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Join our DEUS community for discussions, updates, and peer support. Connect with 50,000+ active
                      traders.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-accent/30"
                      onClick={() => window.open("https://discord.gg/deus", "_blank")}
                    >
                      Join Discord
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card/50 backdrop-blur-sm border border-white/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-6 pr-4">
                      <div className="space-y-2 p-4 rounded-lg bg-muted/20 border border-white/5">
                        <h4 className="font-semibold text-white">How do I start providing DEUS liquidity?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Connect your wallet, browse available DEUS pools, analyze the metrics, and use our one-click
                          deploy feature to add liquidity to profitable positions.
                        </p>
                      </div>
                      <div className="space-y-2 p-4 rounded-lg bg-muted/20 border border-white/5">
                        <h4 className="font-semibold text-white">What is impermanent loss in DEUS pools?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Impermanent loss occurs when the price ratio of DEUS to other tokens in a liquidity pool
                          changes compared to when you deposited them. Our AI helps minimize this risk.
                        </p>
                      </div>
                      <div className="space-y-2 p-4 rounded-lg bg-muted/20 border border-white/5">
                        <h4 className="font-semibold text-white">How does the DEUS AI agent work?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Our AI analyzes DEUS market conditions, your risk profile, and historical data to provide
                          personalized investment recommendations and optimal pool selections.
                        </p>
                      </div>
                      <div className="space-y-2 p-4 rounded-lg bg-muted/20 border border-white/5">
                        <h4 className="font-semibold text-white">Which networks support DEUS trading?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          DEUS is primarily available on Base network for optimal trading experience with lower fees and
                          faster transactions.
                        </p>
                      </div>
                      <div className="space-y-2 p-4 rounded-lg bg-muted/20 border border-white/5">
                        <h4 className="font-semibold text-white">What is the x402 protocol?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          x402 is an instant payment protocol that enables stablecoin payments over HTTP. Use it to
                          access premium features like advanced analytics and AI insights.
                        </p>
                      </div>
                      <div className="space-y-2 p-4 rounded-lg bg-muted/20 border border-white/5">
                        <h4 className="font-semibold text-white">How do I create my own token?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Use our Token Factory to create custom tokens on Base. You can also integrate with Clanker or
                          Zora for additional features and distribution options.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
