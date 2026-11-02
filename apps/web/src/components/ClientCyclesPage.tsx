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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-[#121212]">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-[#1976D2]" />
            <h1 className="text-xl font-black uppercase tracking-tight text-[#121212] dark:text-white">
              ITERATION CYCLES
            </h1>
          </div>
          <p className="text-xs font-mono uppercase text-neutral-500 mt-1">
            Time-boxed engineering sprints with automated burndown metrics and delivery cadence.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider bg-[#1976D2] hover:bg-[#0D47A1] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212] transition-all"
          >
            {isCreating ? "CANCEL" : <><Plus className="w-3.5 h-3.5" /> <span>SCHEDULE CYCLE</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-6 border-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[6px_6px_0px_#121212] space-y-4">
          <div className="border-b-2 border-[#121212] pb-2">
            <h3 className="text-sm font-black uppercase text-[#121212] dark:text-white">SCHEDULE NEW ITERATION</h3>
            <p className="text-xs font-mono uppercase text-neutral-500">Define velocity cadence and delivery dates.</p>
          </div>

          {error && (
            <div className="p-3 bg-[#D32F2F] text-white border-2 border-[#121212] text-xs font-black uppercase">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-black uppercase text-[#121212] dark:text-white mb-1">CYCLE NAME</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-[#121212] bg-[#FAF6EE] text-[#121212] focus:outline-none focus:border-[#1976D2]" 
                placeholder="e.g. Sprint 14: Engine Refactor"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#121212] dark:text-white mb-1">START DATE</label>
              <input 
                type="date" 
                required 
                value={formData.startsAt} 
                onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-[#121212] bg-[#FAF6EE] text-[#121212] focus:outline-none focus:border-[#1976D2]" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#121212] dark:text-white mb-1">END DATE</label>
              <input 
                type="date" 
                required 
                value={formData.endsAt} 
                onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-[#121212] bg-[#FAF6EE] text-[#121212] focus:outline-none focus:border-[#1976D2]" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#121212]">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)} 
              className="px-4 py-1.5 text-xs font-black uppercase border-2 border-[#121212] hover:bg-[#FAF6EE]"
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-1.5 text-xs font-black uppercase bg-[#1976D2] hover:bg-[#0D47A1] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212]"
            >
              {loading ? "SCHEDULING..." : "COMMIT CYCLE"}
            </button>
          </div>
        </form>
      )}

      {/* Active Cycle Hero Card */}
      {activeCycle && (
        <div className="p-6 border-3 border-[#121212] dark:border-white bg-[#FBC02D] text-[#121212] shadow-[6px_6px_0px_#121212]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#121212]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#D32F2F] inline-block border border-[#121212]" />
              <span className="text-xs font-black uppercase tracking-wider">
                CURRENT ACTIVE ITERATION
              </span>
            </div>
            <span className="text-xs font-mono font-bold uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(activeCycle.startsAt), 'MMM d')} – {format(new Date(activeCycle.endsAt), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link 
                href={`/projects/${project.id}/cycles/${activeCycle.id}`}
                className="text-xl font-black uppercase hover:underline tracking-tight"
              >
                {activeCycle.name}
              </Link>
              <p className="text-xs font-mono font-bold uppercase mt-1">
                {activeCycle._count?.issues ?? activeCycle.issues?.length ?? 0} ACTIVE TICKETS ALLOCATED
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isViewer && (
                <button 
                  onClick={() => handleComplete(activeCycle.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase bg-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212] hover:bg-[#FAF6EE] transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>COMPLETE ITERATION</span>
                </button>
              )}
              <Link 
                href={`/projects/${project.id}/cycles/${activeCycle.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black uppercase bg-[#121212] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212] hover:bg-neutral-800 transition-all"
              >
                <span>OPEN SPRINT BOARD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Planned Cycles */}
      {upcomingCycles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#121212] dark:text-white flex items-center gap-2 border-b-2 border-[#121212] pb-1.5">
            <span className="w-2.5 h-2.5 bg-[#1976D2] inline-block" />
            <span>UPCOMING ITERATIONS ({upcomingCycles.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingCycles.map((cycle) => (
              <div 
                key={cycle.id}
                className="p-4 border-2 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[3px_3px_0px_#121212] flex flex-col justify-between gap-3"
              >
                <div>
                  <h3 className="font-black text-sm uppercase text-[#121212] dark:text-white">{cycle.name}</h3>
                  <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase mt-0.5">
                    {format(new Date(cycle.startsAt), 'MMM d')} – {format(new Date(cycle.endsAt), 'MMM d, yyyy')}
                  </p>
                </div>
                {!isViewer && (
                  <button
                    onClick={() => handleStart(cycle.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-[#1976D2] hover:bg-[#0D47A1] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#121212]"
                  >
                    <Play className="w-3 h-3" />
                    <span>ACTIVATE SPRINT</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Cycles */}
      {completedCycles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#121212] dark:text-white flex items-center gap-2 border-b-2 border-[#121212] pb-1.5">
            <span className="w-2.5 h-2.5 bg-[#D32F2F] inline-block" />
            <span>CONCLUDED ITERATIONS ({completedCycles.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completedCycles.map((cycle) => (
              <div 
                key={cycle.id}
                className="p-4 border-2 border-[#121212] dark:border-white bg-[#FAF6EE] dark:bg-[#181A20] flex flex-col justify-between gap-3"
              >
                <div>
                  <h3 className="font-black text-sm uppercase text-[#121212] dark:text-white">{cycle.name}</h3>
                  <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase mt-0.5">
                    CONCLUDED // {format(new Date(cycle.endsAt), 'yyyy-MM-dd')}
                  </p>
                </div>
                <Link
                  href={`/projects/${project.id}/cycles/${cycle.id}`}
                  className="text-xs font-black uppercase text-[#1976D2] hover:underline"
                >
                  VIEW BURNDOWN METRICS →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
