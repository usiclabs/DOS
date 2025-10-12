import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-accent/10 to-black flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-accent">404</h1>
          <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
          <p className="text-gray-400">The page you're looking for doesn't exist in the DEUS Operating System.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" className="bg-accent hover:bg-accent/80">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-accent/20 text-accent hover:bg-accent/10 bg-transparent">
            <Link href="/pools">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Pools
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
