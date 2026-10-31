"use client";

import { useState } from "react";
import { createAdrAction } from "../actions/adrActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, ArrowRight, User } from "lucide-react";

export default function ClientAdrsPage({ project, initialAdrs, isViewer }: { project: any, initialAdrs: any[], isViewer: boolean }) {
  const [adrs, setAdrs] = useState(initialAdrs);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", context: "", decision: "", alternatives: "", consequences: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
      setError(err.message || "Failed to create ADR");
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
            <BookOpen className="w-5 h-5 text-zinc-500" />
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Architecture Decision Records
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Capture and preserve architectural choices, trade-offs, and historical context for {project.name}.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs"
          >
            {isCreating ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> <span>New ADR</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && !isViewer && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Draft Architecture Record</h3>
            <p className="text-xs text-zinc-500">Document the technical rationale and implications of this decision.</p>
          </div>
          
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. ADR-01: Adopt Redis Streams for Event Sourcing"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Context & Problem Statement</label>
              <textarea 
                required 
                placeholder="What forces or constraints are driving this architecture decision?"
                rows={2}
                value={formData.context} 
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Decision</label>
              <textarea 
                required 
                placeholder="What is the chosen approach and proposed architectural change?"
                rows={2}
                value={formData.decision} 
                onChange={e => setFormData({ ...formData, decision: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Alternatives Considered</label>
                <textarea 
                  placeholder="What other patterns or technologies were evaluated?"
                  rows={2}
                  value={formData.alternatives} 
                  onChange={e => setFormData({ ...formData, alternatives: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Consequences & Trade-offs</label>
                <textarea 
                  placeholder="What are the downstream effects, risks, and operational trade-offs?"
                  rows={2}
                  value={formData.consequences} 
                  onChange={e => setFormData({ ...formData, consequences: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
                />
              </div>
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
              disabled={loading || !formData.title.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit ADR"}
            </button>
          </div>
        </form>
      )}

      {/* ADR List */}
      {adrs.length === 0 ? (
        <div className="p-12 text-center border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950">
          <BookOpen className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No ADRs recorded</p>
          <p className="text-xs text-zinc-500 mt-0.5">Document key architectural patterns, database schemas, and protocols here.</p>
        </div>
      ) : (
        <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs">
          <div className="px-4 py-2.5 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-400">
            DECISION LOG ({adrs.length})
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {adrs.map(adr => {
              const isAccepted = adr.status === "ACCEPTED";
              const isProposed = adr.status === "PROPOSED";
              const isDeprecated = adr.status === "DEPRECATED";
              
              return (
                <li 
                  key={adr.id} 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <Link 
                        href={`/projects/${project.id}/adrs/${adr.id}`} 
                        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline truncate"
                      >
                        {adr.title}
                      </Link>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${
                        isAccepted ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40' :
                        isProposed ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200/60 dark:border-sky-900/40' :
                        isDeprecated ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border-red-200/60 dark:border-red-900/40' :
                        'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200/60'
                      }`}>
                        {adr.status}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 flex items-center gap-2">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                        {adr.author?.username || adr.author?.email || 'Engineering Team'}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{format(new Date(adr.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-auto">
                    <Link 
                      href={`/projects/${project.id}/adrs/${adr.id}`} 
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-2xs"
                    >
                      <span>Read Record</span>
                      <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

    </div>
  );
}
