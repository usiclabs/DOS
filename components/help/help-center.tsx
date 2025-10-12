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
    ],
  },
]

const videoTutorials = [
  {
    id: "overview",
    title: "DEUS Platform Overview",
    duration: "5:32",
    thumbnail: "/deus-platform-overview-video.jpg",
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
    thumbnail: "/liquidity-deployment-guide.jpg",
    slug: "liquidity-deployment",
  },
  {
    id: "ai",
    title: "Using AI Recommendations",
    duration: "4:20",
    thumbnail: "/ai-recommendations-tutorial.jpg",
    slug: "ai-recommendations-video",
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
      // Default behavior - could navigate to help page
      window.open(`/help/${selectedCategory}/${article.slug}`, "_blank")
    }
  }

  const handleVideoClick = (video: any) => {
    if (onVideoClick) {
      onVideoClick(video.id)
    } else {
      // Default behavior - could open video modal or navigate
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
      <DialogContent className="max-w-5xl max-h-[85vh] bg-background/40 backdrop-blur-xl border border-white/10 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center space-x-2 text-white">
            <HelpCircle className="h-5 w-5" />
            <span>DEUS Help Center</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]">
              <TabsTrigger value="articles" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Articles
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Video Tutorials
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Contact Support
              </TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="mt-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search DEUS help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Categories</h3>
                  {helpCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "secondary" : "ghost"}
                      className="w-full justify-start bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] hover:bg-white/5"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <category.icon className="h-4 w-4 mr-2" />
                      {category.title}
                    </Button>
                  ))}
                </div>

                <div className="lg:col-span-3">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {filteredArticles.map((article) => (
                        <Card
                          key={article.id}
                          className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] cursor-pointer hover:bg-white/5 transition-all duration-200"
                          onClick={() => handleArticleClick(article)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <h4 className="font-medium text-white">{article.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{article.description}</p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Badge variant="outline" className="text-xs border-white/20 text-muted-foreground">
                                  {article.readTime}
                                </Badge>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
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
                <h3 className="text-lg font-medium text-white mb-4">DEUS Video Tutorials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videoTutorials.map((video) => (
                    <Card
                      key={video.id}
                      className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] cursor-pointer hover:bg-white/5 transition-all duration-200"
                      onClick={() => handleVideoClick(video)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="relative">
                            <img
                              src={video.thumbnail || "/placeholder.svg"}
                              alt={video.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Video className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                              {video.duration}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-white">{video.title}</h4>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <MessageCircle className="h-5 w-5" />
                      <span>Live Chat</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Get instant help from our DEUS support team. Available 24/7 for platform assistance.
                    </p>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Start Chat</Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <ExternalLink className="h-5 w-5" />
                      <span>Community Discord</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Join our DEUS community for discussions, updates, and peer support.
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

              <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
                <CardHeader>
                  <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-6 pr-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">How do I start providing DEUS liquidity?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Connect your wallet, browse available DEUS pools, analyze the metrics, and use our one-click
                          deploy feature to add liquidity to profitable positions.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">What is impermanent loss in DEUS pools?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Impermanent loss occurs when the price ratio of DEUS to other tokens in a liquidity pool
                          changes compared to when you deposited them. Our AI helps minimize this risk.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">How does the DEUS AI agent work?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Our AI analyzes DEUS market conditions, your risk profile, and historical data to provide
                          personalized investment recommendations and optimal pool selections.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Which networks support DEUS trading?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          DEUS is primarily available on Base network for optimal trading experience with lower fees and
                          faster transactions.
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
