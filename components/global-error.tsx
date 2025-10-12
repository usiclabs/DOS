"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
              <p className="text-gray-400">
                An unexpected error occurred in the DEUS Operating System. Please try again.
              </p>
              {error.digest && <p className="text-xs text-gray-500 font-mono">Error ID: {error.digest}</p>}
            </div>

            <Button onClick={reset} className="bg-black hover:bg-gray-800">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
