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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-zinc-500" />
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Modules</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Group issues into core architectural modules and feature epics for clear scope boundaries.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs"
          >
            {isCreating ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> <span>New Module</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create Feature Module</h3>
            <p className="text-xs text-zinc-500">Define a cohesive functional component of your application.</p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Module Name</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
                placeholder="e.g. Authentication & RBAC"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description (Optional)</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
                placeholder="Scope, dependencies, or architectural considerations..."
                rows={2}
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
              disabled={loading || !formData.name.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Module"}
            </button>
          </div>
        </form>
      )}

      {/* Modules Grid */}
      {modules.length === 0 ? (
        <div className="p-12 text-center border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950">
          <FolderKanban className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No modules created</p>
          <p className="text-xs text-zinc-500 mt-0.5">Organize issues into domain boundaries and feature areas.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map(mod => {
            return (
              <div 
                key={mod.id} 
                className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Link 
                      href={`/projects/${project.id}/modules/${mod.id}`} 
                      className="text-base font-semibold text-zinc-900 dark:text-zinc-100 hover:underline tracking-tight"
                    >
                      {mod.name}
                    </Link>
                  </div>
                  {mod.description ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                      {mod.description}
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400 italic mb-4">No description provided.</p>
                  )}
                </div>
                
                <div className="pt-3 mt-auto border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono text-[11px]">
                    Created {new Date(mod.createdAt).toLocaleDateString()}
                  </span>
                  <Link 
                    href={`/projects/${project.id}/modules/${mod.id}`}
                    className="inline-flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors"
                  >
                    <span>View Issues</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
