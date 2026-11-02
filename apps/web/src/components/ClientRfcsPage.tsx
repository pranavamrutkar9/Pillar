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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#5E6AD2]" />
            <h1 className="text-xl font-semibold tracking-tight text-[#EDEDED]">
              Requests for Comments
            </h1>
          </div>
          <p className="text-xs text-[#8A8F98] mt-1">
            Propose, review, and build architectural consensus on upcoming engineering initiatives for {project.name}.
          </p>
        </div>

        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#5E6AD2] hover:bg-[#525ec2] text-white transition-all shadow-[0_0_12px_rgba(94,106,210,0.3)]"
          >
            {isCreating ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> <span>New RFC</span></>}
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isCreating && !isViewer && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl border border-white/[0.08] bg-[#141519] shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#EDEDED]">Draft Request for Comments</h3>
            <p className="text-xs text-[#8A8F98]">Kick off a technical discussion before writing production code.</p>
          </div>
          
          {error && (
            <div className="p-2.5 rounded-md bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#F43F5E] text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#8A8F98] mb-1">RFC Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. RFC-12: Zero-Downtime Database Migration Pipeline"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-md border border-white/10 bg-[#0B0C0E] text-[#EDEDED] placeholder:text-[#626773] focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8F98] mb-1">Executive Summary</label>
              <textarea 
                placeholder="High-level overview of the feature, system impact, and expected benefits..."
                rows={3}
                value={formData.summary} 
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-md border border-white/10 bg-[#0B0C0E] text-[#EDEDED] placeholder:text-[#626773] focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 transition-colors" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-md border border-white/10 text-xs text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#5E6AD2] hover:bg-[#525ec2] text-white disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(94,106,210,0.3)]"
            >
              {loading ? "Publishing..." : "Publish RFC"}
            </button>
          </div>
        </form>
      )}

      {/* RFCs List */}
      <div className="grid grid-cols-1 gap-3">
        {rfcs.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-[#141519]/50">
            <FileText className="w-8 h-8 text-[#626773] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#EDEDED]">No RFCs published yet</p>
            <p className="text-xs text-[#8A8F98] mt-1">Get started by authoring your team's first Request for Comments.</p>
          </div>
        ) : (
          rfcs.map((rfc) => {
            const isApproved = rfc.status === "APPROVED";
            const isDraft = rfc.status === "DRAFT";
            const isReview = rfc.status === "IN_REVIEW";
            const isClosed = rfc.status === "CLOSED";

            return (
              <Link 
                key={rfc.id} 
                href={`/projects/${project.id}/rfcs/${rfc.id}`}
                className="group p-5 rounded-xl border border-white/[0.08] bg-[#141519] hover:bg-white/[0.02] hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                      isApproved ? 'bg-[#5E6AD2]/10 text-[#8B96FF] border-[#5E6AD2]/30' :
                      isReview ? 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30' :
                      isDraft ? 'bg-white/[0.04] text-[#8A8F98] border-white/10' :
                      'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/30'
                    }`}>
                      {rfc.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[#626773] font-mono">
                      {format(new Date(rfc.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#EDEDED] group-hover:text-[#5E6AD2] transition-colors truncate">
                    {rfc.title}
                  </h3>
                  {rfc.summary && (
                    <p className="text-xs text-[#8A8F98] line-clamp-2 leading-relaxed">
                      {rfc.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[#8A8F98] shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> {rfc.votes?.filter((v: any) => v.vote === 'APPROVE').length || 0}
                    </span>
                    <span className="flex items-center gap-1 text-red-400">
                      <X className="w-3.5 h-3.5" /> {rfc.votes?.filter((v: any) => v.vote === 'REJECT').length || 0}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#626773] group-hover:text-[#EDEDED] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })
        )}
      </div>

    </div>
  );
}
