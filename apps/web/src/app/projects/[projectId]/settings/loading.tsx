export default function SettingsLoading() {
  return (
    <div className="flex flex-col flex-1 p-8 bg-zinc-50 dark:bg-black w-full min-h-screen">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header Skeleton */}
        <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-72 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Form Skeleton */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md animate-pulse" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-32 w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md animate-pulse" />
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Danger Zone Skeleton */}
        <div className="mt-12 p-6 border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-950/10">
          <div className="h-6 w-32 bg-red-200 dark:bg-red-900/50 rounded mb-4 animate-pulse" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-3 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-red-200 dark:bg-red-900/50 rounded-md animate-pulse" />
          </div>
        </div>

      </div>
    </div>
  );
}
