export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-zinc-900 border border-zinc-800/50 rounded-xl" />
          <div className="h-4 w-64 bg-zinc-900 border border-zinc-800/50 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-zinc-900 border border-zinc-800/50 rounded-xl" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Main Column - big circular progress card */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between min-h-[320px] relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-32 bg-zinc-800 rounded-lg" />
            <div className="h-5 w-16 bg-zinc-800 rounded-md" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 my-auto">
            {/* Circle Skeleton */}
            <div className="relative flex items-center justify-center h-44 w-44 rounded-full border-[12px] border-zinc-850 bg-zinc-950/20">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-16 bg-zinc-800 rounded-lg" />
                <div className="h-3 w-20 bg-zinc-800 rounded-md" />
              </div>
            </div>
            
            {/* Macro Bars Skeleton */}
            <div className="w-full md:w-60 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <div className="h-4 w-12 bg-zinc-800 rounded-md" />
                    <div className="h-4 w-20 bg-zinc-800 rounded-md" />
                  </div>
                  <div className="h-2 w-full bg-zinc-950 border border-zinc-850 rounded-full">
                    <div className="h-full w-1/3 bg-zinc-800 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - sidebar metrics cards */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 bg-zinc-800 rounded-lg" />
              <div className="h-5 w-5 bg-zinc-800 rounded-md" />
            </div>
            <div className="h-10 w-28 bg-zinc-850 rounded-xl" />
            <div className="h-4 w-full bg-zinc-850 rounded-lg" />
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 bg-zinc-800 rounded-lg" />
              <div className="h-5 w-5 bg-zinc-800 rounded-md" />
            </div>
            <div className="h-10 w-28 bg-zinc-850 rounded-xl" />
            <div className="h-4 w-full bg-zinc-850 rounded-lg" />
          </div>
        </div>

      </div>

      {/* Bottom Table/List Skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-44 bg-zinc-850 rounded-lg" />
          <div className="h-4 w-20 bg-zinc-850 rounded-md" />
        </div>
        
        <div className="divide-y divide-zinc-850">
          {[1, 2, 3].map((row) => (
            <div key={row} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-zinc-850 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-zinc-850 rounded-md" />
                  <div className="h-3 w-20 bg-zinc-850 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-16 bg-zinc-850 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
