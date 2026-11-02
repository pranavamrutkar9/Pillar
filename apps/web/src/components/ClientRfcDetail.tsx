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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to RFCs</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-[#F43F5E] rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-[#141519] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                  isAccepted ? 'bg-[#5E6AD2]/10 text-[#8B96FF] border-[#5E6AD2]/30' :
                  isReview ? 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30' :
                  isImplemented ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30' :
                  'bg-white/[0.04] text-[#8A8F98] border-white/10'
                }`}>
                  {rfc.status.replace('_', ' ')}
                </span>
                <span className="text-[#626773] text-xs font-mono">
                  {format(new Date(rfc.createdAt), "MMMM d, yyyy")}
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED] mb-2">
                {rfc.title}
              </h1>
              
              {rfc.summary && (
                <p className="text-sm text-[#8A8F98] leading-relaxed mb-4">
                  {rfc.summary}
                </p>
              )}

              <p className="text-xs text-[#626773]">
                Proposed by <span className="font-medium text-[#EDEDED]">{rfc.author?.username || rfc.author?.email || 'Engineering Team'}</span>
              </p>
            </div>

            {/* Voting Score Pill */}
            <div className="shrink-0 flex sm:flex-col gap-3 p-3 bg-[#0B0C0E] rounded-lg border border-white/[0.08] text-center min-w-[90px]">
              <div>
                <div className="text-xl font-bold font-mono text-emerald-400">{approvals}</div>
                <div className="text-[10px] font-mono text-[#626773] uppercase">Approvals</div>
              </div>
              <div className="hidden sm:block w-full h-px bg-white/[0.08]" />
              <div>
                <div className="text-xl font-bold font-mono text-red-400">{changes}</div>
                <div className="text-[10px] font-mono text-[#626773] uppercase">Changes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Transitions Bar */}
        {!isViewer && (
          <div className="px-6 py-3 bg-[#0B0C0E]/70 border-t border-white/[0.06] flex flex-wrap gap-2 items-center justify-between">
            <span className="text-xs text-[#626773] font-mono">LIFECYCLE STATUS</span>
            <div className="flex items-center gap-2">
              {isDraft && (
                <button 
                  onClick={() => handleStatusChange("IN_REVIEW")} 
                  disabled={isUpdating} 
                  className="px-3.5 py-1.5 bg-[#5E6AD2] text-white rounded-md text-xs font-medium hover:bg-[#525ec2] transition-colors disabled:opacity-50 shadow-[0_0_12px_rgba(94,106,210,0.3)]"
                >
                  Submit for Review
                </button>
              )}
              {isReview && (
                <>
                  <button 
                    onClick={() => handleStatusChange("DRAFT")} 
                    disabled={isUpdating} 
                    className="px-3 py-1.5 border border-white/10 text-[#8A8F98] hover:text-[#EDEDED] rounded-md text-xs font-medium hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                  >
                    Return to Draft
                  </button>
                  <button 
                    onClick={() => handleStatusChange("ACCEPTED")} 
                    disabled={isUpdating} 
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50 shadow-md"
                  >
                    Accept RFC
                  </button>
                </>
              )}
              {isAccepted && (
                <button 
                  onClick={() => handleStatusChange("IMPLEMENTED")} 
                  disabled={isUpdating} 
                  className="px-3.5 py-1.5 bg-[#5E6AD2] hover:bg-[#525ec2] text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50 shadow-[0_0_12px_rgba(94,106,210,0.3)]"
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
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h2 className="text-sm font-semibold text-[#EDEDED]">Specification Sections</h2>
            <span className="text-xs font-mono text-[#626773]">{rfc.sections?.length || 0} sections</span>
          </div>
          
          {rfc.sections?.length === 0 ? (
            <div className="text-center p-8 bg-[#141519] border border-dashed border-white/10 rounded-xl">
              <p className="text-xs text-[#8A8F98]">No content sections added yet.</p>
            </div>
          ) : (
            rfc.sections?.map((section: any, idx: number) => (
              <div key={section.id} className="bg-[#141519] border border-white/[0.08] rounded-xl p-6 shadow-sm">
                <div className="text-[11px] font-mono text-[#5E6AD2] mb-1">SECTION {idx + 1}</div>
                <h3 className="text-base font-semibold mb-3 text-[#EDEDED]">{section.title}</h3>
                <div className="text-sm leading-relaxed text-[#CCCCCC] whitespace-pre-wrap">
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
                  className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[#8A8F98] text-xs font-medium hover:border-white/30 hover:text-[#EDEDED] transition-colors flex items-center justify-center gap-1.5 bg-[#141519]/50"
                >
                  <Plus className="w-4 h-4" /> Add Section
                </button>
              ) : (
                <form onSubmit={handleAddSection} className="p-5 bg-[#141519] border border-white/[0.08] rounded-xl space-y-3.5 shadow-xl">
                  <h3 className="text-xs font-semibold text-[#EDEDED]">Add New Section</h3>
                  <input 
                    type="text" 
                    required 
                    placeholder="Section Title (e.g. Protocol & Schema Design)"
                    value={sectionData.title}
                    onChange={e => setSectionData({ ...sectionData, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-white/10 rounded-md bg-[#0B0C0E] text-[#EDEDED] focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 transition-colors"
                  />
                  <textarea 
                    required 
                    rows={5}
                    placeholder="Section details, technical considerations, and diagrams..."
                    value={sectionData.content}
                    onChange={e => setSectionData({ ...sectionData, content: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-white/10 rounded-md bg-[#0B0C0E] text-[#EDEDED] focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 transition-colors font-mono"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingSection(false)} 
                      className="px-3 py-1.5 text-xs text-[#8A8F98] hover:text-[#EDEDED]"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isUpdating} 
                      className="px-4 py-1.5 bg-[#5E6AD2] hover:bg-[#525ec2] text-white rounded-md text-xs font-medium disabled:opacity-50 shadow-[0_0_12px_rgba(94,106,210,0.3)]"
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
          <div className="bg-[#141519] border border-white/[0.08] rounded-xl p-5 shadow-xl sticky top-20">
            <h3 className="text-xs font-semibold text-[#EDEDED] flex items-center gap-2 pb-3 mb-3 border-b border-white/[0.08]">
              <ListTodo className="w-4 h-4 text-[#5E6AD2]" />
              <span>Implementation Roadmap</span>
            </h3>

            {rfc.tasks?.length === 0 && (
              <p className="text-xs text-[#626773] italic mb-4">No tasks defined yet.</p>
            )}

            <ul className="space-y-2 mb-4">
              {generatedTasks.map((t: any) => (
                <li key={t.id} className="flex items-start gap-2 text-xs text-[#626773] line-through">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{t.description}</span>
                </li>
              ))}
              {ungeneratedTasks.map((t: any) => (
                <li key={t.id} className="flex items-start gap-2 text-xs text-[#EDEDED]">
                  <div className="w-3.5 h-3.5 shrink-0 rounded-full border border-white/20 mt-0.5" />
                  <span>{t.description}</span>
                </li>
              ))}
            </ul>

            {!isViewer && (
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                {isAddingTask ? (
                  <form onSubmit={handleAddTask} className="flex flex-col gap-2">
                    <input 
                      type="text" 
                      required 
                      placeholder="Task description..."
                      value={taskDesc}
                      onChange={e => setTaskDesc(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-white/10 rounded-md bg-[#0B0C0E] text-[#EDEDED] focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 transition-colors"
                    />
                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        disabled={isUpdating} 
                        className="flex-1 py-1.5 bg-[#5E6AD2] hover:bg-[#525ec2] text-white rounded-md text-xs font-medium disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingTask(false)} 
                        className="flex-1 py-1.5 border border-white/10 rounded-md text-xs text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setIsAddingTask(true)}
                    className="text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED] flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#5E6AD2]" /> Add Task
                  </button>
                )}

                {isAccepted && ungeneratedTasks.length > 0 && (
                  <div className="pt-2">
                    <button 
                      onClick={handleSpawnIssues}
                      disabled={isUpdating}
                      className="w-full py-2 bg-[#5E6AD2] hover:bg-[#525ec2] text-white rounded-md text-xs font-medium transition-colors shadow-[0_0_12px_rgba(94,106,210,0.4)] flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Generate {ungeneratedTasks.length} Issues</span>
                    </button>
                    <p className="text-[11px] text-center text-[#626773] mt-1.5">Convert tasks to project issues</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Glass Voting Bar */}
      {!isViewer && (isReview || isDraft || isAccepted) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#141519]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-4">
          <div className="text-xs text-[#8A8F98] hidden sm:block font-mono">
            {myVote ? `Your vote: ${myVote}` : "Cast vote:"}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleVote("APPROVE")}
              disabled={isUpdating}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                myVote === 'APPROVE' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white/[0.04] text-[#8A8F98] hover:bg-emerald-500/20 hover:text-emerald-300'
              }`}
            >
              <ThumbsUp className="w-3 h-3" /> Approve
            </button>
            <button 
              onClick={() => handleVote("REQUEST_CHANGES")}
              disabled={isUpdating}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                myVote === 'REQUEST_CHANGES' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'bg-white/[0.04] text-[#8A8F98] hover:bg-red-500/20 hover:text-red-300'
              }`}
            >
              <ThumbsDown className="w-3 h-3" /> Changes Req
            </button>
            <button 
              onClick={() => handleVote("ABSTAIN")}
              disabled={isUpdating}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                myVote === 'ABSTAIN' 
                  ? 'bg-[#5E6AD2] text-white shadow-md' 
                  : 'bg-white/[0.04] text-[#8A8F98] hover:bg-white/[0.08]'
              }`}
            >
              <Minus className="w-3 h-3" /> Abstain
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
