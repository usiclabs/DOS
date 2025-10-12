import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-accent/10 to-black flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-accent/20 animate-pulse"></div>
          <Loader2 className="h-8 w-8 text-accent animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Loading D.O.S.</h2>
          <p className="text-gray-400">Initializing DEUS Operating System...</p>
        </div>
      </div>
    </div>
  )
}
