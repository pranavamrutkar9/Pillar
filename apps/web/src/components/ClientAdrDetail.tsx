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
  Calendar, 
  User, 
  BookOpen,
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ADRs</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/40 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Document Card */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Document Header */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                  isAccepted ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40' :
                  isProposed ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200/60 dark:border-sky-900/40' :
                  isDeprecated ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border-red-200/60 dark:border-red-900/40' :
                  'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200/60'
                }`}>
                  {adr.status}
                </span>
                <span className="text-zinc-400 text-xs font-mono">
                  {format(new Date(adr.createdAt), "MMMM d, yyyy")}
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                {adr.title}
              </h1>
              
              <p className="text-xs text-zinc-500">
                Authored by <span className="font-medium text-zinc-700 dark:text-zinc-300">{adr.author?.username || adr.author?.email || 'Engineering Team'}</span>
              </p>
            </div>

            {!isViewer && (
              <div className="flex items-center gap-2 shrink-0">
                {isProposed && (
                  <>
                    <button 
                      onClick={() => handleStatusChange("ACCEPTED")}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button 
                      onClick={() => handleStatusChange("DEPRECATED")}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Supersede
                    </button>
                    <button 
                      onClick={() => handleStatusChange("DEPRECATED")}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-zinc-500 hover:text-red-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
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
          <div className="p-5 bg-zinc-50/70 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-900">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Supersede this ADR</h3>
            <p className="text-xs text-zinc-500 mb-3">Select the active ADR that replaces and updates this architectural decision.</p>
            <form onSubmit={handleSupersede} className="flex flex-col sm:flex-row gap-2">
              <select 
                required
                value={replacementId}
                onChange={(e) => setReplacementId(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
              >
                <option value="">-- Select an accepted ADR --</option>
                {allAdrs?.filter(a => a.status === 'ACCEPTED' && a.id !== adr.id).map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
              <button 
                type="submit"
                disabled={isUpdating || !replacementId}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
              >
                Confirm
              </button>
              <button 
                type="button" 
                onClick={() => setShowSupersede(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Document Sections */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {isSuperseded && adr.supersededBy && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-start gap-3">
              <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-xs text-amber-900 dark:text-amber-100">This ADR has been superseded</h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  Replaced by: <Link href={`/projects/${project.id}/adrs/${adr.supersededBy.id}`} className="underline font-medium">{adr.supersededBy.title}</Link>
                </p>
              </div>
            </div>
          )}

          <section>
            <h2 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
              01. Context & Motivation
            </h2>
            <div className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
              {adr.context}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
              02. Decision & Architecture Pattern
            </h2>
            <div className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 font-medium whitespace-pre-wrap bg-zinc-50/70 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900">
              {adr.decision}
            </div>
          </section>

          {adr.alternatives && (
            <section>
              <h2 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
                03. Alternatives Evaluated
              </h2>
              <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {adr.alternatives}
              </div>
            </section>
          )}

          {adr.consequences && (
            <section>
              <h2 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
                04. Consequences & Trade-offs
              </h2>
              <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {adr.consequences}
              </div>
            </section>
          )}

        </div>

      </div>

    </div>
  );
}
