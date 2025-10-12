"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Zap,
  Shield,
  Wallet,
  BarChart3,
  Target,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
} from "lucide-react"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to D.O.S.",
    subtitle: "DEUS Operating System",
    description:
      "Your advanced Base-chain liquidity management platform with AI-powered insights and automated deployment tools.",
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Welcome to the Future of DeFi</h3>
          <p className="text-muted-foreground">
            D.O.S. combines advanced analytics, AI-powered recommendations, and seamless deployment tools to maximize
            your liquidity provision returns on Base chain.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-accent/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="text-sm font-medium">Pool Discovery</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-accent/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="text-sm font-medium">One-Click Deploy</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-accent/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="text-sm font-medium">AI Insights</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Connect Your Wallet",
    subtitle: "Secure & Simple",
    description: "Connect your wallet to start managing liquidity positions and accessing personalized analytics.",
    icon: Wallet,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-4">
            We support all major wallets including MetaMask, Coinbase Wallet, and WalletConnect.
          </p>
        </div>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <div className="w-4 h-4 bg-orange-500 rounded" />
                </div>
                <div>
                  <p className="font-medium">MetaMask</p>
                  <p className="text-sm text-muted-foreground">Most popular wallet</p>
                </div>
              </div>
              <Badge variant="secondary">Recommended</Badge>
            </div>
          </CardContent>
        </Card>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Your wallet connection is secure and encrypted. We never store your private keys.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Discover Pools",
    subtitle: "Find Profitable Opportunities",
    description: "Explore our pool discovery tools to find the most profitable liquidity opportunities on Base chain.",
    icon: TrendingUp,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Pool Discovery</h3>
          <p className="text-muted-foreground mb-4">
            Advanced filtering and analytics help you find the best liquidity pools based on your risk tolerance.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">DEUS/WETH</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">APR</span>
                  <span className="text-green-400 font-medium">489.71%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVL</span>
                  <span>$44.8K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volume</span>
                  <span>$3.5K</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">DEUS/VARK</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">APR</span>
                  <span className="text-green-400 font-medium">2.98%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVL</span>
                  <span>$4.7K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volume</span>
                  <span>$129.69</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "AI-Powered Analytics",
    subtitle: "Smart Insights",
    description:
      "Our AI agent provides personalized recommendations and risk analysis for optimal portfolio allocation.",
    icon: Shield,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
          <p className="text-muted-foreground mb-4">
            Get personalized recommendations based on market conditions, your risk tolerance, and portfolio goals.
          </p>
        </div>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>AI Recommendation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">
                Based on current market conditions, consider allocating 60% to stable pairs and 40% to high-yield
                opportunities.
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  Low Risk
                </Badge>
                <Badge variant="outline" className="text-xs">
                  High Reward
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    id: 5,
    title: "Start Trading",
    subtitle: "You're All Set!",
    description:
      "You're ready to start discovering pools, analyzing opportunities, and deploying liquidity with D.O.S.",
    icon: Target,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
            <Target className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Ready to Start!</h3>
          <p className="text-muted-foreground mb-4">
            You now have access to all D.O.S. features. Start by exploring pools or checking out the analytics
            dashboard.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Card className="glass-card cursor-pointer hover:bg-accent/5 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                  <div>
                    <p className="font-medium">Explore Pools</p>
                    <p className="text-sm text-muted-foreground">Find profitable opportunities</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card cursor-pointer hover:bg-accent/5 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-accent-foreground" />
                  <div>
                    <p className="font-medium">View Analytics</p>
                    <p className="text-sm text-muted-foreground">Check market insights</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
]

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCompletedSteps((prev) => [...prev, currentStep])
      setCurrentStep(currentStep + 1)
    } else {
      setCompletedSteps((prev) => [...prev, currentStep])
      onComplete()
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
    onClose()
  }

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100
  const step = onboardingSteps[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card border-accent/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{step.title}</DialogTitle>
              <p className="text-muted-foreground">{step.subtitle}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {currentStep + 1} of {onboardingSteps.length}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="h-2" />

          <div className="min-h-[400px]">{step.content}</div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious} size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}
              <Button variant="ghost" onClick={handleSkip} size="sm" className="text-muted-foreground">
                Skip Tour
              </Button>
            </div>

            <Button onClick={handleNext} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
