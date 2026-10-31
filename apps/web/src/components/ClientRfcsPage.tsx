"use client";

import { useState } from "react";
import { createRfcAction } from "../actions/rfcActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { FileText, Plus, ArrowRight, Check, X } from "lucide-react";

export default function ClientRfcsPage({ project, initialRfcs, isViewer }: { project: any, initialRfcs: any[], isViewer: boolean }) {
  const [rfcs, setRfcs] = useState(initialRfcs);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", summary: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const newRfc = await createRfcAction(project.id, formData);
      setRfcs([newRfc, ...rfcs]);
      setIsCreating(false);
      setFormData({ title: "", summary: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create RFC");
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
            <FileText className="w-6 h-6 stroke-[2.5]" />
            <h1 className="text-2xl font-black tracking-tight text-black dark:text-white uppercase">
              Requests for Comments
            </h1>
          </div>
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
            Propose, review, and build architectural consensus on upcoming engineering initiatives for {project.name}.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            {isCreating ? "Cancel" : <><Plus className="w-4 h-4 stroke-[3]" /> <span>New RFC</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && !isViewer && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl border-3 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase text-black dark:text-white">Draft Request for Comments</h3>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Kick off a technical discussion before writing production code.</p>
          </div>
          
          {error && (
            <div className="p-2.5 rounded-lg bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] text-black dark:text-white text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">RFC Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. RFC-12: Zero-Downtime Database Migration Pipeline"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Executive Summary</label>
              <textarea 
                placeholder="High-level overview of the feature, system impact, and expected benefits..."
                rows={3}
                value={formData.summary} 
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all" 
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
              disabled={loading || !formData.title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-black bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Draft RFC"}
            </button>
          </div>
        </form>
      )}

      {/* RFCs List */}
      {rfcs.length === 0 ? (
        <div className="p-12 text-center border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
          <FileText className="w-10 h-10 text-black dark:text-white mx-auto mb-2 stroke-[2]" />
          <p className="text-base font-black text-black dark:text-white">No RFCs created yet</p>
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1">Start technical RFC discussions to align your team before implementing complex features.</p>
        </div>
      ) : (
        <div className="border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
          <div className="px-5 py-3 bg-[#FFE600] border-b-2 border-black text-xs font-mono font-black text-black">
            DISCUSSIONS & PROPOSALS ({rfcs.length})
          </div>
          <ul className="divide-y-2 divide-black/10 dark:divide-white/20 font-bold">
            {rfcs.map(rfc => {
              const isDraft = rfc.status === "DRAFT";
              const isReview = rfc.status === "IN_REVIEW";
              const isAccepted = rfc.status === "ACCEPTED";
              const isImplemented = rfc.status === "IMPLEMENTED";
              
              let approvals = 0;
              let changes = 0;
              if (rfc.votes) {
                rfc.votes.forEach((v: any) => {
                  if (v.vote === 'APPROVE') approvals++;
                  if (v.vote === 'REQUEST_CHANGES') changes++;
                });
              }

              return (
                <li 
                  key={rfc.id} 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FEF08A]/30 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <Link 
                        href={`/projects/${project.id}/rfcs/${rfc.id}`} 
                        className="text-sm font-black text-black dark:text-white hover:underline truncate"
                      >
                        {rfc.title}
                      </Link>
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000] uppercase shrink-0 ${
                        isAccepted ? 'bg-[#4ADE80] text-black' :
                        isReview ? 'bg-[#FFE600] text-black' :
                        isImplemented ? 'bg-[#C084FC] text-black' :
                        'bg-zinc-200 text-black'
                      }`}>
                        {rfc.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-500 flex items-center gap-2 font-medium">
                      <span className="text-black dark:text-white font-bold">
                        {rfc.author?.username || rfc.author?.email || 'Engineering Team'}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{format(new Date(rfc.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 self-end sm:self-auto">
                    {(isReview || isAccepted || isImplemented) && (
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="inline-flex items-center gap-1 text-black bg-[#4ADE80] px-2 py-0.5 rounded border border-black font-black shadow-[1px_1px_0px_0px_#000]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> {approvals}
                        </span>
                        {changes > 0 && (
                          <span className="inline-flex items-center gap-1 text-black bg-[#FF6B6B] px-2 py-0.5 rounded border border-black font-black shadow-[1px_1px_0px_0px_#000]">
                            <X className="w-3.5 h-3.5 stroke-[3]" /> {changes}
                          </span>
                        )}
                      </div>
                    )}
                    <Link 
                      href={`/projects/${project.id}/rfcs/${rfc.id}`} 
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-xs font-black text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
                    >
                      <span>Review</span>
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
