"use client"

import { useState, useEffect } from "react"

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem("dos-onboarding-completed")
    const dismissed = localStorage.getItem("dos-onboarding-dismissed")

    if (!completed && !dismissed) {
      setHasCompletedOnboarding(false)
      // Auto-open onboarding for first-time users after a short delay
      setTimeout(() => {
        setIsOnboardingOpen(true)
      }, 1000)
    }
  }, [])

  const startOnboarding = () => {
    setIsOnboardingOpen(true)
  }

  const completeOnboarding = () => {
    localStorage.setItem("dos-onboarding-completed", "true")
    localStorage.removeItem("dos-onboarding-dismissed")
    setHasCompletedOnboarding(true)
    setIsOnboardingOpen(false)
  }

  const closeOnboarding = () => {
    setIsOnboardingOpen(false)
  }

  return {
    hasCompletedOnboarding,
    isOnboardingOpen,
    startOnboarding,
    completeOnboarding,
    closeOnboarding,
  }
}
