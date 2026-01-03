export default function DeployedLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="h-12 bg-white/10 rounded-lg w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white/5 rounded-lg animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-2 w-3/4" />
              <div className="h-6 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-white/5 rounded-2xl animate-pulse space-y-4">
              <div className="h-12 bg-white/10 rounded-full w-12" />
              <div className="h-6 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded" />
              <div className="h-10 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
