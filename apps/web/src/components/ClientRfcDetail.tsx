"use client";

import { useState } from "react";
import { 
  updateRfcStatusAction, 
  castVoteAction, 
  addRfcSectionAction, 
  spawnIssuesAction, 
  addTaskAction
} from "../actions/rfcActions";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { DocumentTextIcon, CheckIcon, HandThumbUpIcon, HandThumbDownIcon, MinusIcon, PlusIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ClientRfcDetail({ project, rfc, isViewer, currentUser }: { project: any, rfc: any, isViewer: boolean, currentUser: any }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Section Creation State
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [sectionData, setSectionData] = useState({ title: "", content: "" });

  // Task Creation State
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");

  const handleStatusChange = async (status: string) => {
    try {
      setIsUpdating(true);
      setError("");
      await updateRfcStatusAction(project.id, rfc.id, status);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVote = async (vote: string) => {
    try {
      setIsUpdating(true);
      setError("");
      await castVoteAction(project.id, rfc.id, vote);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await addRfcSectionAction(project.id, rfc.id, {
        title: sectionData.title,
        content: sectionData.content,
        position: rfc.sections.length
      });
      setSectionData({ title: "", content: "" });
      setIsAddingSection(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await addTaskAction(project.id, rfc.id, taskDesc);
      setTaskDesc("");
      setIsAddingTask(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSpawnIssues = async () => {
    try {
      setIsUpdating(true);
      await spawnIssuesAction(project.id, rfc.id);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const isDraft = rfc.status === "DRAFT";
  const isReview = rfc.status === "IN_REVIEW";
  const isAccepted = rfc.status === "ACCEPTED";
  const isImplemented = rfc.status === "IMPLEMENTED";

  let approvals = 0;
  let changes = 0;
  let abstains = 0;
  let myVote = null;

  if (rfc.votes) {
    rfc.votes.forEach((v: any) => {
      if (v.vote === 'APPROVE') approvals++;
      if (v.vote === 'REQUEST_CHANGES') changes++;
      if (v.vote === 'ABSTAIN') abstains++;
      if (currentUser && v.userId === currentUser.id) myVote = v.vote;
    });
  }

  const ungeneratedTasks = rfc.tasks?.filter((t: any) => !t.generatedIssueId) || [];
  const generatedTasks = rfc.tasks?.filter((t: any) => t.generatedIssueId) || [];

  return (
    <div className="max-w-5xl mx-auto p-6 pb-32">
      <div className="mb-6">
        <Link href={`/projects/${project.id}/rfcs`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          &larr; Back to RFCs
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  isAccepted ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                  isReview ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                  isImplemented ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                  'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                }`}>
                  {rfc.status.replace('_', ' ')}
                </span>
                <span className="text-zinc-500 text-sm">
                  {format(new Date(rfc.createdAt), "MMMM d, yyyy")}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-3 leading-tight">{rfc.title}</h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">{rfc.summary}</p>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span>Proposed by <span className="font-medium text-zinc-900 dark:text-white">{rfc.author?.username || 'Unknown'}</span></span>
              </div>
            </div>

            {/* Voting Stats */}
            <div className="flex-shrink-0 flex gap-4 md:flex-col p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{approvals}</div>
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Approvals</div>
              </div>
              <div className="hidden md:block w-full h-px bg-zinc-200 dark:bg-zinc-800"></div>
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{changes}</div>
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Changes Req</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Transitions */}
        {!isViewer && (
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between">
            <div className="text-sm font-medium text-zinc-500">Lifecycle Management</div>
            <div className="flex gap-2">
              {isDraft && (
                <button onClick={() => handleStatusChange("IN_REVIEW")} disabled={isUpdating} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  Submit for Review
                </button>
              )}
              {isReview && (
                <>
                  <button onClick={() => handleStatusChange("DRAFT")} disabled={isUpdating} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-md text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors">
                    Return to Draft
                  </button>
                  <button onClick={() => handleStatusChange("ACCEPTED")} disabled={isUpdating} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                    Accept RFC
                  </button>
                </>
              )}
              {isAccepted && (
                <button onClick={() => handleStatusChange("IMPLEMENTED")} disabled={isUpdating} className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
                  Mark as Implemented
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sections (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2">RFC Sections</h2>
          
          {rfc.sections?.length === 0 ? (
            <div className="text-center p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">
              <p className="text-zinc-500">No sections added yet.</p>
            </div>
          ) : (
            rfc.sections?.map((section: any) => (
              <div key={section.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">{section.title}</h3>
                <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {section.content}
                </div>
                
                {/* Per-section Comments (Simplified) */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-medium">{section._count?.comments || 0} comments</span>
                  <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Discuss Section</button>
                </div>
              </div>
            ))
          )}

          {!isViewer && (isDraft || isReview) && (
            <div className="mt-8">
              {!isAddingSection ? (
                <button 
                  onClick={() => setIsAddingSection(true)}
                  className="w-full py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 font-medium hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" /> Add Section
                </button>
              ) : (
                <form onSubmit={handleAddSection} className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <h3 className="font-bold mb-4">New Section</h3>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      required 
                      placeholder="Section Title (e.g. API Design)"
                      value={sectionData.title}
                      onChange={e => setSectionData({ ...sectionData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <textarea 
                      required 
                      rows={6}
                      placeholder="Section content in markdown..."
                      value={sectionData.content}
                      onChange={e => setSectionData({ ...sectionData, content: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsAddingSection(false)} className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                      <button type="submit" disabled={isUpdating} className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50">Add Section</button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Sidebar (Right 1/3) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <CheckIcon className="w-5 h-5 text-blue-500" />
              Implementation Tasks
            </h3>

            {rfc.tasks?.length === 0 && (
              <p className="text-zinc-500 text-sm italic mb-4">No tasks defined yet.</p>
            )}

            <ul className="space-y-3 mb-6">
              {generatedTasks.map((t: any) => (
                <li key={t.id} className="flex items-start gap-2 text-sm text-zinc-500 line-through opacity-70">
                  <CheckCircleIcon className="w-5 h-5 shrink-0 text-green-500" />
                  <span>{t.description} (Generated Issue)</span>
                </li>
              ))}
              {ungeneratedTasks.map((t: any) => (
                <li key={t.id} className="flex items-start gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  <div className="w-5 h-5 shrink-0 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex items-center justify-center"></div>
                  <span>{t.description}</span>
                </li>
              ))}
            </ul>

            {!isViewer && (
              <div className="space-y-4">
                {isAddingTask ? (
                  <form onSubmit={handleAddTask} className="flex flex-col gap-2">
                    <input 
                      type="text" 
                      required 
                      placeholder="Task description..."
                      value={taskDesc}
                      onChange={e => setTaskDesc(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={isUpdating} className="flex-1 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 disabled:opacity-50">Add</button>
                      <button type="button" onClick={() => setIsAddingTask(false)} className="flex-1 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-md text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setIsAddingTask(true)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" /> Add Task
                  </button>
                )}

                {isAccepted && ungeneratedTasks.length > 0 && (
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button 
                      onClick={handleSpawnIssues}
                      disabled={isUpdating}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                      <span>🚀 Generate {ungeneratedTasks.length} Issues</span>
                    </button>
                    <p className="text-xs text-center text-zinc-500 mt-2">1-Click Issue Generator</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      {!isViewer && (isReview || isDraft || isAccepted) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] py-4 px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="font-medium text-zinc-900 dark:text-white hidden sm:block">
              {myVote ? `You voted: ${myVote}` : "Cast your vote:"}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <button 
                onClick={() => handleVote("APPROVE")}
                disabled={isUpdating}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${myVote === 'APPROVE' ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-600 ring-offset-2 dark:ring-offset-zinc-950' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'}`}
              >
                <HandThumbUpIcon className="w-5 h-5" /> Approve
              </button>
              <button 
                onClick={() => handleVote("REQUEST_CHANGES")}
                disabled={isUpdating}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${myVote === 'REQUEST_CHANGES' ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-600 ring-offset-2 dark:ring-offset-zinc-950' : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'}`}
              >
                <HandThumbDownIcon className="w-5 h-5" /> Request Changes
              </button>
              <button 
                onClick={() => handleVote("ABSTAIN")}
                disabled={isUpdating}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${myVote === 'ABSTAIN' ? 'bg-zinc-600 text-white shadow-lg ring-2 ring-zinc-600 ring-offset-2 dark:ring-offset-zinc-950' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
              >
                <MinusIcon className="w-5 h-5" /> Abstain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
