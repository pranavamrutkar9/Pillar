'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-center p-6">
        <div className="space-y-4 max-w-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            403 · Forbidden
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Access Restricted</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            You don't have permission to access this project or workspace. It may be restricted to invited team members.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-sm">
              <Home className="w-3.5 h-3.5" />
              Return to Workspaces
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-center p-6">
      <div className="space-y-4 max-w-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-2">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="text-xs font-mono font-medium text-rose-600 dark:text-rose-400 uppercase tracking-widest">
          500 · System Error
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Something went wrong</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          An unexpected error occurred while processing your request. Please try again or return to the workspace index.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 rounded-lg text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
          <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-sm">
            <Home className="w-3.5 h-3.5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
