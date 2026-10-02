"use client";

import { useState } from "react";
import { updateAdrStatusAction, supersedeAdrAction } from "../actions/adrActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { BookOpenIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

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
      setError(err.message);
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
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const isAccepted = adr.status === "ACCEPTED";
  const isProposed = adr.status === "PROPOSED";
  const isDeprecated = adr.status === "DEPRECATED";
  const isSuperseded = adr.status === "SUPERSEDED";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href={`/projects/${project.id}/adrs`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          &larr; Back to ADRs
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  isAccepted ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                  isProposed ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                  isDeprecated ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                  'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                }`}>
                  {adr.status}
                </span>
                <span className="text-zinc-500 text-sm">
                  {format(new Date(adr.createdAt), "MMMM d, yyyy")}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{adr.title}</h1>
              <p className="text-zinc-500">Proposed by {adr.author?.username || 'Unknown'}</p>
            </div>

            {!isViewer && (
              <div className="flex gap-2">
                {isProposed && (
                  <>
                    <button 
                      onClick={() => handleStatusChange("ACCEPTED")}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 h-4" /> Accept
                    </button>
                    <button 
                      onClick={() => handleStatusChange("DEPRECATED")}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircleIcon className="w-4 h-4" /> Reject/Deprecate
                    </button>
                  </>
                )}
                {isAccepted && (
                  <>
                    <button 
                      onClick={() => handleStatusChange("DEPRECATED")}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircleIcon className="w-4 h-4" /> Deprecate
                    </button>
                    <button 
                      onClick={() => setShowSupersede(!showSupersede)}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                    >
                      <ArrowPathIcon className="w-4 h-4" /> Supersede
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {showSupersede && (
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold mb-2">Supersede this ADR</h3>
            <p className="text-sm text-zinc-500 mb-4">Select the ID of the new ACCEPTED Architecture Decision Record that replaces this one.</p>
            <form onSubmit={handleSupersede} className="flex gap-2">
              <select 
                required
                value={replacementId}
                onChange={(e) => setReplacementId(e.target.value)}
                className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Select an accepted ADR --</option>
                {allAdrs?.filter(a => a.status === 'ACCEPTED' && a.id !== adr.id).map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
              <button 
                type="submit"
                disabled={isUpdating || !replacementId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Confirm Supersession
              </button>
              <button 
                type="button"
                onClick={() => setShowSupersede(false)}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="p-6 space-y-8">
          {isSuperseded && adr.supersededBy && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
              <ArrowPathIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-100">This ADR has been superseded</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  It was replaced by: <Link href={`/projects/${project.id}/adrs/${adr.supersededBy.id}`} className="underline font-semibold">{adr.supersededBy.title}</Link>
                </p>
              </div>
            </div>
          )}

          {adr.supersedes && adr.supersedes.length > 0 && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <h4 className="font-bold text-sm text-zinc-500 uppercase tracking-wider mb-2">Supersedes</h4>
              <ul className="list-disc list-inside space-y-1">
                {adr.supersedes.map((oldAdr: any) => (
                  <li key={oldAdr.id}>
                    <Link href={`/projects/${project.id}/adrs/${oldAdr.id}`} className="text-blue-600 hover:underline">
                      {oldAdr.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <section>
            <h2 className="text-xl font-bold mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Context</h2>
            <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {adr.context}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Decision</h2>
            <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-medium">
              {adr.decision}
            </div>
          </section>

          {adr.alternatives && (
            <section>
              <h2 className="text-xl font-bold mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Alternatives Considered</h2>
              <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {adr.alternatives}
              </div>
            </section>
          )}

          {adr.consequences && (
            <section>
              <h2 className="text-xl font-bold mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Consequences</h2>
              <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {adr.consequences}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
