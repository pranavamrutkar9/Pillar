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
    <div className="space-y-6 max-w-5xl font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-[#818CF8]" />
            <h1 className="text-xl font-semibold tracking-tight text-white">Cycles</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Time-box your team's engineering velocity with fixed iterations and clean burndown metrics.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="linear-btn-primary shadow-linear-glow text-xs"
          >
            {isCreating ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> <span>New Cycle</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl border border-white/[0.1] bg-[#141519] shadow-linear-card space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Schedule New Cycle</h3>
            <p className="text-[11px] text-zinc-400">Define the duration and cadence for the upcoming cycle.</p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-300">Cycle Name</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="linear-input w-full text-xs" 
                placeholder="e.g. Cycle 15 — Core Infrastructure"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-300">Start Date</label>
              <input 
                type="date" 
                required 
                value={formData.startsAt} 
                onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                className="linear-input w-full text-xs" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-300">End Date</label>
              <input 
                type="date" 
                required 
                value={formData.endsAt} 
                onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                className="linear-input w-full text-xs" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)} 
              className="linear-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="linear-btn-primary shadow-linear-glow text-xs disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Create Cycle"}
            </button>
          </div>
        </form>
      )}

      {/* Active Cycle Hero Card */}
      {activeCycle && (
        <div className="p-5 rounded-xl border border-white/[0.1] bg-[#111215] shadow-linear-card">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
              <span className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
                Current Active Cycle
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              {format(new Date(activeCycle.startsAt), 'MMM d')} – {format(new Date(activeCycle.endsAt), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link 
                href={`/projects/${project.id}/cycles/${activeCycle.id}`}
                className="text-lg font-semibold text-white hover:text-zinc-200 tracking-tight"
              >
                {activeCycle.name}
              </Link>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activeCycle._count?.issues ?? activeCycle.issues?.length ?? 0} active tickets in this cycle
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {!isViewer && (
                <button 
                  onClick={() => handleComplete(activeCycle.id)}
                  className="linear-btn-secondary text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Complete Cycle</span>
                </button>
              )}
              <Link 
                href={`/projects/${project.id}/cycles/${activeCycle.id}`}
                className="linear-btn-primary text-xs"
              >
                <span>View Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cycle List */}
      <div className="space-y-3">
        {cycles.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/[0.08] rounded-xl bg-[#0D0E11] space-y-2">
            <Repeat className="w-8 h-8 text-zinc-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-zinc-300">No cycles planned</p>
            <p className="text-xs text-zinc-500">Create your first cycle to structure tasks into time-boxed sprints.</p>
          </div>
        ) : (
          <div className="border border-white/[0.08] rounded-xl bg-[#0D0E11] overflow-hidden shadow-linear-card">
            <div className="px-4 py-2.5 bg-[#0B0C0E] border-b border-white/[0.06] text-[11px] font-mono text-zinc-400">
              ALL CYCLES ({cycles.length})
            </div>
            <ul className="divide-y divide-white/[0.04]">
              {cycles.map(cycle => {
                const isActive = cycle.status === "ACTIVE";
                const isCompleted = cycle.status === "COMPLETED";
                const isPlanned = cycle.status === "PLANNED";
                
                return (
                  <li 
                    key={cycle.id} 
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isActive ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' :
                        isCompleted ? 'bg-zinc-600' :
                        'bg-blue-400'
                      }`} />
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/projects/${project.id}/cycles/${cycle.id}`}
                            className="text-sm font-medium text-white hover:text-zinc-200"
                          >
                            {cycle.name}
                          </Link>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            isCompleted ? 'bg-white/[0.04] text-zinc-500 border-white/[0.06]' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
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
                          className="linear-btn-secondary text-xs flex items-center gap-1.5"
                        >
                          <Play className="w-3 h-3 text-blue-400" />
                          <span>Start</span>
                        </button>
                      )}
                      {!isViewer && isActive && (
                        <button 
                          onClick={() => handleComplete(cycle.id)}
                          className="linear-btn-secondary text-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Complete</span>
                        </button>
                      )}
                      <Link 
                        href={`/projects/${project.id}/cycles/${cycle.id}`}
                        className="linear-btn-secondary text-xs flex items-center gap-1"
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
