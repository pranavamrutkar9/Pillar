import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  
  // If already logged in, redirect directly to the app
  if (session) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Image className="dark:invert" src="/next.svg" alt="Pillar Logo" width={80} height={16} priority />
        </div>
        <div className="flex items-center gap-4">
          <Link href="https://github.com/pranavamrutkar9/Pillar" target="_blank" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            GitHub
          </Link>
          <Link href="/auth" className="px-4 py-2 text-sm font-medium text-white bg-black dark:text-black dark:bg-white rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all">
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="w-full max-w-5xl px-8 pt-32 pb-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-400 uppercase">V1 Now Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-black dark:text-white mb-6">
            The memory layer for <br className="hidden md:block"/> engineering teams.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10">
            Pillar is a blazing fast issue tracker designed to keep you in flow. Plan cycles, write technical specs, and ship faster without the clutter.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <Link href="/auth" className="px-8 py-3.5 text-base font-medium text-white bg-black dark:text-black dark:bg-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto">
              Get Started for Free
            </Link>
            <Link href="https://github.com/pranavamrutkar9/Pillar" target="_blank" className="px-8 py-3.5 text-base font-medium text-black bg-white border border-zinc-200 dark:text-white dark:bg-zinc-950 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all w-full sm:w-auto">
              Star on GitHub
            </Link>
          </div>

          {/* Screenshot / GIF Placeholder */}
          <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 overflow-hidden aspect-video relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 opacity-50" />
            <span className="text-zinc-400 dark:text-zinc-600 font-medium z-10">[ Product Screenshot / Demo GIF ]</span>
            <Image src="/next.svg" alt="App Preview" fill className="object-cover opacity-5 dark:invert" />
          </div>
        </section>

        {/* Trusted Stack */}
        <section className="w-full border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 flex flex-col items-center">
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-8">Powered by a Modern Stack</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 px-8 max-w-5xl opacity-70">
            {['Next.js', 'TypeScript', 'Express', 'Prisma', 'PostgreSQL', 'BullMQ', 'Redis', 'Socket.io'].map(tech => (
              <span key={tech} className="text-lg font-bold text-zinc-800 dark:text-zinc-300">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Features: PLAN, BUILD, SHOW */}
        <section className="w-full max-w-6xl px-8 py-32 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
          <div className="flex flex-col items-start gap-4 p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center font-bold text-xl mb-2">1</div>
            <h3 className="text-2xl font-bold text-black dark:text-white tracking-tight">PLAN</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Capture ideas in milliseconds. Break them down into issues, group them into cycles, and map out your technical architecture with built-in ADRs and RFCs.
            </p>
          </div>
          
          <div className="flex flex-col items-start gap-4 p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors md:-translate-y-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-2">2</div>
            <h3 className="text-2xl font-bold text-black dark:text-white tracking-tight">BUILD</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Move fast with a keyboard-first interface. Update statuses instantly with optimistic UI, and stay in sync with real-time websocket updates across your team.
            </p>
          </div>
          
          <div className="flex flex-col items-start gap-4 p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors md:-translate-y-16">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center font-bold text-xl mb-2">3</div>
            <h3 className="text-2xl font-bold text-black dark:text-white tracking-tight">SHOW</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Generate public viewer links in one click. Share your progress with stakeholders securely without requiring them to create an account.
            </p>
          </div>
        </section>

        {/* Hackathon Callout */}
        <section className="w-full max-w-4xl px-8 py-20 mb-20 text-center flex flex-col items-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-black rounded-3xl border border-blue-100 dark:border-blue-900/50">
          <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight mb-4">
            Built for velocity. <span className="text-blue-600 dark:text-blue-400">Hackathon Mode.</span>
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mb-8">
            Working over the weekend? Toggle Hackathon mode to strip away the complex project management features and focus strictly on execution and speed.
          </p>
          <Link href="/auth" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            Try it out
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Image className="dark:invert mb-4" src="/next.svg" alt="Pillar Logo" width={80} height={16} />
            <p className="text-sm text-zinc-500 max-w-xs">
              Open-source issue tracking for the modern engineering team. Built for speed, designed for clarity.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <h4 className="font-semibold text-black dark:text-white mb-2">Project</h4>
            <Link href="https://github.com/pranavamrutkar9/Pillar" target="_blank" className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">GitHub Repository</Link>
            <Link href="https://github.com/pranavamrutkar9/Pillar#readme" target="_blank" className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">Documentation</Link>
            <span className="text-zinc-500">MIT License</span>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <h4 className="font-semibold text-black dark:text-white mb-2">Tech Stack</h4>
            <span className="text-zinc-500">Next.js & React</span>
            <span className="text-zinc-500">Express & Node.js</span>
            <span className="text-zinc-500">Prisma & PostgreSQL</span>
            <span className="text-zinc-500">Redis & BullMQ</span>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-900 text-sm text-zinc-400">
          © {new Date().getFullYear()} Pillar. Open Source under MIT.
        </div>
      </footer>

    </div>
  );
}
