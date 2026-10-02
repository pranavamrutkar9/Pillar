"use client";

import { useState } from "react";
import { createAdrAction } from "../actions/adrActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { BookOpenIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function ClientAdrsPage({ project, initialAdrs, isViewer }: { project: any, initialAdrs: any[], isViewer: boolean }) {
  const [adrs, setAdrs] = useState(initialAdrs);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", context: "", decision: "", alternatives: "", consequences: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const newAdr = await createAdrAction(project.id, {
        title: formData.title,
        context: formData.context,
        decision: formData.decision,
        alternatives: formData.alternatives,
        consequences: formData.consequences,
      });
      setAdrs([newAdr, ...adrs]);
      setIsCreating(false);
      setFormData({ title: "", context: "", decision: "", alternatives: "", consequences: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpenIcon className="w-6 h-6 text-zinc-500" />
            Architecture Decision Records
          </h1>
          <p className="text-zinc-500 mt-1">Document important architectural decisions for {project.name}.</p>
        </div>
        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
          >
            {isCreating ? "Cancel" : <><PlusIcon className="w-4 h-4" /> New ADR</>}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isCreating && !isViewer && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">Propose New ADR</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Use Next.js for the frontend"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Context</label>
              <textarea 
                required 
                placeholder="What is the problem or background?"
                rows={3}
                value={formData.context} 
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Decision</label>
              <textarea 
                required 
                placeholder="What is the proposed change?"
                rows={3}
                value={formData.decision} 
                onChange={e => setFormData({ ...formData, decision: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alternatives (Optional)</label>
                <textarea 
                  placeholder="What else was considered?"
                  rows={2}
                  value={formData.alternatives} 
                  onChange={e => setFormData({ ...formData, alternatives: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Consequences (Optional)</label>
                <textarea 
                  placeholder="What happens if we do this?"
                  rows={2}
                  value={formData.consequences} 
                  onChange={e => setFormData({ ...formData, consequences: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Submit ADR
            </button>
          </div>
        </form>
      )}

      {adrs.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <BookOpenIcon className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No ADRs found</p>
          <p className="mt-1">Document important architectural decisions here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {adrs.map(adr => {
            const isAccepted = adr.status === "ACCEPTED";
            const isProposed = adr.status === "PROPOSED";
            const isDeprecated = adr.status === "DEPRECATED";
            const isSuperseded = adr.status === "SUPERSEDED";
            
            return (
              <div key={adr.id} className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-900 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Link href={`/projects/${project.id}/adrs/${adr.id}`} className="text-lg font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 truncate">
                      {adr.title}
                    </Link>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      isAccepted ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                      isProposed ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                      isDeprecated ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                      'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {adr.status}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-500 flex items-center gap-2">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{adr.author?.username || 'Unknown'}</span>
                    <span>•</span>
                    <span>Created {format(new Date(adr.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link href={`/projects/${project.id}/adrs/${adr.id}`} className="inline-flex items-center justify-center px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    View Details
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
