"use client"
import { Card } from "@/components/ui/card"

export default function MigrationLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900/50 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg animate-pulse" />
        <div className="h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
