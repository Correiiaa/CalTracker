export default function AddMealPageLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-pulse">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="h-9 w-52 bg-zinc-900 border border-zinc-800/60 rounded-xl" />
        <div className="h-4.5 w-80 bg-zinc-900 border border-zinc-800/60 rounded-lg" />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Card: Input Settings (Col 2/5) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 space-y-5 shadow-2xl">
            
            {/* Meal Metadata */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-zinc-850 rounded-md" />
                <div className="h-11 w-full bg-zinc-950 border border-zinc-800 rounded-xl" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-24 bg-zinc-850 rounded-md" />
                <div className="h-11 w-full bg-zinc-950 border border-zinc-800 rounded-xl" />
              </div>
            </div>

            {/* Input Method Toggle */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-zinc-850 rounded-md" />
              <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800/80 h-12" />
            </div>

            {/* Form Section Placeholder */}
            <div className="pt-2 space-y-3">
              <div className="h-11 w-full bg-zinc-950 border border-zinc-800 rounded-xl" />
              <div className="h-28 w-full bg-zinc-950/40 border border-dashed border-zinc-850 rounded-2xl" />
            </div>

          </div>
        </div>

        {/* Right Card: Summary & Saved items (Col 3/5) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <div className="h-6.5 w-48 bg-zinc-850 rounded-lg" />
              <div className="h-8 w-8 bg-zinc-850 rounded-lg" />
            </div>

            {/* Nutrients Totals Simulation */}
            <div className="grid grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 h-16 flex flex-col justify-between" />
              ))}
            </div>

            {/* Food items list skeleton */}
            <div className="space-y-3 pt-2">
              <div className="h-4 w-36 bg-zinc-850 rounded-md" />
              {[1, 2].map((i) => (
                <div key={i} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl flex justify-between items-center">
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-zinc-850 rounded-md" />
                    <div className="h-3 w-40 bg-zinc-850 rounded-md" />
                  </div>
                  <div className="h-6 w-6 bg-zinc-850 rounded-md" />
                </div>
              ))}
            </div>

            {/* Save Meal Button */}
            <div className="h-12 w-full bg-zinc-950 border border-zinc-800 rounded-xl mt-4" />

          </div>
        </div>

      </div>
    </div>
  );
}
