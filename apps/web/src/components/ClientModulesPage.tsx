"use client";

import { useState } from "react";
import { createModuleAction } from "../actions/moduleActions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Plus, ArrowRight, FolderKanban } from "lucide-react";

export default function ClientModulesPage({ project, initialModules, isViewer }: { project: any, initialModules: any[], isViewer: boolean }) {
  const [modules, setModules] = useState(initialModules);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const newModule = await createModuleAction(project.id, {
        name: formData.name,
        description: formData.description
      });
      setModules([...modules, newModule]);
      setIsCreating(false);
      setFormData({ name: "", description: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create module");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-black dark:border-white">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 stroke-[2.5]" />
            <h1 className="text-2xl font-black tracking-tight text-black dark:text-white uppercase">Modules</h1>
          </div>
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
            Group issues into core architectural modules and feature epics for clear scope boundaries.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            {isCreating ? "Cancel" : <><Plus className="w-4 h-4 stroke-[3]" /> <span>New Module</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl border-3 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase text-black dark:text-white">Create Feature Module</h3>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Define a cohesive functional component of your application.</p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] text-black dark:text-white text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Module Name</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
                placeholder="e.g. Authentication & RBAC"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Description (Optional)</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
                placeholder="Scope, dependencies, or architectural considerations..."
                rows={2}
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
              disabled={loading || !formData.name.trim()}
              className="px-5 py-2 rounded-xl text-xs font-black bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Module"}
            </button>
          </div>
        </form>
      )}

      {/* Modules Grid */}
      {modules.length === 0 ? (
        <div className="p-12 text-center border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
          <FolderKanban className="w-10 h-10 text-black dark:text-white mx-auto mb-2 stroke-[2]" />
          <p className="text-base font-black text-black dark:text-white">No modules created</p>
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1">Organize issues into domain boundaries and feature areas.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {modules.map(mod => {
            return (
              <div 
                key={mod.id} 
                className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Link 
                      href={`/projects/${project.id}/modules/${mod.id}`} 
                      className="text-lg font-black text-black dark:text-white hover:underline tracking-tight"
                    >
                      {mod.name}
                    </Link>
                  </div>
                  {mod.description ? (
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed mb-4">
                      {mod.description}
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400 italic mb-4">No description provided.</p>
                  )}
                </div>
                
                <div className="pt-3 mt-auto border-t-2 border-black dark:border-white flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-mono font-bold text-[11px]">
                    Created {new Date(mod.createdAt).toLocaleDateString()}
                  </span>
                  <Link 
                    href={`/projects/${project.id}/modules/${mod.id}`}
                    className="inline-flex items-center gap-1 font-black text-black dark:text-white hover:underline transition-colors"
                  >
                    <span>View Issues</span>
                    <ArrowRight className="w-4 h-4 stroke-[3] transition-transform group-hover:translate-x-1" />
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
