export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 p-8 bg-white dark:bg-black w-full min-h-screen">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* Header Skeleton */}
        <div className="flex items-start justify-between w-full border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div className="flex flex-col gap-3">
            <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="flex gap-3">
              <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Overview Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Sidebar area */}
          <div className="flex flex-col gap-8">
            <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
