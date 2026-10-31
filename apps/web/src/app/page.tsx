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
  ExternalLink,
  Flame,
  Zap,
  Check
} from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF8] dark:bg-[#0D0E12] text-black dark:text-zinc-100 transition-colors selection:bg-[#FFE600] selection:text-black">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#FFFDF8]/90 dark:bg-[#0D0E12]/90 border-b-2 border-black dark:border-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center text-black font-black text-base shadow-[2px_2px_0px_0px_#000] transition-transform group-hover:-translate-y-0.5">
              <span className="font-mono">P</span>
            </div>
            <span className="text-lg font-black tracking-tight text-black dark:text-white">
              Pillar
            </span>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border-2 border-black dark:border-white text-black dark:text-white bg-[#4ADE80] shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff]">
              v2.0
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-black dark:text-zinc-300">
            <a href="#features" className="hover:text-amber-600 dark:hover:text-[#FFE600] transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-amber-600 dark:hover:text-[#FFE600] transition-colors">
              Philosophy
            </a>
            <Link 
              href="https://github.com/pranavamrutkar9/Pillar" 
              target="_blank" 
              className="hover:text-amber-600 dark:hover:text-[#FFE600] transition-colors flex items-center gap-1.5"
            >
              GitHub <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/auth" 
              className="text-xs font-bold text-black dark:text-white px-3.5 py-1.5 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/auth" 
              className="text-xs font-black px-4 py-1.5 rounded-lg bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="w-full max-w-5xl px-6 pt-16 pb-14 flex flex-col items-center text-center">
          
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-black bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] mb-8 hover:-translate-y-0.5 transition-transform cursor-default">
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            <span>Pillar 2.0 Neo-Edition</span>
            <span>•</span>
            <span className="font-mono">Uncompromising Engineering Speed</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-black dark:text-white max-w-3xl leading-[1.05] mb-6">
            ENGINEERED FOR FLOW. <br />
            <span className="inline-block bg-[#FFE600] text-black px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_#000] -rotate-1 mt-2">
              ZERO BUSYWORK.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-zinc-700 dark:text-zinc-300 max-w-2xl font-medium leading-relaxed mb-10">
            A high-contrast, tactile issue tracker and engineering workbench. Manage sprints, commit ADRs & RFCs, and break down complex PRDs with AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/auth" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#FFE600] text-black font-black text-sm border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[1px_1px_0px_0px_#000] transition-all group"
            >
              Start Free Workspace
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="https://github.com/pranavamrutkar9/Pillar" 
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white font-bold text-sm shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff] active:translate-y-1 active:shadow-[1px_1px_0px_0px_#000] transition-all"
            >
              <GitBranch className="w-4 h-4 text-black dark:text-white" />
              View Source on GitHub
            </Link>
          </div>

          {/* Product Showcase Mockup */}
          <div className="w-full mt-14 rounded-2xl border-3 border-black dark:border-white bg-white dark:bg-zinc-900 p-3 sm:p-4 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff]">
            {/* Window Topbar */}
            <div className="rounded-xl border-2 border-black dark:border-white bg-amber-50 dark:bg-zinc-950 p-4">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black dark:border-white text-left">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-black" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-black" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-black" />
                  <span className="text-xs font-mono font-bold text-black dark:text-white ml-2 bg-white dark:bg-zinc-800 px-2 py-0.5 border border-black rounded">
                    pillar / sprint-14
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
                  <span className="px-2 py-0.5 rounded border-2 border-black bg-[#FFE600] font-mono text-[11px] shadow-[1.5px_1.5px_0px_0px_#000]">
                    92% VELOCITY
                  </span>
                  <span className="px-2 py-0.5 rounded border-2 border-black bg-[#4ADE80] text-black font-mono text-[11px] shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> ACTIVE
                  </span>
                </div>
              </div>

              {/* Mock Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                
                {/* Column 1: In Progress */}
                <div className="bg-amber-100/60 dark:bg-zinc-900 border-2 border-black dark:border-white rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
                  <div className="flex items-center justify-between mb-3 text-xs font-black text-black dark:text-white">
                    <div className="flex items-center gap-1.5 bg-[#FFE600] px-2 py-0.5 border-2 border-black rounded shadow-[1.5px_1.5px_0px_0px_#000]">
                      <span>IN PROGRESS</span>
                    </div>
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border-2 border-black">2</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-xs shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-y-0.5 transition-transform">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-black dark:text-white mb-1.5">
                        <span>PIL-104</span>
                        <span className="bg-[#FF6B6B] text-black font-mono text-[10px] px-1.5 py-0.2 rounded border border-black">URGENT</span>
                      </div>
                      <p className="font-bold text-black dark:text-white leading-snug">Implement webhook deduplication layer</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white border border-black">BACKEND</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#FFE600] text-black border border-black">3 PTS</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-xs shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-y-0.5 transition-transform">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-black dark:text-white mb-1.5">
                        <span>PIL-106</span>
                        <span className="bg-[#38BDF8] text-black font-mono text-[10px] px-1.5 py-0.2 rounded border border-black">HIGH</span>
                      </div>
                      <p className="font-bold text-black dark:text-white leading-snug">Optimistic UI for cycle item reordering</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white border border-black">FRONTEND</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#FFE600] text-black border border-black">2 PTS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: In Review */}
                <div className="bg-purple-100/60 dark:bg-zinc-900 border-2 border-black dark:border-white rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
                  <div className="flex items-center justify-between mb-3 text-xs font-black text-black dark:text-white">
                    <div className="flex items-center gap-1.5 bg-[#C084FC] px-2 py-0.5 border-2 border-black rounded shadow-[1.5px_1.5px_0px_0px_#000]">
                      <span>IN REVIEW</span>
                    </div>
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border-2 border-black">1</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-xs shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-y-0.5 transition-transform">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-black dark:text-white mb-1.5">
                        <span>ADR-04</span>
                        <span className="bg-[#DDD6FE] text-black font-mono text-[10px] px-1.5 py-0.2 rounded border border-black">PROPOSED</span>
                      </div>
                      <p className="font-bold text-black dark:text-white leading-snug">Redis caching policy for multi-tenant workspace queries</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-[#C084FC] text-black border border-black">ARCHITECTURE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Done */}
                <div className="bg-emerald-100/60 dark:bg-zinc-900 border-2 border-black dark:border-white rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
                  <div className="flex items-center justify-between mb-3 text-xs font-black text-black dark:text-white">
                    <div className="flex items-center gap-1.5 bg-[#4ADE80] px-2 py-0.5 border-2 border-black rounded shadow-[1.5px_1.5px_0px_0px_#000]">
                      <span>COMPLETED</span>
                    </div>
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border-2 border-black">2</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-xs shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-y-0.5 transition-transform">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-black dark:text-white mb-1.5">
                        <span>PIL-99</span>
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      </div>
                      <p className="font-bold text-zinc-600 dark:text-zinc-400 line-through leading-snug">Automated AI requirement breakdown studio</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-[#4ADE80] text-black border border-black">SHIPPED</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-xs shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-y-0.5 transition-transform">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-black dark:text-white mb-1.5">
                        <span>PIL-101</span>
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      </div>
                      <p className="font-bold text-zinc-600 dark:text-zinc-400 line-through leading-snug">GitHub OAuth webhook sync listener</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-[#4ADE80] text-black border border-black">SHIPPED</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </section>

        {/* Features Grid */}
        <section id="features" className="w-full max-w-5xl px-6 py-20 border-t-2 border-black dark:border-white">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="inline-block text-xs font-mono font-black uppercase px-2.5 py-1 bg-[#FFE600] border-2 border-black rounded shadow-[2px_2px_0px_0px_#000] mb-3">
              SYSTEM CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black dark:text-white mb-3">
              BUILT FOR MOMENTUM.
            </h2>
            <p className="text-base text-zinc-700 dark:text-zinc-300 font-medium">
              Every interaction is engineered to eliminate drag, friction, and administrative lag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border-2 border-black dark:border-white bg-[#FEF08A] text-black shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl border-2 border-black bg-white flex items-center justify-center text-black mb-5 shadow-[2px_2px_0px_0px_#000]">
                <Clock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-black mb-2 uppercase">
                Cycles Over Backlogs
              </h3>
              <p className="text-sm text-black font-medium leading-relaxed">
                Focus on fixed 2-week horizons with automated rollover and real-time burndown analytics. Ban stagnant 400-ticket backlogs forever.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border-2 border-black dark:border-white bg-[#BAE6FD] text-black shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl border-2 border-black bg-white flex items-center justify-center text-black mb-5 shadow-[2px_2px_0px_0px_#000]">
                <FileText className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-black mb-2 uppercase">
                First-Class ADRs & RFCs
              </h3>
              <p className="text-sm text-black font-medium leading-relaxed">
                Architecture Decision Records and RFCs live right alongside your issues. Preserve historical technical reasoning in plain sight.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border-2 border-black dark:border-white bg-[#BBF7D0] text-black shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl border-2 border-black bg-white flex items-center justify-center text-black mb-5 shadow-[2px_2px_0px_0px_#000]">
                <Sparkles className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-black mb-2 uppercase">
                AI Breakdown Studio
              </h3>
              <p className="text-sm text-black font-medium leading-relaxed">
                Paste product specifications or technical briefs. Pillar extracts modules, clarifies ambiguities, and generates structured issues ready to execute.
              </p>
            </div>

          </div>
        </section>

        {/* Philosophy section */}
        <section id="architecture" className="w-full max-w-5xl px-6 py-20 border-t-2 border-black dark:border-white">
          <div className="rounded-2xl border-3 border-black dark:border-white bg-[#FFE600] dark:bg-zinc-900 text-black dark:text-white p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff]">
            <div className="max-w-xl">
              <span className="text-xs font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border-2 border-black bg-white text-black shadow-[1.5px_1.5px_0px_0px_#000]">
                TACTILE PRINCIPLE
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight mt-3 mb-4 leading-tight">
                Tools should feel physical, fast, and satisfying.
              </h3>
              <p className="text-sm sm:text-base font-semibold leading-relaxed">
                No sluggish micro-interactions or hidden context menus. Pillar treats engineering project management as high-performance tooling with immediate visual clarity.
              </p>
            </div>
            <Link 
              href="/auth" 
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-sm font-black transition-all shadow-[4px_4px_0px_0px_#FFE600] dark:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 shrink-0"
            >
              Get Started Free <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t-2 border-black dark:border-white bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-black dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#FFE600] border-2 border-black flex items-center justify-center text-xs text-black font-mono font-black shadow-[1.5px_1.5px_0px_0px_#000]">
              P
            </div>
            <span className="font-black text-black dark:text-white">Pillar</span>
            <span>—</span>
            <span>High-Speed Engineering Operations</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="https://github.com/pranavamrutkar9/Pillar" target="_blank" className="hover:text-amber-600 transition-colors">
              GitHub
            </Link>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
