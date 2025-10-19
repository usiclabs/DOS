import { Card } from "@/components/ui/card"

export default function CreatorsLoading() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
      <div className="mb-8 md:mb-12">
        <div className="h-12 w-64 bg-muted rounded-lg animate-pulse mb-4" />
        <div className="h-6 w-96 bg-muted rounded animate-pulse" />
      </div>

      <div className="mb-8">
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse bg-card/50 backdrop-blur-sm">
            <div className="h-48 bg-muted rounded-lg mb-4" />
            <div className="h-6 bg-muted rounded mb-2" />
            <div className="h-4 bg-muted rounded w-2/3 mb-4" />
            <div className="h-20 bg-muted rounded mb-4" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="h-16 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
            </div>
            <div className="h-10 bg-muted rounded" />
          </Card>
        ))}
      </div>
    </div>
  )
}
