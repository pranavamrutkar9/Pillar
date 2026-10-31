import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFDF8] dark:bg-[#0D0E12] font-sans text-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo p-8 text-left space-y-6">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black border-2 border-black text-xs font-black uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            404 · Page Not Found
          </div>
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full border border-black bg-[#FF6B6B]" />
            <span className="w-3 h-3 rounded-full border border-black bg-[#FFE600]" />
            <span className="w-3 h-3 rounded-full border border-black bg-[#4ADE80]" />
          </div>
        </div>

        <div className="text-center py-4">
          <h1 className="text-7xl font-black text-black dark:text-white tracking-tighter select-none font-mono">
            404
          </h1>
          <p className="mt-2 text-base font-black text-black dark:text-white uppercase tracking-wider">
            Lost In The Blueprint
          </p>
        </div>

        <p className="text-sm font-medium text-black/70 dark:text-white/75 leading-relaxed text-center">
          We couldn't find the coordinates you're looking for. The issue, document, or workspace might have been deleted, moved, or never existed.
        </p>

        <div className="pt-2 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Home className="w-4 h-4" />
            Return to Workspaces
          </Link>
        </div>
      </div>
    </div>
  );
}
