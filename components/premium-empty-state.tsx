"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface PremiumEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function PremiumEmptyState({ icon: Icon, title, description, actionLabel, onAction }: PremiumEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="empty-state-premium"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6"
      >
        <Icon className="h-10 w-10 text-accent-foreground" />
      </motion.div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="btn-premium">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
