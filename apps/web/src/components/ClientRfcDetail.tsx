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
import { 
  ArrowLeft, 
  Check, 
  X, 
  Minus, 
  Plus, 
  CheckCircle2, 
  ListTodo, 
  Sparkles,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from "lucide-react";

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
      setError(err.message || "Failed to update status");
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
      setError(err.message || "Failed to cast vote");
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
      setError(err.message || "Failed to add section");
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
      setError(err.message || "Failed to add task");
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
      setError(err.message || "Failed to generate issues");
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
    <div className="max-w-5xl mx-auto space-y-6 pb-28">
      
      {/* Back button */}
      <div>
        <Link 
          href={`/projects/${project.id}/rfcs`} 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-xs font-black text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back to RFCs</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-[#FF6B6B]/20 text-black dark:text-white border-2 border-[#FF6B6B] rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>{error}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-zinc-900 border-3 border-black dark:border-white rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden">
        <div className="p-6 sm:p-8 bg-[#FFFDF8] dark:bg-zinc-950">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded border border-black uppercase shadow-[1.5px_1.5px_0px_0px_#000] ${
                  isAccepted ? 'bg-[#4ADE80] text-black' :
                  isReview ? 'bg-[#FFE600] text-black' :
                  isImplemented ? 'bg-[#C084FC] text-black' :
                  'bg-zinc-200 text-black'
                }`}>
                  {rfc.status.replace('_', ' ')}
                </span>
                <span className="text-zinc-500 text-xs font-mono font-bold">
                  {format(new Date(rfc.createdAt), "MMMM d, yyyy")}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white mb-2">
                {rfc.title}
              </h1>
              
              {rfc.summary && (
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                  {rfc.summary}
                </p>
              )}

              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                Proposed by <span className="text-black dark:text-white font-black">{rfc.author?.username || rfc.author?.email || 'Engineering Team'}</span>
              </p>
            </div>

            {/* Voting Score Pill */}
            <div className="shrink-0 flex sm:flex-col gap-3 p-3.5 bg-[#FFE600] text-black rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] text-center">
              <div>
                <div className="text-2xl font-black font-mono text-emerald-800">{approvals}</div>
                <div className="text-[10px] font-mono font-black uppercase">Approvals</div>
              </div>
              <div className="hidden sm:block w-full h-[2px] bg-black" />
              <div>
                <div className="text-2xl font-black font-mono text-rose-800">{changes}</div>
                <div className="text-[10px] font-mono font-black uppercase">Changes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Transitions Bar */}
        {!isViewer && (
          <div className="px-6 py-3.5 bg-white dark:bg-zinc-900 border-t-2 border-black dark:border-white flex flex-wrap gap-2 items-center justify-between">
            <span className="text-xs text-black dark:text-white font-mono font-black uppercase tracking-wider">LIFECYCLE STATUS</span>
            <div className="flex items-center gap-2.5">
              {isDraft && (
                <button 
                  onClick={() => handleStatusChange("IN_REVIEW")} 
                  disabled={isUpdating} 
                  className="px-4 py-2 bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Submit for Review
                </button>
              )}
              {isReview && (
                <>
                  <button 
                    onClick={() => handleStatusChange("DRAFT")} 
                    disabled={isUpdating} 
                    className="px-3.5 py-2 border-2 border-black dark:border-white text-black dark:text-white rounded-xl text-xs font-black hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Return to Draft
                  </button>
                  <button 
                    onClick={() => handleStatusChange("ACCEPTED")} 
                    disabled={isUpdating} 
                    className="px-4 py-2 bg-[#4ADE80] hover:bg-emerald-400 text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Accept RFC
                  </button>
                </>
              )}
              {isAccepted && (
                <button 
                  onClick={() => handleStatusChange("IMPLEMENTED")} 
                  disabled={isUpdating} 
                  className="px-4 py-2 bg-[#C084FC] hover:bg-purple-400 text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Mark as Implemented
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Col Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sections (Left 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white">
            <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-wider">Specification Sections</h2>
            <span className="text-xs font-mono font-black bg-[#FFE600] text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
              {rfc.sections?.length || 0} SECTIONS
            </span>
          </div>
          
          {rfc.sections?.length === 0 ? (
            <div className="text-center p-8 bg-white dark:bg-zinc-900 border-2 border-dashed border-black dark:border-white rounded-2xl">
              <p className="text-xs font-bold text-zinc-500">No content sections added yet.</p>
            </div>
          ) : (
            rfc.sections?.map((section: any, idx: number) => (
              <div key={section.id} className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-2xl p-6 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
                <div className="text-[11px] font-mono font-black text-[#FFE600] bg-black px-2 py-0.5 rounded inline-block mb-2">
                  SECTION {idx + 1}
                </div>
                <h3 className="text-base font-black mb-3 text-black dark:text-white">{section.title}</h3>
                <div className="text-sm leading-relaxed text-black dark:text-zinc-200 font-medium whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            ))
          )}

          {!isViewer && (isDraft || isReview) && (
            <div className="pt-2">
              {!isAddingSection ? (
                <button 
                  onClick={() => setIsAddingSection(true)}
                  className="w-full py-3.5 border-2 border-dashed border-black dark:border-white rounded-2xl text-black dark:text-white text-xs font-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add Section
                </button>
              ) : (
                <form onSubmit={handleAddSection} className="p-6 bg-white dark:bg-zinc-900 border-3 border-black dark:border-white rounded-2xl space-y-4 shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff]">
                  <h3 className="text-xs font-black uppercase text-black dark:text-white">Add New Section</h3>
                  <input 
                    type="text" 
                    required 
                    placeholder="Section Title (e.g. Protocol & Schema Design)"
                    value={sectionData.title}
                    onChange={e => setSectionData({ ...sectionData, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-black dark:border-white rounded-lg bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all"
                  />
                  <textarea 
                    required 
                    rows={5}
                    placeholder="Section details, technical considerations, and diagrams..."
                    value={sectionData.content}
                    onChange={e => setSectionData({ ...sectionData, content: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium border-2 border-black dark:border-white rounded-lg bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all font-mono"
                  />
                  <div className="flex justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingSection(false)} 
                      className="px-4 py-2 text-xs font-black text-black dark:text-white hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isUpdating} 
                      className="px-4 py-2 bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                    >
                      Save Section
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Implementation Tasks (Right 1/3) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] sticky top-20">
            <h3 className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2 pb-3 mb-3 border-b-2 border-black dark:border-white">
              <ListTodo className="w-4 h-4 stroke-[2.5]" />
              <span>Implementation Roadmap</span>
            </h3>

            {rfc.tasks?.length === 0 && (
              <p className="text-xs text-zinc-500 italic mb-4 font-bold">No tasks defined yet.</p>
            )}

            <ul className="space-y-2.5 mb-4">
              {generatedTasks.map((t: any) => (
                <li key={t.id} className="flex items-start gap-2 text-xs text-zinc-400 font-bold line-through">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{t.description}</span>
                </li>
              ))}
              {ungeneratedTasks.map((t: any) => (
                <li key={t.id} className="flex items-start gap-2 text-xs font-bold text-black dark:text-white">
                  <div className="w-4 h-4 shrink-0 rounded border-2 border-black dark:border-white mt-0.5 bg-zinc-100 dark:bg-zinc-800" />
                  <span>{t.description}</span>
                </li>
              ))}
            </ul>

            {!isViewer && (
              <div className="space-y-3 pt-3 border-t-2 border-black dark:border-white">
                {isAddingTask ? (
                  <form onSubmit={handleAddTask} className="flex flex-col gap-2.5">
                    <input 
                      type="text" 
                      required 
                      placeholder="Task description..."
                      value={taskDesc}
                      onChange={e => setTaskDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border-2 border-black dark:border-white rounded-lg bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all"
                    />
                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        disabled={isUpdating} 
                        className="flex-1 py-1.5 bg-[#FFE600] text-black border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                      >
                        Add
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingTask(false)} 
                        className="flex-1 py-1.5 border-2 border-black dark:border-white rounded-lg text-xs font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setIsAddingTask(true)}
                    className="text-xs font-black text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add Task
                  </button>
                )}

                {isAccepted && ungeneratedTasks.length > 0 && (
                  <div className="pt-2">
                    <button 
                      onClick={handleSpawnIssues}
                      disabled={isUpdating}
                      className="w-full py-2.5 bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" /> : <Sparkles className="w-4 h-4 stroke-[2.5]" />}
                      <span>Generate {ungeneratedTasks.length} Issues</span>
                    </button>
                    <p className="text-[11px] text-center text-zinc-500 font-bold mt-1.5">Convert tasks to project issues</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Neobrutalist Voting Bar */}
      {!isViewer && (isReview || isDraft || isAccepted) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-zinc-900 border-3 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] rounded-2xl px-6 py-3 flex items-center gap-4">
          <div className="text-xs text-black dark:text-white hidden sm:block font-mono font-black uppercase">
            {myVote ? `YOUR VOTE: ${myVote}` : "CAST VOTE:"}
          </div>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => handleVote("APPROVE")}
              disabled={isUpdating}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
                myVote === 'APPROVE' 
                  ? 'bg-[#4ADE80] text-black shadow-[2px_2px_0px_0px_#000]' 
                  : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-emerald-50'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5 stroke-[2.5]" /> Approve
            </button>
            <button 
              onClick={() => handleVote("REQUEST_CHANGES")}
              disabled={isUpdating}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
                myVote === 'REQUEST_CHANGES' 
                  ? 'bg-[#FF6B6B] text-black shadow-[2px_2px_0px_0px_#000]' 
                  : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-rose-50'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5 stroke-[2.5]" /> Changes Req
            </button>
            <button 
              onClick={() => handleVote("ABSTAIN")}
              disabled={isUpdating}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
                myVote === 'ABSTAIN' 
                  ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000]' 
                  : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-100'
              }`}
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" /> Abstain
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
