"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="relative w-full max-w-md">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
          className="rounded-xl"
        />
        <Card className="glass-card max-w-md text-center relative">
          <CardContent className="pt-12 pb-12 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="p-6 rounded-full bg-accent/20 glow-card">
                <Icon className="h-12 w-12 text-accent-foreground" />
              </div>
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="text-gray-400">{description}</p>
            </div>
            {action && <div className="pt-4">{action}</div>}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
