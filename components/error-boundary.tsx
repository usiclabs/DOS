"use client"

import React from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; errorInfo?: React.ErrorInfo; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })

    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({
  error,
  errorInfo,
  reset,
}: {
  error?: Error
  errorInfo?: React.ErrorInfo
  reset: () => void
}) {
  const [showDetails, setShowDetails] = React.useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center min-h-[400px] p-4"
    >
      <Card className="glass-card max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
            <span>Something went wrong</span>
          </CardTitle>
          <CardDescription>
            {error?.message || "An unexpected error occurred while loading this component."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex-1" aria-label="Try again">
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="flex-1"
              aria-label="Go to home page"
            >
              <Home className="h-4 w-4 mr-2" aria-hidden="true" />
              Go Home
            </Button>
          </div>

          {(error?.stack || errorInfo?.componentStack) && (
            <div className="pt-4 border-t border-accent/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                aria-expanded={showDetails}
                aria-controls="error-details"
              >
                {showDetails ? "Hide" : "Show"} Error Details
              </Button>

              {showDetails && (
                <motion.div
                  id="error-details"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 bg-black/50 rounded-lg overflow-auto max-h-48"
                >
                  <pre className="text-xs text-gray-400 whitespace-pre-wrap break-words">
                    {error?.stack || errorInfo?.componentStack}
                  </pre>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
