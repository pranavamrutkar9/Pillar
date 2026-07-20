export default function BoardLoading() {
  return (
    <div className="flex flex-col flex-1 p-8 bg-zinc-50 dark:bg-black w-full min-h-screen">
      <div className="w-full mx-auto flex flex-col h-full">
        
        {/* Header Skeleton */}
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Board Columns Skeleton */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="w-80 flex-shrink-0 flex flex-col gap-4 h-full bg-zinc-100/50 dark:bg-zinc-900/20 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center justify-between px-1">
                <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-5 w-5 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
              </div>
              
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((card) => (
                  <div key={card} className="h-28 bg-white dark:bg-zinc-950 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between">
                    <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                      <div className="h-6 w-6 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
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
