"use client";

import { useState } from "react";
import { createRfcAction } from "../actions/rfcActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { DocumentTextIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function ClientRfcsPage({ project, initialRfcs, isViewer }: { project: any, initialRfcs: any[], isViewer: boolean }) {
  const [rfcs, setRfcs] = useState(initialRfcs);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", summary: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const newRfc = await createRfcAction(project.id, formData);
      setRfcs([newRfc, ...rfcs]);
      setIsCreating(false);
      setFormData({ title: "", summary: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-zinc-500" />
            Requests for Comments (RFC)
          </h1>
          <p className="text-zinc-500 mt-1">Discuss and design upcoming features for {project.name}.</p>
        </div>
        {!isViewer && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
          >
            {isCreating ? "Cancel" : <><PlusIcon className="w-4 h-4" /> New RFC</>}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isCreating && !isViewer && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">Draft New RFC</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Implement Role-Based Access Control"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Summary (Optional)</label>
              <textarea 
                placeholder="Briefly describe the proposal..."
                rows={3}
                value={formData.summary} 
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Create Draft
            </button>
          </div>
        </form>
      )}

      {rfcs.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <DocumentTextIcon className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No RFCs found</p>
          <p className="mt-1">Propose and discuss complex architectural changes before implementing them.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rfcs.map(rfc => {
            const isDraft = rfc.status === "DRAFT";
            const isReview = rfc.status === "IN_REVIEW";
            const isAccepted = rfc.status === "ACCEPTED";
            const isImplemented = rfc.status === "IMPLEMENTED";
            
            // Calculate votes
            let approvals = 0;
            let changes = 0;
            if (rfc.votes) {
              rfc.votes.forEach((v: any) => {
                if (v.vote === 'APPROVE') approvals++;
                if (v.vote === 'REQUEST_CHANGES') changes++;
              });
            }

            return (
              <div key={rfc.id} className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-900 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Link href={`/projects/${project.id}/rfcs/${rfc.id}`} className="text-lg font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 truncate">
                      {rfc.title}
                    </Link>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      isAccepted ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                      isReview ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      isImplemented ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                      'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {rfc.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-500 flex items-center gap-2">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{rfc.author?.username || 'Unknown'}</span>
                    <span>•</span>
                    <span>Created {format(new Date(rfc.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                  {(isReview || isAccepted || isImplemented) && (
                    <div className="flex gap-2 text-sm font-medium">
                      <span className="text-green-600 dark:text-green-400">{approvals} ✓</span>
                      <span className="text-red-600 dark:text-red-400">{changes} ✗</span>
                    </div>
                  )}
                  <Link href={`/projects/${project.id}/rfcs/${rfc.id}`} className="inline-flex items-center justify-center px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    Discuss & Review
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
