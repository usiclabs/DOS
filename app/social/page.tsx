"use client"

import { Suspense } from "react"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { SocialTradingDashboard } from "@/components/social/social-trading-dashboard"
import { LeaderboardSection } from "@/components/social/leaderboard-section"
import { CopyTradingInterface } from "@/components/social/copy-trading-interface"

export default function SocialTradingPage() {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-black p-6 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold neon-text">Social Trading Hub</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow top performers, copy successful strategies, and build your reputation in the DeFi community
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-16">
                <div className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border rounded-full p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              </div>
            }
          >
            <SocialTradingDashboard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <LeaderboardSection />
              <CopyTradingInterface />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
