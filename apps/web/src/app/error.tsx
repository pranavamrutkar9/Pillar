'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isForbidden = error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403');

  if (isForbidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black font-sans text-center p-4">
        <div className="space-y-4 max-w-md">
          <h1 className="text-8xl font-black text-amber-200 dark:text-amber-900/30 tracking-tighter">403</h1>
          <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Access Denied</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            You don't have permission to access this resource. It may be restricted to workspace members.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link href="/" className="inline-block px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black font-sans text-center p-4">
      <div className="space-y-4 max-w-md">
        <h1 className="text-8xl font-black text-red-200 dark:text-red-900/30 tracking-tighter">500</h1>
        <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Something went wrong</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          An unexpected error occurred. Our servers are having a little hiccup.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="inline-block px-6 py-3 bg-white text-black border border-zinc-200 dark:bg-zinc-950 dark:text-white dark:border-zinc-800 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Try again
          </button>
          <Link href="/" className="inline-block px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
