"use client"

import React from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class EnhancedErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Card className="glass-card p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex p-6 rounded-full bg-destructive/20 mb-6"
              >
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
              <p className="text-gray-400 mb-6">{this.state.error?.message || "An unexpected error occurred"}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()} className="btn-premium">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button onClick={() => (window.location.href = "/")} variant="outline" className="glass-card">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}
