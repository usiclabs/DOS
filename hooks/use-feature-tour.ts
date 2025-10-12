"use client"

import { useState, useEffect } from "react"

interface TourStep {
  id: string
  title: string
  description: string
  element?: string
  position?: "top" | "bottom" | "left" | "right"
}

export function useFeatureTour(tourId: string, steps: TourStep[]) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour-${tourId}-completed`)
    if (!hasSeenTour) {
      // Auto-start tour after a delay
      setTimeout(() => {
        setIsActive(true)
      }, 2000)
    }
  }, [tourId])

  const startTour = () => {
    setCurrentStep(0)
    setIsActive(true)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    localStorage.setItem(`tour-${tourId}-completed`, "true")
    setIsActive(false)
    setCurrentStep(0)
  }

  const skipTour = () => {
    localStorage.setItem(`tour-${tourId}-completed`, "true")
    setIsActive(false)
    setCurrentStep(0)
  }

  return {
    isActive,
    currentStep,
    currentStepData: steps[currentStep],
    totalSteps: steps.length,
    startTour,
    nextStep,
    previousStep,
    completeTour,
    skipTour,
  }
}
