"use client";

import { useState } from "react";
import { createModuleAction } from "../actions/moduleActions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Plus, ArrowRight } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-[#121212]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FBC02D]" />
            <h1 className="text-xl font-black uppercase tracking-tight text-[#121212] dark:text-white">
              ARCHITECTURAL MODULES
            </h1>
          </div>
          <p className="text-xs font-mono uppercase text-neutral-500 mt-1">
            Group issues into core architectural modules and feature epics for clear scope boundaries.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider bg-[#FBC02D] hover:bg-[#F9A825] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_#121212] transition-all"
          >
            {isCreating ? "CANCEL" : <><Plus className="w-3.5 h-3.5" /> <span>CREATE MODULE</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-6 border-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[6px_6px_0px_#121212] space-y-4">
          <div className="border-b-2 border-[#121212] pb-2">
            <h3 className="text-sm font-black uppercase text-[#121212] dark:text-white">INSTANTIATE NEW MODULE</h3>
            <p className="text-xs font-mono uppercase text-neutral-500">Define a cohesive functional component of your application.</p>
          </div>

          {error && (
            <div className="p-3 bg-[#D32F2F] text-white border-2 border-[#121212] text-xs font-black uppercase">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-black uppercase text-[#121212] dark:text-white mb-1">MODULE IDENTIFIER</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-[#121212] bg-[#FAF6EE] text-[#121212] focus:outline-none focus:border-[#1976D2]" 
                placeholder="e.g. AUTHENTICATION & SESSION ENGINE"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#121212] dark:text-white mb-1">ARCHITECTURAL SCOPE DESCRIPTION</label>
              <textarea 
                rows={3}
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-[#121212] bg-[#FAF6EE] text-[#121212] focus:outline-none focus:border-[#1976D2]" 
                placeholder="Responsibilities, interfaces, and boundary limits of this module..."
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
              className="px-5 py-1.5 text-xs font-black uppercase bg-[#FBC02D] hover:bg-[#F9A825] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_#121212]"
            >
              {loading ? "CREATING..." : "COMMIT MODULE"}
            </button>
          </div>
        </form>
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {modules.length === 0 ? (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-[#121212] dark:border-white bg-white dark:bg-[#181A20]">
            <Layers className="w-8 h-8 text-[#FBC02D] mx-auto mb-2" />
            <p className="text-sm font-black uppercase">NO MODULES ARCHITECTED YET</p>
            <p className="text-xs font-mono uppercase text-neutral-500 mt-1">Break your repository into functional epics.</p>
          </div>
        ) : (
          modules.map((module, idx) => (
            <Link 
              key={module.id} 
              href={`/projects/${project.id}/modules/${module.id}`}
              className="group p-5 border-2 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[4px_4px_0px_#121212] dark:shadow-[4px_4px_0px_#FFF] flex flex-col justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#121212] transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono font-black text-[#1976D2]">MOD // 0{idx + 1}</span>
                  <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-[#FAF6EE] text-[#121212] border border-[#121212]">
                    {module._count?.issues ?? module.issues?.length ?? 0} TICKETS
                  </span>
                </div>
                <h3 className="font-black text-sm uppercase text-[#121212] dark:text-white group-hover:text-[#D32F2F] transition-colors">
                  {module.name}
                </h3>
                {module.description && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                    {module.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-2 border-t-2 border-[#121212] flex items-center justify-between text-xs font-black uppercase text-[#121212] dark:text-white">
                <span>VIEW MODULE BOARD</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  );
}
