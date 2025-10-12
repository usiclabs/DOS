"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, X, Target } from "lucide-react"

interface FeatureTourProps {
  isOpen: boolean
  onClose: () => void
  features: Array<{
    id: string
    title: string
    description: string
    element?: string
    position?: "top" | "bottom" | "left" | "right"
  }>
}

export function FeatureTour({ isOpen, onClose, features }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentFeature = features[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card border-accent/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {currentStep + 1} of {features.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">{currentFeature.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{currentFeature.description}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button onClick={handleNext} size="sm">
              {currentStep === features.length - 1 ? (
                "Finish"
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
