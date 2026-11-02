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
    <div className="space-y-6 max-w-5xl font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-[#121212]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1976D2]" />
            <h1 className="text-xl font-black uppercase tracking-tight text-[#121212] dark:text-white">
              REQUESTS FOR COMMENTS (RFC)
            </h1>
          </div>
          <p className="text-xs font-mono uppercase text-neutral-500 mt-1">
            Propose, review, and build architectural consensus on upcoming engineering initiatives for {project.name}.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider bg-[#1976D2] hover:bg-[#0D47A1] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212] transition-all"
          >
            {isCreating ? "CANCEL" : <><Plus className="w-3.5 h-3.5" /> <span>AUTHOR RFC</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && !isViewer && (
        <form onSubmit={handleCreate} className="p-6 border-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[6px_6px_0px_#121212] space-y-4">
          <div className="border-b-2 border-[#121212] pb-2">
            <h3 className="text-sm font-black uppercase text-[#121212] dark:text-white">DRAFT PROPOSAL</h3>
            <p className="text-xs font-mono uppercase text-neutral-500">Kick off a technical discussion before writing production code.</p>
          </div>
          
          {error && (
            <div className="p-3 bg-[#D32F2F] text-white border-2 border-[#121212] text-xs font-black uppercase">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-black uppercase text-[#121212] dark:text-white mb-1">PROPOSAL TITLE</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. RFC-12: Zero-Downtime Database Migration Pipeline"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-[#121212] bg-[#FAF6EE] text-[#121212] focus:outline-none focus:border-[#1976D2]" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#121212] dark:text-white mb-1">EXECUTIVE SUMMARY</label>
              <textarea 
                placeholder="High-level overview of the feature, system impact, and expected benefits..."
                rows={3}
                value={formData.summary} 
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-[#121212] bg-[#FAF6EE] text-[#121212] focus:outline-none focus:border-[#1976D2]" 
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
              className="px-5 py-1.5 text-xs font-black uppercase bg-[#1976D2] hover:bg-[#0D47A1] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212]"
            >
              {loading ? "PUBLISHING..." : "SUBMIT PROPOSAL"}
            </button>
          </div>
        </form>
      )}

      {/* RFCs List */}
      <div className="space-y-3">
        {rfcs.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[#121212] dark:border-white bg-white dark:bg-[#181A20]">
            <FileText className="w-8 h-8 text-[#1976D2] mx-auto mb-2" />
            <p className="text-sm font-black uppercase">NO ACTIVE RFC PROPOSALS</p>
            <p className="text-xs font-mono uppercase text-neutral-500 mt-1">Author your team&apos;s first technical specification proposal.</p>
          </div>
        ) : (
          rfcs.map((rfc) => {
            const isApproved = rfc.status === "APPROVED";
            const isDraft = rfc.status === "DRAFT";
            const isReview = rfc.status === "IN_REVIEW";

            return (
              <Link 
                key={rfc.id} 
                href={`/projects/${project.id}/rfcs/${rfc.id}`}
                className="group p-5 border-2 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[4px_4px_0px_#121212] dark:shadow-[4px_4px_0px_#FFF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#121212] transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 border border-[#121212] uppercase ${
                      isApproved ? 'bg-emerald-600 text-white' :
                      isReview ? 'bg-[#FBC02D] text-[#121212]' :
                      isDraft ? 'bg-[#FAF6EE] text-[#121212]' :
                      'bg-[#D32F2F] text-white'
                    }`}>
                      {rfc.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">
                      PROPOSED // {format(new Date(rfc.createdAt), "yyyy-MM-dd")}
                    </span>
                  </div>
                  <h3 className="text-sm font-black uppercase text-[#121212] dark:text-white group-hover:text-[#1976D2] transition-colors">
                    {rfc.title}
                  </h3>
                  {rfc.summary && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {rfc.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono font-bold shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Check className="w-3.5 h-3.5" /> {rfc.votes?.filter((v: any) => v.vote === 'APPROVE').length || 0}
                    </span>
                    <span className="flex items-center gap-1 text-[#D32F2F]">
                      <X className="w-3.5 h-3.5" /> {rfc.votes?.filter((v: any) => v.vote === 'REJECT').length || 0}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#121212] dark:text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })
        )}
      </div>

    </div>
  );
}
