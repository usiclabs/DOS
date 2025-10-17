"use client"

import { motion } from "framer-motion"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface LiveDataIndicatorProps {
  isLive?: boolean
  label?: string
  className?: string
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  variant?: "default" | "minimal"
}

export function LiveDataIndicator({
  isLive = true,
  label = "Live",
  className,
  size = "md",
  showIcon = true,
  variant = "default",
}: LiveDataIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <motion.div
          className={cn(sizeClasses[size], "rounded-full", isLive ? "bg-green-400" : "bg-gray-400")}
          animate={
            isLive
              ? {
                  opacity: [1, 0.4, 1],
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        {label && (
          <span className={cn(textSizeClasses[size], isLive ? "text-green-400" : "text-gray-400", "font-medium")}>
            {label}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        {isLive && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400/30"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400/20"
              animate={{
                scale: [1, 2.5, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
          </>
        )}
        {/* Core dot */}
        <motion.div
          className={cn(
            sizeClasses[size],
            "rounded-full relative z-10",
            isLive ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-400",
          )}
          animate={
            isLive
              ? {
                  opacity: [1, 0.7, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>
      <span className={cn(textSizeClasses[size], isLive ? "text-green-300" : "text-gray-400", "font-medium")}>
        {label}
      </span>
      {showIcon && isLive && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Activity className={cn(sizeClasses[size], "text-green-400")} />
        </motion.div>
      )}
    </div>
  )
}
