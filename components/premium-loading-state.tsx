"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface PremiumLoadingStateProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function PremiumLoadingState({ message = "Loading...", size = "md" }: PremiumLoadingStateProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className="relative"
      >
        <Loader2 className={`${sizeClasses[size]} text-accent-foreground`} />
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{
            background: "radial-gradient(circle, rgba(235, 90, 60, 0.4) 0%, transparent 70%)",
          }}
        />
      </motion.div>
      <motion.p
        className="text-sm text-gray-400 font-medium"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {message}
      </motion.p>
    </div>
  )
}
