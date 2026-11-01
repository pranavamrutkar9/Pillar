import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowRight, Circle, Square, Triangle } from "lucide-react";
import AuthButtons from "@/components/AuthButtons";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-[#FAF6EE] font-sans selection:bg-[#FBC02D] selection:text-[#121212]">
      {/* Bauhaus Top Triad Header */}
      <div className="border-b-3 border-[#121212] dark:border-white bg-[#121212] text-white px-6 py-2 flex items-center justify-between text-xs font-black uppercase tracking-widest">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#D32F2F] inline-block" />
          <span className="w-3 h-3 bg-[#1976D2] inline-block" />
          <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-bottom-[12px] border-b-[#FBC02D] inline-block" />
          <span>BAUHAUS DESSAU // FORM FOLLOWS FUNCTION</span>
        </div>
        <span className="font-mono hidden sm:inline">WEIMAR · DESSAU · BERLIN</span>
      </div>

      {/* Navigation */}
      <header className="border-b-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D32F2F] border-2 border-[#121212] flex items-center justify-center text-white font-black text-lg shadow-[2px_2px_0px_#121212]">
              P
            </div>
            <div className="text-xl font-black uppercase tracking-wider">
              PILLAR<span className="text-[#1976D2]">.BAUHAUS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/workspaces"
                  className="px-5 py-2.5 bg-[#FBC02D] hover:bg-[#F9A825] text-[#121212] border-2 border-[#121212] font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#121212] transition-all"
                >
                  ENTER WORKSPACE →
                </Link>
                <AuthButtons />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth"
                  className="px-4 py-2 border-2 border-[#121212] dark:border-white font-black text-xs uppercase tracking-wider hover:bg-[#121212] hover:text-white transition-all"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/auth"
                  className="px-5 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#121212] transition-all"
                >
                  JOIN WORKSPACE [→]
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Constructivist Composition */}
      <main className="max-w-7xl mx-auto px-6 py-14 space-y-14">
        <div className="border-4 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[8px_8px_0px_#121212] dark:shadow-[8px_8px_0px_#FFF] overflow-hidden">
          
          {/* Bauhaus Color Strip Header */}
          <div className="grid grid-cols-3 h-3 border-b-3 border-[#121212]">
            <div className="bg-[#D32F2F]" />
            <div className="bg-[#1976D2]" />
            <div className="bg-[#FBC02D]" />
          </div>

          <div className="p-8 md:p-14 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1976D2] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-wider">
              <span>ART &amp; TECHNOLOGY · A NEW UNITY</span>
            </div>

            <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tight leading-[0.95]">
              FUNCTIONAL
              <br />
              STRUCTURE.
              <br />
              <span className="text-[#D32F2F]">PURE PURPOSE.</span>
            </h1>

            <p className="text-base text-neutral-800 dark:text-neutral-200 max-w-2xl leading-relaxed">
              Pillar distills project orchestration into essential primary geometries. Linear pipelines, automated requirement breakdown, and architectural certainty without superfluous decoration.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href={session ? "/workspaces" : "/auth"}
                className="px-8 py-3.5 bg-[#D32F2F] text-white hover:bg-[#B71C1C] border-3 border-[#121212] font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_#121212] transition-all"
              >
                OPEN WORKSPACE [→]
              </Link>
              <Link
                href="/workspaces"
                className="px-8 py-3.5 bg-[#FBC02D] text-[#121212] hover:bg-[#F9A825] border-3 border-[#121212] font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_#121212] transition-all"
              >
                EXPLORE PROJECTS
              </Link>
            </div>
          </div>
        </div>

        {/* Primary Triad Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Red Circle */}
          <div className="border-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[5px_5px_0px_#121212] space-y-4 overflow-hidden">
            <div className="bg-[#D32F2F] text-white p-4 border-b-3 border-[#121212] flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-widest">FORM 01 · CIRCLE</span>
              <div className="w-5 h-5 rounded-full bg-white border border-[#121212]" />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-black uppercase">PRD DECOMPOSITION</h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Automated architectural analysis transforms raw requirements into cohesive module spheres and dependency cycles.
              </p>
            </div>
          </div>

          {/* Card 2: Blue Square */}
          <div className="border-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[5px_5px_0px_#121212] space-y-4 overflow-hidden">
            <div className="bg-[#1976D2] text-white p-4 border-b-3 border-[#121212] flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-widest">FORM 02 · SQUARE</span>
              <div className="w-5 h-5 bg-white border border-[#121212]" />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-black uppercase">ADRS &amp; RFCS</h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Rigid rectangular architecture records ensuring technical decisions are formalized and immutable across sprints.
              </p>
            </div>
          </div>

          {/* Card 3: Yellow Triangle */}
          <div className="border-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[5px_5px_0px_#121212] space-y-4 overflow-hidden">
            <div className="bg-[#FBC02D] text-[#121212] p-4 border-b-3 border-[#121212] flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-widest">FORM 03 · TRIANGLE</span>
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-[#121212]" />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-black uppercase">VELOCITY CADENCE</h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Dynamic triangular burndown metrics providing real-time trajectory projections for engineering delivery.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bauhaus Footer */}
      <footer className="border-t-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F]" />
            <span>PILLAR // BAUHAUS FOUNDATION</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#D32F2F]">Gropius</a>
            <a href="#" className="hover:text-[#1976D2]">Kandinsky</a>
            <a href="#" className="hover:text-[#FBC02D]">Bayer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
