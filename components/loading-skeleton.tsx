"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        className="space-y-4"
      >
        <div className="h-12 w-64 bg-white/10 rounded-lg" />
        <div className="h-6 w-96 bg-white/5 rounded-lg" />
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-white/10 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-white/10 rounded mb-2" />
              <div className="h-3 w-20 bg-white/5 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
