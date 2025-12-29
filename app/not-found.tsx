"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-primary/10 to-black flex items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-50"
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
            <circle cx="24" cy="20" r="2" fill="#22d3ee" opacity="0.9" />
            <circle cx="20" cy="26" r="1.5" fill="#a78bfa" opacity="0.8" />
            <circle cx="28" cy="26" r="1.5" fill="#a78bfa" opacity="0.8" />
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
          <p className="text-gray-400 text-lg">
            This page doesn't exist in the Clanker ecosystem. Let's get you back to discovering yield opportunities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild className="btn-premium bg-transparent">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="glass-card border-primary/30 text-primary-foreground hover:bg-primary/10 bg-transparent"
          >
            <Link href="/pools">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Pools
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
