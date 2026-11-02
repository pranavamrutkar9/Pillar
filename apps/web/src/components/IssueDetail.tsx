"use client";

import { useState } from "react";
import { updateIssueAction } from "../actions/issueActions";
import TiptapEditor from "./TiptapEditor";
import { format } from "date-fns";
import { PullRequestCard } from "./PullRequestCard";
import { 
  Calendar, 
  User, 
  Repeat, 
  Layers, 
  Tag, 
  GitPullRequest, 
  Loader2,
  Check,
  Edit3
} from "lucide-react";

function getStatusSymbol(statusName: string) {
  const name = statusName.toLowerCase();
  if (name.includes('done') || name.includes('complete') || name.includes('shipped')) return '●';
  if (name.includes('progress') || name.includes('doing') || name.includes('active')) return '▲';
  if (name.includes('review') || name.includes('testing')) return '◆';
  return '■';
}

export default function IssueDetail({ issue, project, cycles = [], modules = [] }: { issue: any, project: any, cycles?: any[], modules?: any[] }) {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);
  const [statusId, setStatusId] = useState(issue.statusId);
  const [priority, setPriority] = useState(issue.priority);
  const [assigneeId, setAssigneeId] = useState(issue.assigneeId || "");
  const [dueDate, setDueDate] = useState(issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : "");
  const [estimate, setEstimate] = useState<number | "">(issue.estimate ?? "");
  const [cycleId, setCycleId] = useState(issue.cycleId || "");
  const [moduleId, setModuleId] = useState(issue.moduleId || "");
  const [labelIds, setLabelIds] = useState<string[]>(issue.labels?.map((l: any) => l.label.id) || []);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (field: string, value: any) => {
    setLoading(true);
    try {
      await updateIssueAction(issue.projectId, issue.id, { [field]: value });
    } catch (err) {
      console.error(err);
      alert("Failed to update issue");
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = project.issueStatuses?.find((s: any) => s.id === statusId);

  return (
    <div className="bg-white dark:bg-[#181A20] p-6 sm:p-8 border-4 border-[#121212] dark:border-white shadow-[6px_6px_0px_#121212] dark:shadow-[6px_6px_0px_#FFF] space-y-7 relative font-sans">
      
      {/* Bauhaus Top Triad Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 grid grid-cols-3">
        <div className="bg-[#D32F2F]" />
        <div className="bg-[#1976D2]" />
        <div className="bg-[#FBC02D]" />
      </div>

      {/* Title & Key */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-white bg-[#121212] dark:bg-white dark:text-[#121212] px-2.5 py-1 border border-[#121212]">
              {project.slug}-{issue.sequenceId}
            </span>
            <span className="text-xs font-mono text-neutral-500 font-bold uppercase">
              REGISTERED // {format(new Date(issue.createdAt), 'yyyy-MM-dd')}
            </span>
          </div>

          {loading && (
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#D32F2F]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> SYNCHRONIZING...
            </span>
          )}
        </div>

        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => { if(title !== issue.title) handleUpdate("title", title); }}
          className="text-2xl sm:text-3xl font-black uppercase tracking-tight w-full bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-white border-2 border-[#121212] dark:border-white px-3 py-2 focus:outline-none focus:border-[#D32F2F] shadow-[2px_2px_0px_#121212]"
        />
      </div>

      {/* Properties Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#FAF6EE] dark:bg-[#111215] border-2 border-[#121212] dark:border-white shadow-[3px_3px_0px_#121212]">
        
        {/* Status */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">STAGE</label>
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#181A20] px-2 py-1.5 border-2 border-[#121212]">
            <span className="text-xs font-black text-[#D32F2F]">{getStatusSymbol(currentStatus?.name || '')}</span>
            <select 
              value={statusId}
              onChange={(e) => {
                setStatusId(e.target.value);
                handleUpdate("statusId", e.target.value);
              }}
              className="w-full bg-transparent text-xs font-black uppercase text-[#121212] dark:text-white focus:outline-none cursor-pointer"
              disabled={loading}
            >
              {project.issueStatuses?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">PRIORITY</label>
          <div className="bg-white dark:bg-[#181A20] px-2 py-1.5 border-2 border-[#121212]">
            <select 
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                handleUpdate("priority", e.target.value);
              }}
              className="w-full bg-transparent text-xs font-black uppercase text-[#121212] dark:text-white focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="NONE">NONE</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">OPERATOR</label>
          <div className="bg-white dark:bg-[#181A20] px-2 py-1.5 border-2 border-[#121212] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <select 
              value={assigneeId}
              onChange={(e) => {
                setAssigneeId(e.target.value);
                handleUpdate("assigneeId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs font-black uppercase text-[#121212] dark:text-white focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="">UNASSIGNED</option>
              {(project.workspace?.members || project.members)?.map((m: any) => (
                <option key={m.userId} value={m.userId}>{(m.user?.username || m.user?.email).toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimate */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">ESTIMATE</label>
          <div className="bg-white dark:bg-[#181A20] px-2 py-1.5 border-2 border-[#121212]">
            <input 
              type="number"
              min="0"
              placeholder="0 PT"
              value={estimate}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                setEstimate(val);
                handleUpdate("estimate", val === "" ? null : val);
              }}
              className="w-full bg-transparent text-xs font-mono font-black text-[#121212] dark:text-white focus:outline-none placeholder:text-neutral-400"
              disabled={loading}
            />
          </div>
        </div>

        {/* Cycle */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">CYCLE</label>
          <div className="bg-white dark:bg-[#181A20] px-2 py-1.5 border-2 border-[#121212] flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <select 
              value={cycleId}
              onChange={(e) => {
                setCycleId(e.target.value);
                handleUpdate("cycleId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs font-black uppercase text-[#121212] dark:text-white focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="">NO CYCLE</option>
              {cycles.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Module */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">MODULE</label>
          <div className="bg-white dark:bg-[#181A20] px-2 py-1.5 border-2 border-[#121212] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <select 
              value={moduleId}
              onChange={(e) => {
                setModuleId(e.target.value);
                handleUpdate("moduleId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs font-black uppercase text-[#121212] dark:text-white focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="">NO MODULE</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">DUE DATE</label>
          <div className="bg-white dark:bg-[#181A20] px-2 py-1.5 border-2 border-[#121212] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <input 
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                handleUpdate("dueDate", e.target.value ? new Date(e.target.value).toISOString() : null);
              }}
              className="w-full bg-transparent text-xs font-bold uppercase text-[#121212] dark:text-white focus:outline-none"
              disabled={loading}
            />
          </div>
        </div>

        {/* Labels Count Summary */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">LABELS</label>
          <div className="bg-white dark:bg-[#181A20] px-2 py-1.5 border-2 border-[#121212] flex items-center gap-1.5 text-xs font-black uppercase text-neutral-700 dark:text-neutral-300">
            <Tag className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>{labelIds.length} APPLIED</span>
          </div>
        </div>

      </div>

      {/* Applied Labels Selector */}
      {project.issueLabels && project.issueLabels.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-[#121212] dark:text-white">Applied Classifications</label>
          <div className="flex flex-wrap gap-2">
            {project.issueLabels.map((label: any) => {
              const isSelected = labelIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    let newLabelIds;
                    if (isSelected) {
                      newLabelIds = labelIds.filter(id => id !== label.id);
                    } else {
                      newLabelIds = [...labelIds, label.id];
                    }
                    setLabelIds(newLabelIds);
                    handleUpdate("labelIds", newLabelIds);
                  }}
                  className={`px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-[#121212] transition-all ${
                    isSelected 
                      ? 'bg-[#1976D2] text-white shadow-[2px_2px_0px_#121212]' 
                      : 'bg-white text-[#121212] hover:bg-[#FAF6EE]'
                  } disabled:opacity-50`}
                >
                  {label.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Linked PRs */}
      {issue.PullRequestIssue && issue.PullRequestIssue.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t-2 border-[#121212]">
          <label className="text-xs font-black uppercase text-[#121212] dark:text-white flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-[#1976D2]" />
            <span>Linked Pull Requests ({issue.PullRequestIssue.length})</span>
          </label>
          <div className="space-y-2">
            {issue.PullRequestIssue.map((prIssue: any) => (
              <PullRequestCard key={prIssue.pullRequest.id} pr={prIssue.pullRequest} />
            ))}
          </div>
        </div>
      )}

      {/* Description Area */}
      <div className="space-y-3 pt-4 border-t-2 border-[#121212]">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono font-black text-neutral-500 uppercase tracking-widest">SPECIFICATION BODY</h3>
          <button 
            onClick={() => {
              if(isEditingDesc && JSON.stringify(description) !== JSON.stringify(issue.description)) {
                handleUpdate("description", description);
              }
              setIsEditingDesc(!isEditingDesc);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 bg-[#FBC02D] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_#121212] hover:bg-[#F9A825] transition-all"
          >
            {isEditingDesc ? (
              <><Check className="w-3.5 h-3.5 text-emerald-800" /> <span>SAVE</span></>
            ) : (
              <><Edit3 className="w-3.5 h-3.5" /> <span>EDIT</span></>
            )}
          </button>
        </div>
        
        <div className="border-2 border-[#121212] dark:border-white p-4 bg-[#FAF6EE] dark:bg-[#111215]">
          <TiptapEditor 
            value={description} 
            onChange={setDescription} 
            editable={isEditingDesc} 
          />
        </div>
      </div>

    </div>
  );
}
