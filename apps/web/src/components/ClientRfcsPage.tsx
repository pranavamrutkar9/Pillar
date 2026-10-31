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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-500" />
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Requests for Comments
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Propose, review, and build architectural consensus on upcoming engineering initiatives for {project.name}.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs"
          >
            {isCreating ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> <span>New RFC</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && !isViewer && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Draft Request for Comments</h3>
            <p className="text-xs text-zinc-500">Kick off a technical discussion before writing production code.</p>
          </div>
          
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">RFC Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. RFC-12: Zero-Downtime Database Migration Pipeline"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Executive Summary</label>
              <textarea 
                placeholder="High-level overview of the feature, system impact, and expected benefits..."
                rows={3}
                value={formData.summary} 
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors" 
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
              disabled={loading || !formData.title.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Draft RFC"}
            </button>
          </div>
        </form>
      )}

      {/* RFCs List */}
      {rfcs.length === 0 ? (
        <div className="p-12 text-center border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950">
          <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No RFCs created yet</p>
          <p className="text-xs text-zinc-500 mt-0.5">Start technical RFC discussions to align your team before implementing complex features.</p>
        </div>
      ) : (
        <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs">
          <div className="px-4 py-2.5 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-400">
            DISCUSSIONS & PROPOSALS ({rfcs.length})
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
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
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <Link 
                        href={`/projects/${project.id}/rfcs/${rfc.id}`} 
                        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline truncate"
                      >
                        {rfc.title}
                      </Link>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${
                        isAccepted ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40' :
                        isReview ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40' :
                        isImplemented ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200/60 dark:border-purple-900/40' :
                        'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200/60'
                      }`}>
                        {rfc.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 flex items-center gap-2">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                        {rfc.author?.username || rfc.author?.email || 'Engineering Team'}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{format(new Date(rfc.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 self-end sm:self-auto">
                    {(isReview || isAccepted || isImplemented) && (
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/40">
                          <Check className="w-3 h-3" /> {approvals}
                        </span>
                        {changes > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded border border-red-200/60 dark:border-red-900/40">
                            <X className="w-3 h-3" /> {changes}
                          </span>
                        )}
                      </div>
                    )}
                    <Link 
                      href={`/projects/${project.id}/rfcs/${rfc.id}`} 
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-2xs"
                    >
                      <span>Review</span>
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
