"use client";

import { useState } from "react";
import { updateAdrStatusAction, supersedeAdrAction } from "../actions/adrActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle
} from "lucide-react";

export default function ClientAdrDetail({ project, adr, allAdrs, isViewer }: { project: any, adr: any, allAdrs?: any[], isViewer: boolean }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSupersede, setShowSupersede] = useState(false);
  const [replacementId, setReplacementId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleStatusChange = async (status: string) => {
    try {
      setIsUpdating(true);
      setError("");
      await updateAdrStatusAction(project.id, adr.id, status);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSupersede = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setError("");
      await supersedeAdrAction(project.id, adr.id, replacementId);
      setShowSupersede(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to supersede ADR");
    } finally {
      setIsUpdating(false);
    }
  };

  const isAccepted = adr.status === "ACCEPTED";
  const isProposed = adr.status === "PROPOSED";
  const isDeprecated = adr.status === "DEPRECATED";
  const isSuperseded = adr.status === "SUPERSEDED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Back button */}
      <div>
        <Link 
          href={`/projects/${project.id}/adrs`} 
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ADRs</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#F43F5E] rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Document Card */}
      <div className="bg-[#141519] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden">
        
        {/* Document Header */}
        <div className="p-6 sm:p-8 border-b border-white/[0.06]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                  isAccepted ? 'bg-[#5E6AD2]/10 text-[#8B96FF] border-[#5E6AD2]/30' :
                  isProposed ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                  isDeprecated ? 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/30' :
                  'bg-white/[0.04] text-[#8A8F98] border-white/10'
                }`}>
                  {adr.status}
                </span>
                <span className="text-[#626773] text-xs font-mono">
                  {format(new Date(adr.createdAt), "MMMM d, yyyy")}
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED] mb-2">
                {adr.title}
              </h1>
              
              <p className="text-xs text-[#8A8F98]">
                Authored by <span className="font-medium text-[#EDEDED]">{adr.author?.username || adr.author?.email || 'Engineering Team'}</span>
              </p>
            </div>

            {!isViewer && (
              <div className="flex items-center gap-2 shrink-0">
                {isProposed && (
                  <>
                    <button 
                      onClick={() => handleStatusChange("ACCEPTED")}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5E6AD2] hover:bg-[#525ec2] text-white rounded-md text-xs font-medium transition-colors shadow-[0_0_12px_rgba(94,106,210,0.3)] disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button 
                      onClick={() => handleStatusChange("DEPRECATED")}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-[#EDEDED] rounded-md text-xs font-medium transition-colors disabled:opacity-50 border border-white/10"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                {isAccepted && (
                  <>
                    <button 
                      onClick={() => setShowSupersede(!showSupersede)}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04] rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Supersede
                    </button>
                    <button 
                      onClick={() => handleStatusChange("DEPRECATED")}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#8A8F98] hover:text-[#F43F5E] rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      Deprecate
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Supersede Drawer */}
        {showSupersede && (
          <div className="p-5 bg-[#0B0C0E] border-b border-white/[0.06]">
            <h3 className="text-xs font-semibold text-[#EDEDED] mb-1">Supersede this ADR</h3>
            <p className="text-xs text-[#8A8F98] mb-3">Select the active ADR that replaces and updates this architectural decision.</p>
            <form onSubmit={handleSupersede} className="flex flex-col sm:flex-row gap-2">
              <select 
                required
                value={replacementId}
                onChange={(e) => setReplacementId(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-white/10 rounded-md bg-[#141519] text-[#EDEDED] focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 transition-colors"
              >
                <option value="">-- Select an accepted ADR --</option>
                {allAdrs?.filter(a => a.status === 'ACCEPTED' && a.id !== adr.id).map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
              <button 
                type="submit"
                disabled={isUpdating || !replacementId}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-[#5E6AD2] hover:bg-[#525ec2] text-white transition-colors shadow-md disabled:opacity-50"
              >
                Confirm
              </button>
              <button 
                type="button" 
                onClick={() => setShowSupersede(false)}
                className="px-3 py-1.5 text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED]"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Document Sections */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {isSuperseded && adr.supersededBy && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
              <RefreshCw className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-xs text-amber-200">This ADR has been superseded</h4>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Replaced by: <Link href={`/projects/${project.id}/adrs/${adr.supersededBy.id}`} className="underline font-medium hover:text-amber-100">{adr.supersededBy.title}</Link>
                </p>
              </div>
            </div>
          )}

          <section>
            <h2 className="text-xs font-mono font-medium text-[#5E6AD2] uppercase tracking-wider mb-2">
              01. Context & Motivation
            </h2>
            <div className="text-sm leading-relaxed text-[#CCCCCC] whitespace-pre-wrap">
              {adr.context}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono font-medium text-[#5E6AD2] uppercase tracking-wider mb-2">
              02. Decision & Architecture Pattern
            </h2>
            <div className="text-sm leading-relaxed text-[#EDEDED] font-medium whitespace-pre-wrap bg-[#0B0C0E] p-4 rounded-lg border border-white/[0.06]">
              {adr.decision}
            </div>
          </section>

          {adr.alternatives && (
            <section>
              <h2 className="text-xs font-mono font-medium text-[#5E6AD2] uppercase tracking-wider mb-2">
                03. Alternatives Evaluated
              </h2>
              <div className="text-sm leading-relaxed text-[#8A8F98] whitespace-pre-wrap">
                {adr.alternatives}
              </div>
            </section>
          )}

          {adr.consequences && (
            <section>
              <h2 className="text-xs font-mono font-medium text-[#5E6AD2] uppercase tracking-wider mb-2">
                04. Consequences & Trade-offs
              </h2>
              <div className="text-sm leading-relaxed text-[#8A8F98] whitespace-pre-wrap">
                {adr.consequences}
              </div>
            </section>
          )}

        </div>

      </div>

    </div>
  );
}
