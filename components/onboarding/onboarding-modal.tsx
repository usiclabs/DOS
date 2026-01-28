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
      <div className="space-y-2 md:space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 md:mb-4 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Welcome to the Future of DeFi</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-snug">
            D.O.S. combines advanced analytics, AI-powered recommendations, and seamless deployment tools to maximize
            your liquidity provision returns on Base chain.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-6">
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
            </div>
            <p className="text-xs font-medium leading-tight">Pool Discovery</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
            </div>
            <p className="text-xs font-medium leading-tight">One-Click Deploy</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
            </div>
            <p className="text-xs font-medium leading-tight">AI Insights</p>
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
      <div className="space-y-3 md:space-y-6">
        <div className="text-center py-1">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 md:mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
            <Wallet className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-1">Connect Your Wallet</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-snug">
            We support all major wallets including MetaMask, Coinbase Wallet, and WalletConnect.
          </p>
        </div>
        <Card className="glass-card flex-shrink-0">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-orange-500 rounded" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm md:font-medium leading-tight">MetaMask</p>
                  <p className="text-xs text-muted-foreground leading-tight">Most popular</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs flex-shrink-0">Recommended</Badge>
            </div>
          </CardContent>
        </Card>
        <div className="text-center py-1">
          <p className="text-xs text-muted-foreground leading-snug">
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
      <div className="space-y-3 md:space-y-6">
        <div className="text-center py-1">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 md:mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-1">Pool Discovery</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-snug">
            Advanced filtering and analytics help you find the best liquidity pools based on your risk tolerance.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <Card className="glass-card flex-shrink-0">
            <CardHeader className="pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm">DEUS/WETH</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">APR</span>
                  <span className="text-green-400 font-medium">489%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">TVL</span>
                  <span>$44.8K</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Vol</span>
                  <span>$3.5K</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card flex-shrink-0">
            <CardHeader className="pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm">DEUS/VARK</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">APR</span>
                  <span className="text-green-400 font-medium">2.98%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">TVL</span>
                  <span>$4.7K</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Vol</span>
                  <span>$130</span>
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
      <div className="space-y-3 md:space-y-6">
        <div className="text-center py-1">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 md:mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-1">AI-Powered Insights</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-snug">
            Get personalized recommendations based on market conditions, your risk tolerance, and portfolio goals.
          </p>
        </div>
        <Card className="glass-card flex-shrink-0">
          <CardHeader className="pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm flex items-center gap-1.5 md:gap-2">
              <Shield className="h-3 w-3 md:h-4 md:w-4" />
              <span>AI Recommendation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="space-y-2">
              <p className="text-xs leading-snug">
                Based on current market conditions, consider allocating 60% to stable pairs and 40% to high-yield
                opportunities.
              </p>
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
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
      <div className="space-y-3 md:space-y-6">
        <div className="text-center py-1">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 md:mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-1">Ready to Start!</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-snug">
            You now have access to all D.O.S. features. Start by exploring pools or checking out the analytics
            dashboard.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 md:gap-3">
          <Card className="glass-card cursor-pointer hover:bg-accent/5 transition-colors flex-shrink-0">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-accent-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">Explore Pools</p>
                    <p className="text-xs text-muted-foreground leading-tight">Find opportunities</p>
                  </div>
                </div>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card cursor-pointer hover:bg-accent/5 transition-colors flex-shrink-0">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-accent-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">View Analytics</p>
                    <p className="text-xs text-muted-foreground leading-tight">Check insights</p>
                  </div>
                </div>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
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
      <DialogContent className="max-w-xl md:max-w-2xl glass-card border-accent/20 max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="space-y-2 mb-2 md:mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <DialogTitle className="text-xl md:text-2xl font-bold leading-tight">{step.title}</DialogTitle>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{step.subtitle}</p>
            </div>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {currentStep + 1} of {onboardingSteps.length}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-3 md:space-y-6">
          <Progress value={progress} className="h-1.5 md:h-2" />

          <div className="min-h-[300px] md:min-h-[400px] overflow-y-auto pr-2">{step.content}</div>

          <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-border gap-2">
            <div className="flex items-center gap-1.5">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious} size="sm" className="text-xs md:text-sm px-2 md:px-3">
                  <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleSkip}
                size="sm"
                className="text-xs md:text-sm text-muted-foreground px-2 md:px-3"
              >
                <span className="hidden sm:inline">Skip Tour</span>
                <span className="sm:hidden">Skip</span>
              </Button>
            </div>

            <Button
              onClick={handleNext}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs md:text-sm px-3 md:px-4"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  <Check className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
