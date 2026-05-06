"use client"

import { useState } from "react"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import {
  Zap,
  TrendingUp,
  Brain,
  Shield,
  Wallet,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Sparkles,
  BarChart3,
  Bot,
  Lock,
} from "lucide-react"

export default function X402Page() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const premiumFeatures: Array<{
    id: string
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    price: string
    priceUnit: string
    color: string
    features: string[]
    isTokenGated?: boolean
    link?: string
  }> = [
    {
      id: "ai-insights",
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Advanced AI analysis of pool opportunities with 99% confidence scores",
      price: "$0.10",
      priceUnit: "per insight",
      color: "from-purple-500 to-pink-500",
      features: [
        "Real-time opportunity detection",
        "Impermanent loss predictions",
        "Volume surge alerts",
        "Early entry recommendations",
      ],
      isTokenGated: false,
    },
    {
      id: "advanced-analytics",
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep dive analytics with historical data and predictive modeling",
      price: "$0.50",
      priceUnit: "per report",
      color: "from-blue-500 to-cyan-500",
      features: [
        "Historical performance analysis",
        "Predictive yield modeling",
        "Risk assessment reports",
        "Portfolio optimization suggestions",
      ],
      isTokenGated: false,
    },
    {
      id: "auto-trading",
      icon: Bot,
      title: "Auto-Trading Strategies",
      description: "Automated trading strategies with customizable parameters",
      price: "$5.00",
      priceUnit: "per month",
      color: "from-green-500 to-emerald-500",
      features: ["Automated rebalancing", "Stop-loss protection", "Take-profit automation", "Multi-pool strategies"],
      isTokenGated: false,
    },
    {
      id: "premium-data",
      icon: TrendingUp,
      title: "Premium Pool Data",
      description: "Access to exclusive pool data and whale wallet tracking",
      price: "$1.00",
      priceUnit: "per day",
      color: "from-orange-500 to-red-500",
      features: [
        "Whale wallet tracking",
        "Exclusive pool discovery",
        "Real-time TVL alerts",
        "Smart money flow analysis",
      ],
      isTokenGated: false,
    },
  ]

  const benefits = [
    {
      icon: Zap,
      title: "Instant Payments",
      description: "2-second settlement with no waiting",
    },
    {
      icon: Shield,
      title: "No KYC Required",
      description: "Pay directly with your wallet",
    },
    {
      icon: DollarSign,
      title: "Micropayments",
      description: "Pay as low as $0.001 per transaction",
    },
    {
      icon: Lock,
      title: "Secure & Trustless",
      description: "On-chain verification for every payment",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <StickyHeader />
      <DeusTicker />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by x402 Protocol
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Premium Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pay instantly with USDC or USDT. No subscriptions, no commitments. Only pay for what you use.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit) => (
            <Card
              key={benefit.title}
              className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all"
            >
              <benefit.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>

        {/* Premium Features */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Premium Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {premiumFeatures.map((feature) => (
              <Card
                key={feature.id}
                className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all group"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                />

                <div className="relative p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">{feature.price}</span>
                    <span className="text-sm text-muted-foreground">{feature.priceUnit}</span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {feature.features.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {feature.isTokenGated ? (
                    <Button asChild className="w-full bg-gradient-to-r from-primary to-purple-500 hover:opacity-90">
                      <a href={feature.link}>
                        <Lock className="w-4 h-4 mr-2" />
                        Access with $DEUS
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-purple-500 hover:opacity-90"
                      onClick={() => setSelectedPlan(feature.id)}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Pay with x402
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <h2 className="text-2xl font-bold mb-6 text-center">How x402 Payments Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold">Select Feature</h3>
              <p className="text-sm text-muted-foreground">Choose the premium feature you want to access</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold">Instant Payment</h3>
              <p className="text-sm text-muted-foreground">Pay with USDC/USDT directly from your wallet</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold">Immediate Access</h3>
              <p className="text-sm text-muted-foreground">Get instant access to your premium feature</p>
            </div>
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What is x402?</h3>
              <p className="text-sm text-muted-foreground">
                x402 is an open payment protocol that enables instant stablecoin payments over HTTP. It's built by
                Coinbase and allows for micropayments with 2-second settlement times.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What tokens can I use to pay?</h3>
              <p className="text-sm text-muted-foreground">
                You can pay with USDC or USDT on Base, Ethereum, or other supported chains. The protocol is chain and
                token agnostic.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Are there any fees?</h3>
              <p className="text-sm text-muted-foreground">
                No platform fees! You only pay the listed price plus minimal gas fees for the on-chain transaction.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is it secure?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! All payments are verified on-chain, and you maintain full custody of your funds. No KYC or account
                creation required.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
