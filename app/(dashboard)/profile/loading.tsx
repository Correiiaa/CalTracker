export default function ProfilePageLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-pulse">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="h-9 w-56 bg-zinc-900 border border-zinc-800/60 rounded-xl" />
        <div className="h-4.5 w-80 bg-zinc-900 border border-zinc-800/60 rounded-lg" />
      </div>

      {/* Profile Form Skeleton */}
      <div className="space-y-6">
        
        {/* Card 1: Personal Info */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-6">
          <div className="h-6.5 w-44 bg-zinc-850 rounded-lg" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((field) => (
              <div key={field} className="space-y-2">
                <div className="h-4 w-16 bg-zinc-850 rounded-md" />
                <div className="h-11 w-full bg-zinc-950 border border-zinc-800 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Target Calories */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
          <div className="h-6.5 w-40 bg-zinc-850 rounded-lg" />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4.5 w-4.5 bg-zinc-950 border border-zinc-800 rounded" />
              <div className="h-4.5 w-60 bg-zinc-850 rounded-md" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-36 bg-zinc-850 rounded-md" />
              <div className="h-11 w-full bg-zinc-950 border border-zinc-800 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Save Button Skeleton */}
        <div className="h-12 w-full bg-zinc-900 border border-zinc-850 rounded-xl" />

      </div>
    </div>
  );
}
