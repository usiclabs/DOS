"use client"

import { cn } from "@/lib/utils"

interface PremiumSkeletonProps {
  className?: string
  variant?: "text" | "card" | "circle" | "button"
}

export function PremiumSkeleton({ className, variant = "text" }: PremiumSkeletonProps) {
  const variantClasses = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-xl",
    circle: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-lg",
  }

  return (
    <div className={cn("skeleton-premium", variantClasses[variant], className)} role="status" aria-label="Loading" />
  )
}

export function PremiumSkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <PremiumSkeleton variant="circle" />
        <div className="flex-1 space-y-2">
          <PremiumSkeleton className="h-4 w-3/4" />
          <PremiumSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <PremiumSkeleton className="h-3 w-full" />
        <PremiumSkeleton className="h-3 w-5/6" />
        <PremiumSkeleton className="h-3 w-4/6" />
      </div>
      <div className="flex space-x-2">
        <PremiumSkeleton variant="button" />
        <PremiumSkeleton variant="button" />
      </div>
    </div>
  )
}
