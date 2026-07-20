import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black font-sans text-center p-4">
      <div className="space-y-4 max-w-md">
        <h1 className="text-8xl font-black text-zinc-200 dark:text-zinc-800 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Page not found</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
        </p>
        <div className="pt-4">
          <Link href="/" className="inline-block px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
