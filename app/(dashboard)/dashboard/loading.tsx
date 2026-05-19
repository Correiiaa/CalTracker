export default function DashboardPageLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-60 bg-zinc-900 border border-zinc-800/60 rounded-xl" />
          <div className="h-4 w-72 bg-zinc-900 border border-zinc-800/60 rounded-lg" />
        </div>
        <div className="h-12 w-full md:w-44 bg-zinc-900 border border-zinc-800/60 rounded-2xl" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Calories circular progress dial */}
        <div className="lg:col-span-1 rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center justify-center min-h-[340px]">
          <div className="h-6 w-32 bg-zinc-850 rounded-lg mb-6" />
          
          {/* Circle ring loader shape */}
          <div className="relative flex items-center justify-center h-48 w-48 rounded-full border-[12px] border-zinc-850 bg-zinc-950/10">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-16 bg-zinc-850 rounded-lg" />
              <div className="h-3.5 w-24 bg-zinc-850 rounded-md" />
              <div className="h-3 w-10 bg-zinc-850 rounded-md" />
            </div>
          </div>
          
          <div className="h-5 w-48 bg-zinc-850 rounded-lg mt-6" />
        </div>

        {/* Macros card */}
        <div className="lg:col-span-2 rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between min-h-[340px]">
          <div className="space-y-6 w-full">
            <div className="h-6 w-52 bg-zinc-850 rounded-lg" />
            
            {/* Macro Bars */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-2.5">
                <div className="flex justify-between">
                  <div className="h-4.5 w-24 bg-zinc-850 rounded-md" />
                  <div className="h-4.5 w-16 bg-zinc-850 rounded-md" />
                </div>
                <div className="h-3 w-full bg-zinc-950 rounded-full" />
                <div className="flex justify-between">
                  <div className="h-3.5 w-20 bg-zinc-850 rounded-md" />
                  <div className="h-3.5 w-24 bg-zinc-850 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          <div className="h-4.5 w-64 bg-zinc-850 rounded-md mt-6" />
        </div>

      </div>

      {/* Today's Meals section */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-44 bg-zinc-850 rounded-lg" />
          <div className="h-6 w-24 bg-zinc-850 rounded-full" />
        </div>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-zinc-950 border border-zinc-850 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-5.5 w-36 bg-zinc-850 rounded-lg" />
                  <div className="h-3.5 w-12 bg-zinc-850 rounded-md" />
                </div>
                <div className="h-4 w-60 bg-zinc-850 rounded-md" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 bg-zinc-850 rounded-md" />
                  <div className="h-8 w-8 bg-zinc-850 rounded-md" />
                  <div className="h-8 w-8 bg-zinc-850 rounded-md" />
                </div>
                <div className="h-10 w-16 bg-zinc-850 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
