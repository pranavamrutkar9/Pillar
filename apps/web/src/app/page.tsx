import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowRight, 
  GitBranch, 
  Layers, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles, 
  Terminal, 
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors">
      
      {/* Subtle top subtle border glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent opacity-50" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#FAFAFA]/80 dark:bg-[#09090B]/80 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-semibold text-sm tracking-tight transition-transform group-hover:scale-105">
              <span className="font-mono">P</span>
            </div>
            <span className="text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              Pillar
            </span>
            <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-zinc-100/60 dark:bg-zinc-900/60">
              v2.0
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Philosophy
            </a>
            <Link 
              href="https://github.com/pranavamrutkar9/Pillar" 
              target="_blank" 
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5"
            >
              GitHub <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/auth" 
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3.5 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth" 
              className="text-sm font-medium px-4 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all shadow-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="w-full max-w-5xl px-6 pt-20 pb-16 flex flex-col items-center text-center">
          
          {/* Subtle Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 mb-8 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pillar 2.0 is live</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-zinc-500 dark:text-zinc-500">The engineering workspace for focused teams</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-3xl leading-[1.08] mb-6">
            Crafted for clarity. <br />
            <span className="text-zinc-400 dark:text-zinc-500">Engineered for speed.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed mb-10">
            A quiet, thoughtful issue tracker and architectural platform. Manage cycles, maintain ADRs, and break down complex PRDs without administrative friction.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Link 
              href="/auth" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm font-medium transition-all shadow-xs group"
            >
              Start Free Workspace
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link 
              href="https://github.com/pranavamrutkar9/Pillar" 
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium transition-colors"
            >
              <GitBranch className="w-4 h-4 text-zinc-400" />
              View Source on GitHub
            </Link>
          </div>

          {/* Product Showcase Mockup */}
          <div className="w-full mt-16 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-2 sm:p-3 shadow-2xl shadow-zinc-900/5 dark:shadow-black/50">
            {/* Window Topbar */}
            <div className="rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200/50 dark:border-zinc-800/50 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 ml-2">pillar / core / sprint-14</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200/50 dark:bg-zinc-800/50 font-mono text-[11px]">84% velocity</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                </div>
              </div>

              {/* Mock Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                
                {/* Column 1: In Progress */}
                <div className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>In Progress</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">2</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-xs shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                        <span>PIL-104</span>
                        <span className="text-amber-600 dark:text-amber-400 font-sans font-medium text-[10px]">High</span>
                      </div>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 leading-snug">Implement webhook deduplication layer</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Backend</span>
                        <span>•</span>
                        <span>3 pts</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-xs shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                        <span>PIL-106</span>
                        <span className="text-zinc-400 font-sans font-medium text-[10px]">Normal</span>
                      </div>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 leading-snug">Optimistic UI for cycle item reordering</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Frontend</span>
                        <span>•</span>
                        <span>2 pts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: In Review */}
                <div className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>In Review</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">1</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-xs shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                        <span>ADR-04</span>
                        <span className="text-purple-600 dark:text-purple-400 font-sans font-medium text-[10px]">Proposed</span>
                      </div>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 leading-snug">Redis caching policy for multi-tenant workspace queries</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">Architecture</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Done */}
                <div className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Completed</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">2</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-xs shadow-2xs opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                        <span>PIL-99</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <p className="font-medium text-zinc-700 dark:text-zinc-300 leading-snug line-through">Automated AI requirement breakdown studio</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Shipped</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-xs shadow-2xs opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                        <span>PIL-101</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <p className="font-medium text-zinc-700 dark:text-zinc-300 leading-snug line-through">GitHub OAuth webhook sync listener</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Shipped</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </section>

        {/* Features Grid */}
        <section id="features" className="w-full max-w-5xl px-6 py-20 border-t border-zinc-200/70 dark:border-zinc-800/70">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
              Designed with quiet intentionality.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal">
              Every detail is calibrated to reduce context switching and amplify engineering momentum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-5">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Cycles Over Backlogs
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                Focus on fixed 2-week horizons with automated rollover and burndown metrics. Never look at a stagnant 400-ticket backlog again.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-5">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                First-Class ADRs & RFCs
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                Architecture Decision Records and RFCs live right alongside your issues. Preserve historical technical reasoning without scattered wiki docs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-5">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                AI Requirements Studio
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                Paste product specifications or technical briefs. Pillar extracts modules, clarifies ambiguities, and generates structured issues ready to commit.
              </p>
            </div>

          </div>
        </section>

        {/* Philosophy section */}
        <section id="architecture" className="w-full max-w-5xl px-6 py-20 border-t border-zinc-200/70 dark:border-zinc-800/70">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">Simplicity Principle</span>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2 mb-4">
                Software tools should get out of the engineer's way.
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                No bloated enterprise dashboards, slow paginated loads, or multi-step configuration wizards. Pillar is built with optimistic client updates and keyboard-accessible workflows for pure flow state.
              </p>
            </div>
            <Link 
              href="/auth" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm font-medium transition-all shadow-xs shrink-0"
            >
              Get Started Free <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950/50">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-[10px] text-white dark:text-zinc-900 font-mono font-bold">
              P
            </div>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Pillar</span>
            <span>—</span>
            <span>Simple, subtle engineering management</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="https://github.com/pranavamrutkar9/Pillar" target="_blank" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              GitHub
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
