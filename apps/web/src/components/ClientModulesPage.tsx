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
    <div className="space-y-6 max-w-5xl font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#818CF8]" />
            <h1 className="text-xl font-semibold tracking-tight text-white">Modules</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Group issues into core architectural modules and feature epics for clear scope boundaries.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="linear-btn-primary shadow-linear-glow text-xs"
          >
            {isCreating ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> <span>New Module</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl border border-white/[0.1] bg-[#141519] shadow-linear-card space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Create Feature Module</h3>
            <p className="text-[11px] text-zinc-400">Define a cohesive functional component of your application.</p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-300">Module Name</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="linear-input w-full text-xs" 
                placeholder="e.g. Authentication & RBAC"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-300">Description (Optional)</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="linear-input w-full text-xs resize-none" 
                placeholder="Scope, dependencies, or architectural considerations..."
                rows={2}
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
              disabled={loading || !formData.name.trim()}
              className="linear-btn-primary shadow-linear-glow text-xs disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Module"}
            </button>
          </div>
        </form>
      )}

      {/* Modules Grid */}
      {modules.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/[0.08] rounded-xl bg-[#0D0E11] space-y-2">
          <FolderKanban className="w-8 h-8 text-zinc-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-zinc-300">No modules created</p>
          <p className="text-xs text-zinc-500">Organize issues into domain boundaries and feature areas.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map(mod => {
            return (
              <div 
                key={mod.id} 
                className="p-5 rounded-xl border border-white/[0.08] bg-[#111215] flex flex-col justify-between hover:border-white/[0.18] hover:bg-[#15171D] hover:shadow-linear-card transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Link 
                      href={`/projects/${project.id}/modules/${mod.id}`} 
                      className="text-base font-semibold text-white hover:text-[#818CF8] tracking-tight transition-colors"
                    >
                      {mod.name}
                    </Link>
                  </div>
                  {mod.description ? (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                      {mod.description}
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-600 italic mb-4">No description provided.</p>
                  )}
                </div>
                
                <div className="pt-3 mt-auto border-t border-white/[0.04] flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">
                    Created {new Date(mod.createdAt).toLocaleDateString()}
                  </span>
                  <Link 
                    href={`/projects/${project.id}/modules/${mod.id}`}
                    className="inline-flex items-center gap-1 font-medium text-zinc-400 group-hover:text-white transition-colors"
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
