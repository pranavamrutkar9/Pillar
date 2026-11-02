import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Repeat, 
  FileText, 
  Command, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink,
  Flame,
  Clock,
  ShieldCheck,
  Terminal
} from "lucide-react";
import AuthButtons from "@/components/AuthButtons";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F4F4F6] font-sans relative overflow-x-hidden">
      
      {/* Top Ambient Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#5E6AD2]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Linear Sticky Header */}
      <header className="border-b border-white/[0.08] backdrop-blur-xl bg-[#08090A]/70 sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-md bg-gradient-to-b from-[#5E6AD2] to-[#4752BC] flex items-center justify-center text-white font-semibold text-sm shadow-[0_0_15px_rgba(94,106,210,0.45)] group-hover:brightness-110 transition-all">
                <span>P</span>
              </div>
              <span className="font-semibold text-sm tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                Pillar
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-400">
                v2.0
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-medium">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#workflow" className="hover:text-white transition-colors">
                Cycles
              </a>
              <a href="#architecture" className="hover:text-white transition-colors">
                ADR & RFC
              </a>
              <a href="#ai-breakdown" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span className="text-[#00C2D1]">AI Studio</span>
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/workspaces"
                  className="linear-btn-primary text-xs"
                >
                  <span>Open App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <AuthButtons />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/auth"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  className="linear-btn-primary text-xs"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-24 space-y-24 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.04] text-xs text-zinc-300 hover:border-white/[0.18] transition-all cursor-default shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2] shadow-[0_0_8px_#5E6AD2]" />
            <span>Linear precision meets engineering architecture</span>
            <span className="text-zinc-500">•</span>
            <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.06] px-1.5 py-0.5 rounded">⌘K</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400">
            Crafted for clarity. <br />
            Engineered for speed.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto font-normal">
            The issue tracker designed for focused software teams. Fixed two-week cycles, automated PRD decomposition, and native Architecture Decision Records.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={session ? "/workspaces" : "/auth"}
              className="linear-btn-primary px-5 py-2.5 text-sm shadow-linear-glow"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="/auth"
              className="linear-btn-secondary px-4 py-2.5 text-sm"
            >
              <Command className="w-3.5 h-3.5 text-zinc-400" />
              <span>Explore Demo</span>
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#5E6AD2]" /> Keyboard-first navigation
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#5E6AD2]" /> Instant optimistic updates
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#5E6AD2]" /> No bloatware
            </span>
          </div>
        </div>

        {/* Linear App Interactive Mockup Showcase */}
        <div className="rounded-2xl border border-white/[0.1] bg-[#0E0F12] p-1.5 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)] max-w-5xl mx-auto">
          <div className="rounded-xl bg-[#08090A] border border-white/[0.05] p-5 sm:p-6 space-y-5">
            
            {/* Window Topbar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
                </div>
                <div className="h-4 w-px bg-white/[0.08] mx-2" />
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#5E6AD2]" /> Core Engine / Active Sprint
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Cycle 14 · 68% complete
                </span>
                <span className="linear-kbd">⌘K</span>
              </div>
            </div>

            {/* Kanban Columns Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              
              {/* Column: Todo */}
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-400 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border border-zinc-500" />
                    <span>Todo</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-600">3</span>
                </div>

                <div className="p-3 rounded-md bg-[#111215] border border-white/[0.07] shadow-xs space-y-2 hover:border-white/[0.16] transition-colors">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>PIL-184</span>
                    <span className="text-[#F76808] flex items-center gap-1 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F76808]" /> High
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-200">
                    Implement Webhook verification for GitHub sync
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                      Auth Engine
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 ml-auto">3p</span>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-[#111215] border border-white/[0.07] shadow-xs space-y-2 hover:border-white/[0.16] transition-colors">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>PIL-186</span>
                    <span className="text-[#0091FF] flex items-center gap-1 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0091FF]" /> Low
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-200">
                    Audit Log export in Parquet / JSON format
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                      Compliance
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 ml-auto">2p</span>
                  </div>
                </div>
              </div>

              {/* Column: In Progress */}
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-400 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
                    <span className="text-zinc-300">In Progress</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-600">2</span>
                </div>

                <div className="p-3 rounded-md bg-[#141519] border border-white/[0.12] shadow-xs space-y-2 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#F5A623]" />
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pl-1.5">
                    <span>PIL-178</span>
                    <span className="text-[#E5484D] flex items-center gap-1 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D] animate-pulse" /> Urgent
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white pl-1.5">
                    Streaming AI PRD Decomposition Engine
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 pl-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5E6AD2]/10 text-[#8B96FF] border border-[#5E6AD2]/20">
                      Studio
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 ml-auto">8p</span>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-[#111215] border border-white/[0.07] shadow-xs space-y-2 hover:border-white/[0.16] transition-colors">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>PIL-181</span>
                    <span className="text-[#F5A623] flex items-center gap-1 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" /> Med
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-200">
                    Socket.io room presence & cursor indicators
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                      Realtime
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 ml-auto">5p</span>
                  </div>
                </div>
              </div>

              {/* Column: Done */}
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-400 pb-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-2.5 h-2.5 text-[#5E6AD2]" />
                    <span className="text-zinc-300">Done</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-600">8</span>
                </div>

                <div className="p-3 rounded-md bg-[#111215]/80 border border-white/[0.06] space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>PIL-164</span>
                    <span className="text-zinc-500">Done</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-300 line-through text-zinc-500">
                    ADR 004: Event Bus via BullMQ & Redis Streams
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] text-zinc-500 border border-white/[0.05]">
                      ADRs
                    </span>
                    <span className="text-[10px] font-mono text-zinc-600 ml-auto">5p</span>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-[#111215]/80 border border-white/[0.06] space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>PIL-170</span>
                    <span className="text-zinc-500">Done</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-300 line-through text-zinc-500">
                    Burndown chart with deterministic carry-forward
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] text-zinc-500 border border-white/[0.05]">
                      Analytics
                    </span>
                    <span className="text-[10px] font-mono text-zinc-600 ml-auto">3p</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="space-y-12 pt-10">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-mono font-medium text-[#818CF8] uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Built for speed. Structured for scale.
            </h2>
            <p className="text-sm text-zinc-400">
              Pillar merges the tactile velocity of Linear with deep architectural intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Feature 1 */}
            <div className="linear-card p-6 space-y-4 hover:border-[#5E6AD2]/40 group">
              <div className="w-10 h-10 rounded-lg bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center text-[#818CF8] group-hover:scale-105 transition-transform">
                <Repeat className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Cycles Over Backlogs
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                Eliminate stagnant 500-ticket backlogs. Operate in focused 2-week cycles with automatic unfinished issue rollover and live burndown curves.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="linear-card p-6 space-y-4 hover:border-[#5E6AD2]/40 group">
              <div className="w-10 h-10 rounded-lg bg-[#00C2D1]/10 border border-[#00C2D1]/20 flex items-center justify-center text-[#00C2D1] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                AI PRD Studio
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                Paste raw product requirements or briefs. The AI studio automatically identifies modules, raises architecture clarifications, and creates scoped issues.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="linear-card p-6 space-y-4 hover:border-[#5E6AD2]/40 group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                First-Class ADRs & RFCs
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                Preserve technical reasoning alongside ticket implementation. Write Architecture Decision Records with Markdown and keep a living architectural log.
              </p>
            </div>

          </div>
        </div>

        {/* Philosophy Card */}
        <div id="architecture" className="rounded-2xl border border-white/[0.08] bg-[#0E0F12] p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">
              Engineering Manifesto
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Software tools should get out of the engineer's way.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal">
              No slow multi-second page reloads, bulky enterprise modals, or clumsy navigations. Pillar is designed for maximum flow state with instant keyboard control.
            </p>
            <div className="pt-2">
              <Link 
                href="/auth" 
                className="linear-btn-primary"
              >
                <span>Get Started Now</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Sleek Linear Footer */}
      <footer className="border-t border-white/[0.08] bg-[#08090A]/80 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-gradient-to-b from-[#5E6AD2] to-[#4752BC] flex items-center justify-center text-[10px] text-white font-bold">
              P
            </div>
            <span className="font-medium text-zinc-300">Pillar</span>
            <span>—</span>
            <span>Linear precision engineering intelligence</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="https://github.com/pranavamrutkar9/Pillar" target="_blank" className="hover:text-white transition-colors flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3" />
            </Link>
            <span>MIT License</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
