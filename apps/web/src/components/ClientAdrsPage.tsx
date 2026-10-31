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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-black dark:border-white">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
            <h1 className="text-2xl font-black tracking-tight text-black dark:text-white uppercase">
              Architecture Decision Records
            </h1>
          </div>
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
            Capture and preserve architectural choices, trade-offs, and historical context for {project.name}.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            {isCreating ? "Cancel" : <><Plus className="w-4 h-4 stroke-[3]" /> <span>New ADR</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && !isViewer && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl border-3 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase text-black dark:text-white">Draft Architecture Record</h3>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Document the technical rationale and implications of this decision.</p>
          </div>
          
          {error && (
            <div className="p-2.5 rounded-lg bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] text-black dark:text-white text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. ADR-01: Adopt Redis Streams for Event Sourcing"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Context & Problem Statement</label>
              <textarea 
                required 
                placeholder="What forces or constraints are driving this architecture decision?"
                rows={2}
                value={formData.context} 
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Decision</label>
              <textarea 
                required 
                placeholder="What is the chosen approach and proposed architectural change?"
                rows={2}
                value={formData.decision} 
                onChange={e => setFormData({ ...formData, decision: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Alternatives Considered</label>
                <textarea 
                  placeholder="What other patterns or technologies were evaluated?"
                  rows={2}
                  value={formData.alternatives} 
                  onChange={e => setFormData({ ...formData, alternatives: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Consequences & Trade-offs</label>
                <textarea 
                  placeholder="What are the downstream effects, risks, and operational trade-offs?"
                  rows={2}
                  value={formData.consequences} 
                  onChange={e => setFormData({ ...formData, consequences: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
                />
              </div>
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
              disabled={loading || !formData.title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-black bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Submitting..." : "Submit ADR"}
            </button>
          </div>
        </form>
      )}

      {/* ADR List */}
      {adrs.length === 0 ? (
        <div className="p-12 text-center border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
          <BookOpen className="w-10 h-10 text-black dark:text-white mx-auto mb-2 stroke-[2]" />
          <p className="text-base font-black text-black dark:text-white">No ADRs recorded</p>
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1">Document key architectural patterns, database schemas, and protocols here.</p>
        </div>
      ) : (
        <div className="border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
          <div className="px-5 py-3 bg-[#FFE600] border-b-2 border-black text-xs font-mono font-black text-black">
            DECISION LOG ({adrs.length})
          </div>
          <ul className="divide-y-2 divide-black/10 dark:divide-white/20 font-bold">
            {adrs.map(adr => {
              const isAccepted = adr.status === "ACCEPTED";
              const isProposed = adr.status === "PROPOSED";
              const isDeprecated = adr.status === "DEPRECATED";
              
              return (
                <li 
                  key={adr.id} 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FEF08A]/30 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <Link 
                        href={`/projects/${project.id}/adrs/${adr.id}`} 
                        className="text-sm font-black text-black dark:text-white hover:underline truncate"
                      >
                        {adr.title}
                      </Link>
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000] uppercase shrink-0 ${
                        isAccepted ? 'bg-[#4ADE80] text-black' :
                        isProposed ? 'bg-[#38BDF8] text-black' :
                        isDeprecated ? 'bg-[#FF6B6B] text-black' :
                        'bg-zinc-200 text-black'
                      }`}>
                        {adr.status}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-500 flex items-center gap-2 font-medium">
                      <span className="text-black dark:text-white font-bold">
                        {adr.author?.username || adr.author?.email || 'Engineering Team'}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{format(new Date(adr.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-auto">
                    <Link 
                      href={`/projects/${project.id}/adrs/${adr.id}`} 
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-xs font-black text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
                    >
                      <span>Read Record</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
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
