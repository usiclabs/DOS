"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { StickyHeader } from "@/components/sticky-header"

const AutoTradeContent = dynamic(
  () => import("@/components/auto-trade-content").then((mod) => ({ default: mod.AutoTradeContent })),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="p-8 glass-card rounded-2xl">
          <div className="skeleton h-20 w-20 rounded-full mx-auto mb-6" />
          <div className="skeleton h-8 w-64 mx-auto mb-4" />
          <div className="skeleton h-6 w-96 mx-auto" />
        </div>
      </div>
    ),
  },
)

export default function AutoTradePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 pb-24 md:pb-12">
        {mounted ? (
          <AutoTradeContent />
        ) : (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="p-8 glass-card rounded-2xl">
              <div className="skeleton h-20 w-20 rounded-full mx-auto mb-6" />
              <div className="skeleton h-8 w-64 mx-auto mb-4" />
              <div className="skeleton h-6 w-96 mx-auto" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
