export default function BoardLoading() {
  return (
    <div className="flex flex-col flex-1 p-6 md:p-8 bg-[#FFFDF8] dark:bg-[#0D0E12] w-full min-h-screen font-sans">
      <div className="w-full mx-auto flex flex-col h-full">
        
        {/* Header Skeleton */}
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-black/10 dark:bg-white/10 border-2 border-black dark:border-white animate-pulse" />
            <div className="h-8 w-48 bg-black/10 dark:bg-white/10 border-2 border-black dark:border-white animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-24 bg-[#FFE600]/30 border-2 border-black dark:border-white animate-pulse" />
            <div className="h-9 w-24 bg-black/10 dark:bg-white/10 border-2 border-black dark:border-white animate-pulse" />
          </div>
        </div>

        {/* Board Columns Skeleton */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="w-80 flex-shrink-0 flex flex-col gap-4 h-full bg-white dark:bg-[#181920] p-4 border-3 border-black dark:border-white shadow-neo">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
                <div className="h-5 w-24 bg-black/10 dark:bg-white/10 border border-black animate-pulse" />
                <div className="h-5 w-5 bg-[#FFE600] border border-black animate-pulse" />
              </div>
              
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((card) => (
                  <div key={card} className="h-28 bg-[#FFFDF8] dark:bg-[#20222a] border-2 border-black dark:border-white p-4 flex flex-col justify-between shadow-neo-sm">
                    <div className="h-4 w-3/4 bg-black/10 dark:bg-white/10 border border-black/40 animate-pulse" />
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-12 bg-[#FFE600]/40 border border-black/40 animate-pulse" />
                      <div className="h-6 w-6 bg-black/10 dark:bg-white/10 border border-black/40 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
