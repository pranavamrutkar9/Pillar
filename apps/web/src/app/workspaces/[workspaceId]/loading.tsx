export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 p-6 md:p-8 bg-[#FFFDF8] dark:bg-[#0D0E12] w-full min-h-screen font-sans">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header Skeleton */}
        <div className="flex items-start justify-between w-full border-b-3 border-black dark:border-white pb-6">
          <div className="flex flex-col gap-3">
            <div className="h-10 w-64 bg-black/10 dark:bg-white/10 border-2 border-black dark:border-white animate-pulse" />
            <div className="flex gap-3">
              <div className="h-6 w-20 bg-[#FFE600]/30 border border-black animate-pulse" />
              <div className="h-6 w-32 bg-[#4ADE80]/30 border border-black animate-pulse" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-48 bg-black/10 dark:bg-white/10 border-2 border-black dark:border-white animate-pulse" />
            <div className="h-10 w-10 bg-[#FFE600] border-2 border-black animate-pulse" />
          </div>
        </div>

        {/* Overview Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white dark:bg-[#181920] border-2 border-black dark:border-white shadow-neo-sm animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="h-8 w-40 bg-black/10 dark:bg-white/10 border-2 border-black dark:border-white animate-pulse" />
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white dark:bg-[#181920] border-2 border-black dark:border-white shadow-neo-sm animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Sidebar area */}
          <div className="flex flex-col gap-6">
            <div className="h-8 w-40 bg-black/10 dark:bg-white/10 border-2 border-black dark:border-white animate-pulse" />
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white dark:bg-[#181920] border-2 border-black dark:border-white shadow-neo-sm animate-pulse" />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
