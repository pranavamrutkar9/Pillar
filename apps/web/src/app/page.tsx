import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowRight, Sparkles, Layers, GitBranch, Cpu, Command, Check } from "lucide-react";
import AuthButtons from "@/components/AuthButtons";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F4F4F5] font-sans relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#5E6AD2]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Sleek Top Navigation */}
      <header className="border-b border-white/[0.08] backdrop-blur-md bg-[#08090A]/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#5E6AD2] to-[#3B429F] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(94,106,210,0.4)]">
              P
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">
              Pillar
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 font-mono">
              v2.4
            </span>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/workspaces"
                  className="px-3.5 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-xs font-medium text-white transition-all flex items-center gap-1.5"
                >
                  <span>Open App</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
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
                  className="px-3.5 py-1.5 rounded-md bg-gradient-to-b from-[#5E6AD2] to-[#4B55C1] hover:brightness-110 text-xs font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all flex items-center gap-1.5"
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
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-20 space-y-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.04] text-xs text-zinc-400 hover:border-white/[0.16] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2]" />
            <span>Linear-speed workflow for engineering teams</span>
            <span className="font-mono text-[10px] text-zinc-500">⌘K</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            The purpose-built tool for high-velocity teams.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Meet the issue tracker designed for speed. Effortless backlog management, AI PRD decomposition, and continuous architectural clarity.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href={session ? "/workspaces" : "/auth"}
              className="px-5 py-2.5 rounded-md bg-gradient-to-b from-[#5E6AD2] to-[#4B55C1] hover:brightness-110 text-sm font-medium text-white shadow-[0_0_20px_rgba(94,106,210,0.4)] transition-all flex items-center gap-2"
            >
              <span>Launch Pillar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth"
              className="px-4 py-2.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-medium text-zinc-300 transition-colors"
            >
              Explore Demo
            </Link>
          </div>
        </div>

        {/* Linear App Mockup Preview */}
        <div className="rounded-xl border border-white/[0.1] bg-[#0E0F12] p-1 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.9)] max-w-4xl mx-auto">
          <div className="rounded-lg bg-[#08090A] border border-white/[0.04] p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">PIL-Sprint-04 // Active Cycle</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] border border-white/[0.08] text-zinc-400">
                  Filters: All Active
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#5E6AD2]/15 text-[#818CF8] border border-[#5E6AD2]/30">
                  92% Velocity
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-md border border-white/[0.06] bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium">Todo</span>
                  <span className="font-mono text-[11px] text-zinc-500">4</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded border border-white/[0.06] bg-[#0E0F12] text-xs space-y-1">
                    <span className="text-white font-medium block">Configure Stripe webhook worker</span>
                    <span className="text-[10px] text-zinc-500 font-mono block">PIL-104 · High</span>
                  </div>
                  <div className="p-2.5 rounded border border-white/[0.06] bg-[#0E0F12] text-xs space-y-1">
                    <span className="text-white font-medium block">Add Redis deduplication queue</span>
                    <span className="text-[10px] text-zinc-500 font-mono block">PIL-105 · Medium</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-md border border-white/[0.06] bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium">In Progress</span>
                  <span className="font-mono text-[11px] text-zinc-500">2</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded border border-white/[0.06] bg-[#0E0F12] text-xs space-y-1">
                    <span className="text-white font-medium block">Build PRD clarification engine</span>
                    <span className="text-[10px] text-[#818CF8] font-mono block">PIL-98 · In Progress</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-md border border-white/[0.06] bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium">Done</span>
                  <span className="font-mono text-[11px] text-zinc-500">8</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded border border-white/[0.06] bg-[#0E0F12] text-xs space-y-1">
                    <span className="text-zinc-400 font-medium block line-through">Schema migration runner</span>
                    <span className="text-[10px] text-emerald-400 font-mono block">PIL-92 · Merged</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Precision Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-lg border border-white/[0.08] bg-[#0E0F12] space-y-3 hover:border-white/[0.16] transition-colors">
            <div className="w-8 h-8 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#818CF8]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-white">AI PRD Decomposition</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Transform product briefs into structured modules, story points, and dependency trees in seconds.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-white/[0.08] bg-[#0E0F12] space-y-3 hover:border-white/[0.16] transition-colors">
            <div className="w-8 h-8 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#818CF8]">
              <GitBranch className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-white">ADRs & RFCs</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Living architecture decision records tightly coupled with your engineering backlog.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-white/[0.08] bg-[#0E0F12] space-y-3 hover:border-white/[0.16] transition-colors">
            <div className="w-8 h-8 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#818CF8]">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-white">Cycles & Real-Time Sync</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sprint velocity tracking, burndown projections, and live multi-user collaboration presence.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 px-6 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Pillar Software Inc. · Built for high-velocity teams.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
