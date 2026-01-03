"use client"

import { motion } from "framer-motion"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-8 w-full max-w-md px-4">
        {/* Logo animation */}
        <motion.div
          className="flex justify-center"
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#eb5a3c] to-[#daa520] flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-white border-r-white animate-spin" />
          </div>
        </motion.div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Loading Market Makers</h2>
          <p className="text-foreground/60 text-sm">Initializing autonomous trading agents...</p>
        </div>

        {/* Loading bars */}
        <div className="space-y-2">
          {[0.3, 0.6, 1].map((delay, i) => (
            <motion.div
              key={i}
              className="h-1 bg-gradient-to-r from-[#eb5a3c] to-[#daa520] rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, delay, repeat: Number.POSITIVE_INFINITY }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
