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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-xs font-black text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back to ADRs</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-[#FF6B6B]/20 text-black dark:text-white border-2 border-[#FF6B6B] rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Document Card */}
      <div className="bg-white dark:bg-zinc-900 border-3 border-black dark:border-white rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden">
        
        {/* Document Header */}
        <div className="p-6 sm:p-8 border-b-2 border-black dark:border-white bg-[#FFFDF8] dark:bg-zinc-950">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded border border-black uppercase shadow-[1.5px_1.5px_0px_0px_#000] ${
                  isAccepted ? 'bg-[#4ADE80] text-black' :
                  isProposed ? 'bg-[#38BDF8] text-black' :
                  isDeprecated ? 'bg-[#FF6B6B] text-black' :
                  'bg-zinc-200 text-black'
                }`}>
                  {adr.status}
                </span>
                <span className="text-zinc-500 text-xs font-mono font-bold">
                  {format(new Date(adr.createdAt), "MMMM d, yyyy")}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white mb-2">
                {adr.title}
              </h1>
              
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                Authored by <span className="text-black dark:text-white font-black">{adr.author?.username || adr.author?.email || 'Engineering Team'}</span>
              </p>
            </div>

            {!isViewer && (
              <div className="flex items-center gap-2.5 shrink-0">
                {isProposed && (
                  <>
                    <button 
                      onClick={() => handleStatusChange("ACCEPTED")}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#4ADE80] hover:bg-emerald-400 text-black border-2 border-black rounded-xl text-xs font-black transition-all shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Accept
                    </button>
                    <button 
                      onClick={() => handleStatusChange("DEPRECATED")}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6B6B] hover:bg-rose-400 text-black border-2 border-black rounded-xl text-xs font-black transition-all shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 stroke-[3]" /> Reject
                    </button>
                  </>
                )}
                {isAccepted && (
                  <>
                    <button 
                      onClick={() => setShowSupersede(!showSupersede)}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border-2 border-black dark:border-white bg-[#FFE600] text-black rounded-xl text-xs font-black transition-all shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" /> Supersede
                    </button>
                    <button 
                      onClick={() => handleStatusChange("DEPRECATED")}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-black dark:text-white hover:text-red-600 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
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
          <div className="p-5 bg-[#FEF08A] text-black border-b-2 border-black">
            <h3 className="text-xs font-black uppercase mb-1">Supersede this ADR</h3>
            <p className="text-xs font-semibold mb-3">Select the active ADR that replaces and updates this architectural decision.</p>
            <form onSubmit={handleSupersede} className="flex flex-col sm:flex-row gap-2.5">
              <select 
                required
                value={replacementId}
                onChange={(e) => setReplacementId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-bold border-2 border-black rounded-lg bg-white text-black focus:outline-none"
              >
                <option value="">-- Select an accepted ADR --</option>
                {allAdrs?.filter(a => a.status === 'ACCEPTED' && a.id !== adr.id).map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
              <button 
                type="submit"
                disabled={isUpdating || !replacementId}
                className="px-4 py-2 rounded-xl text-xs font-black bg-black text-white hover:bg-zinc-800 transition-all shadow-[2px_2px_0px_0px_#FFE600] disabled:opacity-50 cursor-pointer"
              >
                Confirm
              </button>
              <button 
                type="button" 
                onClick={() => setShowSupersede(false)}
                className="px-3 py-2 text-xs font-bold text-black hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Document Sections */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {isSuperseded && adr.supersededBy && (
            <div className="p-4 bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_0px_#FF6B6B]">
              <RefreshCw className="w-5 h-5 text-black mt-0.5 shrink-0 stroke-[2.5]" />
              <div>
                <h4 className="font-black text-xs text-black uppercase">This ADR has been superseded</h4>
                <p className="text-xs font-bold text-black mt-0.5">
                  Replaced by: <Link href={`/projects/${project.id}/adrs/${adr.supersededBy.id}`} className="underline font-black">{adr.supersededBy.title}</Link>
                </p>
              </div>
            </div>
          )}

          <section>
            <h2 className="text-xs font-mono font-black text-black dark:text-white uppercase tracking-wider mb-2">
              01. Context & Motivation
            </h2>
            <div className="text-sm leading-relaxed text-black dark:text-zinc-200 font-medium whitespace-pre-wrap">
              {adr.context}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono font-black text-black dark:text-white uppercase tracking-wider mb-2">
              02. Decision & Architecture Pattern
            </h2>
            <div className="text-sm leading-relaxed text-black dark:text-zinc-100 font-bold whitespace-pre-wrap bg-amber-50/60 dark:bg-zinc-950 p-4 rounded-xl border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
              {adr.decision}
            </div>
          </section>

          {adr.alternatives && (
            <section>
              <h2 className="text-xs font-mono font-black text-black dark:text-white uppercase tracking-wider mb-2">
                03. Alternatives Evaluated
              </h2>
              <div className="text-sm leading-relaxed text-black dark:text-zinc-300 font-medium whitespace-pre-wrap">
                {adr.alternatives}
              </div>
            </section>
          )}

          {adr.consequences && (
            <section>
              <h2 className="text-xs font-mono font-black text-black dark:text-white uppercase tracking-wider mb-2">
                04. Consequences & Trade-offs
              </h2>
              <div className="text-sm leading-relaxed text-black dark:text-zinc-300 font-medium whitespace-pre-wrap">
                {adr.consequences}
              </div>
            </section>
          )}

        </div>

      </div>

    </div>
  );
}
