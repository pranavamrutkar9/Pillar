"use client";

import { useState } from "react";
import { createCycleAction, startCycleAction, completeCycleAction } from "../actions/cycleActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function ClientCyclesPage({ project, initialCycles, isViewer }: { project: any, initialCycles: any[], isViewer: boolean }) {
  const [cycles, setCycles] = useState(initialCycles);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", startsAt: "", endsAt: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
      setError(err.message);
    }
  };

  const handleStart = async (cycleId: string) => {
    try {
      await startCycleAction(project.id, cycleId);
      router.refresh();
      // Optimistic update
      setCycles(current => current.map(c => c.id === cycleId ? { ...c, status: "ACTIVE" } : c));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleComplete = async (cycleId: string) => {
    try {
      await completeCycleAction(project.id, cycleId);
      router.refresh();
      // Optimistic update
      setCycles(current => current.map(c => c.id === cycleId ? { ...c, status: "COMPLETED" } : c));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const activeCycle = cycles.find(c => c.status === "ACTIVE");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cycles</h2>
        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {isCreating ? "Cancel" : "New Cycle"}
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-lg space-y-4 shadow-sm">
          <h3 className="font-semibold text-lg">Create New Cycle</h3>
          {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950" 
                placeholder="e.g. Cycle 42"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Date</label>
              <input 
                type="date" 
                required 
                value={formData.startsAt} 
                onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">End Date</label>
              <input 
                type="date" 
                required 
                value={formData.endsAt} 
                onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950" 
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              Create Cycle
            </button>
          </div>
        </form>
      )}

      {cycles.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          No cycles found. Cycles help you time-box your team's work.
        </div>
      ) : (
        <div className="grid gap-4">
          {cycles.map(cycle => {
            const isActive = cycle.status === "ACTIVE";
            const isCompleted = cycle.status === "COMPLETED";
            const isPlanned = cycle.status === "PLANNED";
            
            return (
              <div key={cycle.id} className={`p-5 rounded-lg border ${isActive ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-sm`}>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Link href={`/projects/${project.id}/cycles/${cycle.id}`} className="text-lg font-bold hover:underline">
                      {cycle.name}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                      isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {cycle.status}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {format(new Date(cycle.startsAt), 'MMM d')} - {format(new Date(cycle.endsAt), 'MMM d, yyyy')}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {!isViewer && isPlanned && !activeCycle && (
                    <button 
                      onClick={() => handleStart(cycle.id)}
                      className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded transition-colors"
                    >
                      Start Cycle
                    </button>
                  )}
                  {!isViewer && isActive && (
                    <button 
                      onClick={() => handleComplete(cycle.id)}
                      className="px-3 py-1.5 text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded transition-colors"
                    >
                      Complete Cycle
                    </button>
                  )}
                  <Link 
                    href={`/projects/${project.id}/cycles/${cycle.id}`}
                    className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                  >
                    View Board &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
