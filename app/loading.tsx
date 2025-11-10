"use client"

import { motion } from "framer-motion"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-primary/10 to-black flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-2xl"
            >
              <path
                d="M8 38 L24 8 L40 38 Z"
                fill="url(#wizardGradient)"
                stroke="url(#wizardStroke)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <ellipse
                cx="24"
                cy="38"
                rx="18"
                ry="4"
                fill="url(#brimGradient)"
                stroke="url(#wizardStroke)"
                strokeWidth="1.5"
              />
              <motion.circle
                cx="24"
                cy="20"
                r="2"
                fill="#22d3ee"
                opacity="0.9"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.circle
                cx="20"
                cy="26"
                r="1.5"
                fill="#a78bfa"
                opacity="0.8"
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
              />
              <motion.circle
                cx="28"
                cy="26"
                r="1.5"
                fill="#a78bfa"
                opacity="0.8"
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
              />
              <circle cx="24" cy="30" r="1" fill="#22d3ee" opacity="0.7" />
              <path d="M16 16 L17 18 L16 20 L14 18 Z" fill="#22d3ee" opacity="0.6" />
              <path d="M32 16 L33 18 L32 20 L30 18 Z" fill="#a78bfa" opacity="0.6" />
              <defs>
                <linearGradient id="wizardGradient" x1="24" y1="8" x2="24" y2="38" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
                <linearGradient id="wizardStroke" x1="8" y1="8" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
                <linearGradient id="brimGradient" x1="6" y1="38" x2="42" y2="38" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6d28d9" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Animated ring around logo */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Loading Clanker
          </h2>
          <p className="text-gray-400 text-lg">Initializing yield optimizer...</p>

          {/* Loading dots animation */}
          <div className="flex justify-center space-x-2 pt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
