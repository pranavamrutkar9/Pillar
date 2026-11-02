"use client";

import { useState } from "react";
import { createAdrAction } from "../actions/adrActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, ArrowRight } from "lucide-react";

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
    <div className="space-y-6 max-w-5xl font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-[#121212]">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D32F2F]" />
            <h1 className="text-xl font-black uppercase tracking-tight text-[#121212] dark:text-white">
              ARCHITECTURE DECISION RECORDS
            </h1>
          </div>
          <p className="text-xs font-mono uppercase text-neutral-500 mt-1">
            Capture and preserve architectural choices, trade-offs, and historical context for {project.name}.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider bg-[#D32F2F] hover:bg-[#B71C1C] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212] transition-all"
          >
            {isCreating ? "CANCEL" : <><Plus className="w-3.5 h-3.5" /> <span>RECORD DECISION</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-6 border-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[6px_6px_0px_#121212] space-y-4">
          <div className="border-b-2 border-[#121212] pb-2">
            <h3 className="text-sm font-black uppercase text-[#121212] dark:text-white">DOCUMENT ARCHITECTURAL DECISION</h3>
            <p className="text-xs font-mono uppercase text-neutral-500">Structured template for consensus, alternatives, and consequences.</p>
          </div>

          {error && (
            <div className="p-3 bg-[#D32F2F] text-white border-2 border-[#121212] text-xs font-black uppercase">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-black uppercase text-[#121212] dark:text-white mb-1">DECISION TITLE</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. ADR-004: ADOPT REDIS AS THE PRIMARY MESSAGE BROKER"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-[#121212] bg-[#FAF6EE] text-[#121212] focus:outline-none focus:border-[#D32F2F]" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#121212] dark:text-white mb-1">CONTEXT &amp; MOTIVATION</label>
              <textarea 
                required 
                rows={3}
                placeholder="What architectural problem forces this decision? What constraints exist?"
                value={formData.context} 
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-[#121212] bg-[#FAF6EE] text-[#121212] focus:outline-none focus:border-[#D32F2F]" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#121212] dark:text-white mb-1">DECISION &amp; PATTERN</label>
              <textarea 
                required 
                rows={3}
                placeholder="The selected architectural pattern and system change..."
                value={formData.decision} 
                onChange={e => setFormData({ ...formData, decision: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-[#121212] bg-[#FAF6EE] text-[#121212] focus:outline-none focus:border-[#D32F2F]" 
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
              className="px-5 py-1.5 text-xs font-black uppercase bg-[#D32F2F] hover:bg-[#B71C1C] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212]"
            >
              {loading ? "RECORDING..." : "COMMIT ADR"}
            </button>
          </div>
        </form>
      )}

      {/* ADRs List */}
      <div className="space-y-3">
        {adrs.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[#121212] dark:border-white bg-white dark:bg-[#181A20]">
            <BookOpen className="w-8 h-8 text-[#D32F2F] mx-auto mb-2" />
            <p className="text-sm font-black uppercase">NO ARCHITECTURE DECISION RECORDS</p>
            <p className="text-xs font-mono uppercase text-neutral-500 mt-1">Preserve architectural rationale for the codebase.</p>
          </div>
        ) : (
          adrs.map((adr, idx) => {
            const isAccepted = adr.status === "ACCEPTED";
            const isProposed = adr.status === "PROPOSED";
            const isDeprecated = adr.status === "DEPRECATED";

            return (
              <Link 
                key={adr.id} 
                href={`/projects/${project.id}/adrs/${adr.id}`}
                className="group p-5 border-2 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[4px_4px_0px_#121212] dark:shadow-[4px_4px_0px_#FFF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#121212] transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 border border-[#121212] uppercase ${
                      isAccepted ? 'bg-emerald-600 text-white' :
                      isProposed ? 'bg-[#1976D2] text-white' :
                      isDeprecated ? 'bg-[#D32F2F] text-white' :
                      'bg-[#FAF6EE] text-[#121212]'
                    }`}>
                      {adr.status}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">
                      RECORD // {format(new Date(adr.createdAt), "yyyy-MM-dd")}
                    </span>
                  </div>
                  <h3 className="text-sm font-black uppercase text-[#121212] dark:text-white group-hover:text-[#D32F2F] transition-colors">
                    {adr.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-black uppercase text-[#121212] dark:text-white shrink-0">
                  <span>EXAMINE RATIONALE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })
        )}
      </div>

    </div>
  );
}
