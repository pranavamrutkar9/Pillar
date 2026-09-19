"use client";

import { useState } from "react";
import { createModuleAction } from "../actions/moduleActions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientModulesPage({ project, initialModules, isViewer }: { project: any, initialModules: any[], isViewer: boolean }) {
  const [modules, setModules] = useState(initialModules);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Modules</h2>
        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {isCreating ? "Cancel" : "New Module"}
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-lg space-y-4 shadow-sm">
          <h3 className="font-semibold text-lg">Create New Module</h3>
          {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950" 
                placeholder="e.g. User Authentication"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description (Optional)</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950" 
                placeholder="Brief overview of this feature..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              Create Module
            </button>
          </div>
        </form>
      )}

      {modules.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          No modules found. Modules help group issues by feature or epic.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map(mod => {
            return (
              <div key={mod.id} className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <Link href={`/projects/${project.id}/modules/${mod.id}`} className="text-lg font-bold hover:underline mb-2 block">
                    {mod.name}
                  </Link>
                  {mod.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
                      {mod.description}
                    </p>
                  )}
                </div>
                
                <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs text-zinc-500">Created {new Date(mod.createdAt).toLocaleDateString()}</span>
                  <Link 
                    href={`/projects/${project.id}/modules/${mod.id}`}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Issues &rarr;
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
