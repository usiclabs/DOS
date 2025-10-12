"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Sparkles } from "lucide-react"

interface WelcomeBannerProps {
  onStartOnboarding: () => void
}

export function WelcomeBanner({ onStartOnboarding }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("dos-onboarding-completed")
    if (!hasCompletedOnboarding) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("dos-onboarding-dismissed", "true")
  }

  const handleStartOnboarding = () => {
    setIsVisible(false)
    onStartOnboarding()
  }

  if (!isVisible) return null

  return (
    <Card className="glass-card border-accent/20 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Welcome to D.O.S.!</h3>
              <p className="text-sm text-muted-foreground">
                New to the platform? Take a quick tour to learn about our features.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleStartOnboarding}
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Take Tour
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
