'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFDF8] dark:bg-[#0D0E12] font-sans text-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo p-8 text-left space-y-5">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] border-2 border-black text-xs font-black uppercase tracking-wider text-black">
              <ShieldAlert className="w-4 h-4 text-black" />
              403 · Access Denied
            </div>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full border border-black bg-[#FF6B6B]" />
              <span className="w-3 h-3 rounded-full border border-black bg-[#FFE600]" />
              <span className="w-3 h-3 rounded-full border border-black bg-[#4ADE80]" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">Access Restricted</h2>
          <p className="text-sm font-medium text-black/70 dark:text-white/75 leading-relaxed">
            You don't have permission to access this project or workspace. It may be restricted to invited team members.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:translate-x-1 active:translate-y-1"
            >
              <Home className="w-4 h-4" />
              Return to Workspaces
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFDF8] dark:bg-[#0D0E12] font-sans text-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo p-8 text-left space-y-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6B6B] text-black border-2 border-black text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            500 · System Error
          </div>
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full border border-black bg-[#FF6B6B]" />
            <span className="w-3 h-3 rounded-full border border-black bg-[#FFE600]" />
            <span className="w-3 h-3 rounded-full border border-black bg-[#4ADE80]" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">Something Went Wrong</h2>
        <p className="text-sm font-medium text-black/70 dark:text-white/75 leading-relaxed">
          An unexpected error occurred while processing your request. Please try again or return to the workspace index.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#38BDF8] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:translate-x-1 active:translate-y-1"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#20222a] text-black dark:text-white border-2 border-black dark:border-white font-black text-xs uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:translate-x-1 active:translate-y-1"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
