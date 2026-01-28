"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlowingEffect } from "@/components/ui/glowing-effect"
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
      className="empty-state-premium relative inline-block"
    >
      <div className="relative">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
          className="rounded-2xl"
        />
        <div className="relative rounded-2xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl border border-accent/20 p-8 space-y-6">
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 glow-card"
          >
            <Icon className="h-10 w-10 text-accent-foreground" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 max-w-md">{description}</p>
          </div>
          {actionLabel && onAction && (
            <Button onClick={onAction} className="btn-premium glow-button">
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
