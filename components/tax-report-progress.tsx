"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Loader2, Database, DollarSign, Calculator, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaxReportProgressProps {
  isAnalyzing: boolean
  taxYear: string
}

interface Step {
  id: number
  title: string
  description: string
  icon: React.ElementType
  duration: number
}

const steps: Step[] = [
  {
    id: 1,
    title: "Fetching Transactions",
    description: "Retrieving blockchain data from Base chain",
    icon: Database,
    duration: 2000,
  },
  {
    id: 2,
    title: "Fetching Historical Prices",
    description: "Getting USD values for all transactions",
    icon: DollarSign,
    duration: 3000,
  },
  {
    id: 3,
    title: "Calculating Tax Liability",
    description: "Computing gains, losses, and cost basis",
    icon: Calculator,
    duration: 2000,
  },
  {
    id: 4,
    title: "Generating Report",
    description: "Preparing your comprehensive tax document",
    icon: FileText,
    duration: 1500,
  },
]

export function TaxReportProgress({ isAnalyzing, taxYear }: TaxReportProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    // Simulate progress through steps
    let stepIndex = 0
    let progressValue = 0

    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        const stepProgress = 100 / steps.length
        progressValue += stepProgress / 20 // Smooth progress within each step

        if (progressValue >= (stepIndex + 1) * stepProgress) {
          stepIndex++
          setCurrentStep(stepIndex)
        }

        setProgress(Math.min(progressValue, 100))
      }
    }, 100)

    return () => clearInterval(progressInterval)
  }, [isAnalyzing])

  if (!isAnalyzing) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="glass-card w-full max-w-2xl mx-4 border-accent/20">
        <CardContent className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">Generating Tax Report</h3>
            <p className="text-gray-400">Analyzing your {taxYear} transactions...</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-400 text-center">{Math.round(progress)}% Complete</p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon
              const isComplete = currentStep > step.id
              const isCurrent = currentStep === step.id
              const isPending = currentStep < step.id

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg transition-all duration-300",
                    isCurrent && "bg-accent/10 border border-accent/20",
                    isComplete && "opacity-60",
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isComplete && "bg-green-500/20 text-green-400",
                      isCurrent && "bg-accent/20 text-accent-foreground",
                      isPending && "bg-gray-800 text-gray-500",
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        "font-semibold transition-colors duration-300",
                        isComplete && "text-green-400",
                        isCurrent && "text-accent-foreground",
                        isPending && "text-gray-500",
                      )}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={cn(
                        "text-sm transition-colors duration-300",
                        isComplete && "text-green-400/60",
                        isCurrent && "text-gray-300",
                        isPending && "text-gray-600",
                      )}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {isComplete && (
                      <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded">
                        Complete
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-xs font-medium text-accent-foreground bg-accent/10 px-2 py-1 rounded animate-pulse">
                        Processing
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer Message */}
          <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-800">
            <p>This may take a few moments depending on your transaction history</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
