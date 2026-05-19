export default function HistoryPageLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="h-9 w-64 bg-zinc-900 border border-zinc-800/60 rounded-xl" />
        <div className="h-4.5 w-80 bg-zinc-900 border border-zinc-800/60 rounded-lg" />
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Col 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 7-Day Chart Card */}
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-6">
            <div className="h-6 w-52 bg-zinc-850 rounded-lg" />
            
            {/* Custom SVG Column Loader Simulation */}
            <div className="flex justify-between items-end h-[160px] border-b border-zinc-850 px-2 pb-1.5">
              {[40, 90, 60, 110, 50, 75, 120].map((h, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-8 sm:w-10 bg-zinc-850 rounded-t-xl" 
                    style={{ height: `${h}px` }}
                  />
                </div>
              ))}
            </div>

            {/* Chart Labels */}
            <div className="flex justify-around">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d, i) => (
                <div key={i} className="h-4 w-8 bg-zinc-850 rounded-md" />
              ))}
            </div>
          </div>

          {/* Select Date Card */}
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
            <div className="h-4.5 w-28 bg-zinc-850 rounded-md" />
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="h-11 w-full sm:w-44 bg-zinc-950 border border-zinc-800 rounded-2xl" />
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <div className="h-9.5 w-16 bg-zinc-950 border border-zinc-800 rounded-xl" />
                <div className="h-9.5 w-16 bg-zinc-950 border border-zinc-800 rounded-xl" />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Col 1/3) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Resumo do Dia Card */}
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-6">
            <div className="h-6 w-32 bg-zinc-850 rounded-lg" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 h-16 flex flex-col justify-between" />
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 h-16 flex flex-col justify-between" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex justify-between items-center pb-2 border-b border-zinc-850/50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-zinc-800" />
                    <div className="h-4 w-16 bg-zinc-850 rounded-md" />
                  </div>
                  <div className="h-4 w-8 bg-zinc-850 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Refeições do Dia Card */}
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
            <div className="h-6 w-36 bg-zinc-850 rounded-lg" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2.5">
                  <div className="flex justify-between">
                    <div className="h-4.5 w-24 bg-zinc-850 rounded-md" />
                    <div className="h-4.5 w-14 bg-zinc-850 rounded-md" />
                  </div>
                  <div className="h-3 w-16 bg-zinc-850 rounded-md" />
                  <div className="h-3 w-40 bg-zinc-850 rounded-md" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
