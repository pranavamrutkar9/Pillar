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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-zinc-500" />
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Cycles</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Time-box your team's engineering velocity with fixed iterations and clean burndown metrics.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs"
          >
            {isCreating ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> <span>New Cycle</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Schedule New Cycle</h3>
            <p className="text-xs text-zinc-500">Define the duration and cadence for the upcoming cycle.</p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cycle Name</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
                placeholder="e.g. Cycle 15 — Core Infrastructure"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Date</label>
              <input 
                type="date" 
                required 
                value={formData.startsAt} 
                onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">End Date</label>
              <input 
                type="date" 
                required 
                value={formData.endsAt} 
                onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)} 
              className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Create Cycle"}
            </button>
          </div>
        </form>
      )}

      {/* Active Cycle Hero Card */}
      {activeCycle && (
        <div className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Current Active Cycle
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(activeCycle.startsAt), 'MMM d')} – {format(new Date(activeCycle.endsAt), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link 
                href={`/projects/${project.id}/cycles/${activeCycle.id}`}
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:underline tracking-tight"
              >
                {activeCycle.name}
              </Link>
              <p className="text-xs text-zinc-500 mt-0.5">
                {activeCycle._count?.issues ?? activeCycle.issues?.length ?? 0} active tickets in this cycle
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isViewer && (
                <button 
                  onClick={() => handleComplete(activeCycle.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Complete Cycle</span>
                </button>
              )}
              <Link 
                href={`/projects/${project.id}/cycles/${activeCycle.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
              >
                <span>View Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cycle List */}
      <div className="space-y-4">
        {cycles.length === 0 ? (
          <div className="p-12 text-center border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950">
            <Repeat className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No cycles planned</p>
            <p className="text-xs text-zinc-500 mt-0.5">Create your first cycle to structure tasks into time-boxed sprints.</p>
          </div>
        ) : (
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-400">
              ALL CYCLES ({cycles.length})
            </div>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {cycles.map(cycle => {
                const isActive = cycle.status === "ACTIVE";
                const isCompleted = cycle.status === "COMPLETED";
                const isPlanned = cycle.status === "PLANNED";
                
                return (
                  <li 
                    key={cycle.id} 
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isActive ? 'bg-emerald-500' :
                        isCompleted ? 'bg-zinc-400' :
                        'bg-sky-500'
                      }`} />
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/projects/${project.id}/cycles/${cycle.id}`}
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                          >
                            {cycle.name}
                          </Link>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40' :
                            isCompleted ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-700/60' :
                            'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200/60 dark:border-sky-900/40'
                          }`}>
                            {cycle.status}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400 mt-0.5 font-mono">
                          {format(new Date(cycle.startsAt), 'MMM d')} – {format(new Date(cycle.endsAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!isViewer && isPlanned && !activeCycle && (
                        <button 
                          onClick={() => handleStart(cycle.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40 rounded-lg hover:bg-sky-100 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start</span>
                        </button>
                      )}
                      {!isViewer && isActive && (
                        <button 
                          onClick={() => handleComplete(cycle.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      )}
                      <Link 
                        href={`/projects/${project.id}/cycles/${cycle.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <span>Board</span>
                        <ArrowRight className="w-3 h-3" />
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
