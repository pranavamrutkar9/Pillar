"use client";

import { useState } from "react";
import { createCycleAction, startCycleAction, completeCycleAction } from "../actions/cycleActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Repeat, Plus, Calendar, ArrowRight, CheckCircle2, Clock, Play } from "lucide-react";

export default function ClientCyclesPage({ project, initialCycles, isViewer }: { project: any, initialCycles: any[], isViewer: boolean }) {
  const [cycles, setCycles] = useState(initialCycles);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", startsAt: "", endsAt: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const newCycle = await createCycleAction(project.id, {
        name: formData.name,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString()
      });
      setCycles([...cycles, newCycle].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
      setIsCreating(false);
      setFormData({ name: "", startsAt: "", endsAt: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create cycle");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (cycleId: string) => {
    try {
      await startCycleAction(project.id, cycleId);
      router.refresh();
      setCycles(current => current.map(c => c.id === cycleId ? { ...c, status: "ACTIVE" } : c));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleComplete = async (cycleId: string) => {
    try {
      await completeCycleAction(project.id, cycleId);
      router.refresh();
      setCycles(current => current.map(c => c.id === cycleId ? { ...c, status: "COMPLETED" } : c));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const activeCycle = cycles.find(c => c.status === "ACTIVE");
  const upcomingCycles = cycles.filter(c => c.status === "PLANNED");
  const completedCycles = cycles.filter(c => c.status === "COMPLETED");

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-black dark:border-white">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="w-6 h-6 stroke-[2.5]" />
            <h1 className="text-2xl font-black tracking-tight text-black dark:text-white uppercase">Cycles</h1>
          </div>
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
            Time-box your team's engineering velocity with fixed iterations and clean burndown metrics.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            {isCreating ? "Cancel" : <><Plus className="w-4 h-4 stroke-[3]" /> <span>New Cycle</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl border-3 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase text-black dark:text-white">Schedule New Cycle</h3>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Define the duration and cadence for the upcoming cycle.</p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] text-black dark:text-white text-xs font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Cycle Name</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
                placeholder="e.g. Cycle 15 — Core Infrastructure"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Start Date</label>
              <input 
                type="date" 
                required 
                value={formData.startsAt} 
                onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">End Date</label>
              <input 
                type="date" 
                required 
                value={formData.endsAt} 
                onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)} 
              className="px-4 py-2 text-xs font-black text-black dark:text-white hover:underline cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-black bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Scheduling..." : "Create Cycle"}
            </button>
          </div>
        </form>
      )}

      {/* Active Cycle Hero Card */}
      {activeCycle && (
        <div className="p-6 rounded-2xl border-3 border-black dark:border-white bg-[#FFE600] text-black shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
              <span className="text-xs font-mono font-black uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                ACTIVE SPRINT
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_0px_#000]">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(activeCycle.startsAt), 'MMM d')} – {format(new Date(activeCycle.endsAt), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link 
                href={`/projects/${project.id}/cycles/${activeCycle.id}`}
                className="text-2xl font-black text-black hover:underline tracking-tight"
              >
                {activeCycle.name}
              </Link>
              <p className="text-xs font-bold text-black/80 mt-1">
                {activeCycle._count?.issues ?? activeCycle.issues?.length ?? 0} active tickets in this cycle
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {!isViewer && (
                <button 
                  onClick={() => handleComplete(activeCycle.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span>Complete Cycle</span>
                </button>
              )}
              <Link 
                href={`/projects/${project.id}/cycles/${activeCycle.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl bg-black text-white hover:bg-zinc-800 transition-all shadow-[2px_2px_0px_0px_#FFE600] hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <span>View Board</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cycle List */}
      <div className="space-y-4">
        {cycles.length === 0 ? (
          <div className="p-12 text-center border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
            <Repeat className="w-10 h-10 text-black dark:text-white mx-auto mb-2 stroke-[2]" />
            <p className="text-base font-black text-black dark:text-white">No cycles planned</p>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1">Create your first cycle to structure tasks into time-boxed sprints.</p>
          </div>
        ) : (
          <div className="border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
            <div className="px-5 py-3 bg-[#FFE600] border-b-2 border-black text-xs font-mono font-black text-black">
              ALL CYCLES ({cycles.length})
            </div>
            <ul className="divide-y-2 divide-black/10 dark:divide-white/20 font-bold">
              {cycles.map(cycle => {
                const isActive = cycle.status === "ACTIVE";
                const isCompleted = cycle.status === "COMPLETED";
                const isPlanned = cycle.status === "PLANNED";
                
                return (
                  <li 
                    key={cycle.id} 
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FEF08A]/30 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-3 h-3 rounded-full mt-1.5 shrink-0 border border-black ${
                        isActive ? 'bg-[#4ADE80]' :
                        isCompleted ? 'bg-zinc-400' :
                        'bg-[#38BDF8]'
                      }`} />
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/projects/${project.id}/cycles/${cycle.id}`}
                            className="text-sm font-black text-black dark:text-white hover:underline"
                          >
                            {cycle.name}
                          </Link>
                          <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000] ${
                            isActive ? 'bg-[#4ADE80] text-black' :
                            isCompleted ? 'bg-zinc-200 text-black' :
                            'bg-[#38BDF8] text-black'
                          }`}>
                            {cycle.status}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500 mt-0.5 font-mono font-bold">
                          {format(new Date(cycle.startsAt), 'MMM d')} – {format(new Date(cycle.endsAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!isViewer && isPlanned && !activeCycle && (
                        <button 
                          onClick={() => handleStart(cycle.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black text-black bg-[#38BDF8] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Start</span>
                        </button>
                      )}
                      {!isViewer && isActive && (
                        <button 
                          onClick={() => handleComplete(cycle.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black text-black bg-[#4ADE80] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Complete</span>
                        </button>
                      )}
                      <Link 
                        href={`/projects/${project.id}/cycles/${cycle.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black text-black dark:text-white bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
                      >
                        <span>Board</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}
