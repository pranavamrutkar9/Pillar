export default function SettingsLoading() {
  return (
    <div className="flex flex-col flex-1 p-6 md:p-8 bg-[#FFFDF8] dark:bg-[#0D0E12] w-full min-h-screen font-sans">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header Skeleton */}
        <div className="flex flex-col gap-2 border-b-3 border-black dark:border-white pb-6">
          <div className="h-8 w-48 bg-black/10 dark:bg-white/10 border-2 border-black dark:border-white animate-pulse" />
          <div className="h-4 w-72 bg-black/10 dark:bg-white/10 border border-black/40 animate-pulse" />
        </div>

        {/* Form Skeleton */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white p-6 shadow-neo space-y-4">
            <div className="h-5 w-32 bg-[#FFE600]/40 border border-black animate-pulse" />
            <div className="h-10 w-full bg-[#FFFDF8] dark:bg-[#20222a] border-2 border-black dark:border-white animate-pulse" />
            <div className="h-10 w-full bg-[#FFFDF8] dark:bg-[#20222a] border-2 border-black dark:border-white animate-pulse" />
          </div>

          <div className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white p-6 shadow-neo space-y-4">
            <div className="h-5 w-24 bg-[#4ADE80]/40 border border-black animate-pulse" />
            <div className="h-24 w-full bg-[#FFFDF8] dark:bg-[#20222a] border-2 border-black dark:border-white animate-pulse" />
          </div>
        </div>

      </div>
    </div>
  );
}
