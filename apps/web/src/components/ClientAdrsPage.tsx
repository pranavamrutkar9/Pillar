"use client";

import { useState } from "react";
import { createAdrAction } from "../actions/adrActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, ArrowRight, User, CheckCircle2 } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#818CF8]" />
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Architecture Decision Records
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Capture and preserve architectural choices, trade-offs, and historical context for {project.name}.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="linear-btn-primary shadow-linear-glow text-xs"
          >
            {isCreating ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> <span>New ADR</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && !isViewer && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl border border-white/[0.1] bg-[#141519] shadow-linear-card space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Draft Architecture Record</h3>
            <p className="text-[11px] text-zinc-400">Document the technical rationale and implications of this decision.</p>
          </div>
          
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-300">Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. ADR-01: Adopt Redis Streams for Event Sourcing"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="linear-input w-full text-xs" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-300">Context & Problem Statement</label>
              <textarea 
                required 
                placeholder="What forces or constraints are driving this architecture decision?"
                rows={2}
                value={formData.context} 
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                className="linear-input w-full text-xs resize-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-300">Decision Outcome</label>
              <textarea 
                required 
                placeholder="What is the chosen solution and architectural contract?"
                rows={2}
                value={formData.decision} 
                onChange={e => setFormData({ ...formData, decision: e.target.value })}
                className="linear-input w-full text-xs resize-none" 
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
              disabled={loading || !formData.title.trim()}
              className="linear-btn-primary shadow-linear-glow text-xs disabled:opacity-50"
            >
              {loading ? "Recording..." : "Record Decision"}
            </button>
          </div>
        </form>
      )}

      {/* ADR Grid */}
      {adrs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/[0.08] rounded-xl bg-[#0D0E11] space-y-2">
          <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-zinc-300">No architecture decisions recorded</p>
          <p className="text-xs text-zinc-500">Document major technical trade-offs to retain context as the team scales.</p>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {adrs.map(adr => {
            const isAccepted = adr.status === 'ACCEPTED' || !adr.status;
            return (
              <div 
                key={adr.id} 
                className="p-5 rounded-xl border border-white/[0.08] bg-[#111215] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/[0.18] hover:bg-[#15171D] hover:shadow-linear-card transition-all group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-[#818CF8]">
                      ADR-{String(adr.sequenceId || 1).padStart(3, '0')}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <Link 
                      href={`/projects/${project.id}/adrs/${adr.id}`} 
                      className="text-sm font-medium text-white hover:text-[#818CF8] tracking-tight transition-colors"
                    >
                      {adr.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="font-mono text-[11px] text-zinc-500">
                      {format(new Date(adr.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <User className="w-3 h-3 text-zinc-500" />
                      <span>{adr.author?.username || adr.author?.email || 'Architect'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isAccepted
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {adr.status || 'ACCEPTED'}
                  </span>
                  <Link 
                    href={`/projects/${project.id}/adrs/${adr.id}`} 
                    className="linear-btn-secondary text-xs flex items-center gap-1"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
