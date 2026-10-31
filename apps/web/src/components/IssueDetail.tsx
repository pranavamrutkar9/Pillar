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
  Clock, 
  Loader2,
  Check,
  Edit3
} from "lucide-react";

function getStatusDot(statusName: string, customColor?: string) {
  if (customColor) return customColor;
  const name = statusName.toLowerCase();
  if (name.includes('done') || name.includes('complete') || name.includes('shipped')) return '#10b981';
  if (name.includes('progress') || name.includes('doing') || name.includes('active')) return '#f59e0b';
  if (name.includes('review') || name.includes('testing')) return '#a855f7';
  if (name.includes('todo') || name.includes('ready') || name.includes('unstarted')) return '#0ea5e9';
  return '#71717a';
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
  const statusColor = getStatusDot(currentStatus?.name || '', currentStatus?.color);

  return (
    <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-2xl shadow-xs border border-zinc-200/80 dark:border-zinc-800/80 space-y-8">
      
      {/* Title & Key */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-zinc-400 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60">
              {project.slug}-{issue.sequenceId}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Created {format(new Date(issue.createdAt), 'MMM d, yyyy')}
            </span>
          </div>

          {loading && (
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
        </div>

        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => { if(title !== issue.title) handleUpdate("title", title); }}
          className="text-2xl sm:text-3xl font-semibold tracking-tight w-full bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 rounded-lg px-1.5 py-1 -ml-1.5 transition-all"
        />
      </div>

      {/* Properties Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
        
        {/* Status */}
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Status</label>
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
            <select 
              value={statusId}
              onChange={(e) => {
                setStatusId(e.target.value);
                handleUpdate("statusId", e.target.value);
              }}
              className="w-full bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              {project.issueStatuses?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Priority</label>
          <div className="bg-white dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <select 
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                handleUpdate("priority", e.target.value);
              }}
              className="w-full bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="NONE">None</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Assignee</label>
          <div className="bg-white dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select 
              value={assigneeId}
              onChange={(e) => {
                setAssigneeId(e.target.value);
                handleUpdate("assigneeId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="">Unassigned</option>
              {(project.workspace?.members || project.members)?.map((m: any) => (
                <option key={m.userId} value={m.userId}>{m.user?.username || m.user?.email}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimate */}
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Estimate</label>
          <div className="bg-white dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <input 
              type="number"
              min="0"
              placeholder="0 points"
              value={estimate}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                setEstimate(val);
                handleUpdate("estimate", val === "" ? null : val);
              }}
              className="w-full bg-transparent text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
              disabled={loading}
            />
          </div>
        </div>

        {/* Cycle */}
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Cycle</label>
          <div className="bg-white dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select 
              value={cycleId}
              onChange={(e) => {
                setCycleId(e.target.value);
                handleUpdate("cycleId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="">No Cycle</option>
              {cycles.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Module */}
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Module</label>
          <div className="bg-white dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select 
              value={moduleId}
              onChange={(e) => {
                setModuleId(e.target.value);
                handleUpdate("moduleId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="">No Module</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Due Date</label>
          <div className="bg-white dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input 
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                handleUpdate("dueDate", e.target.value ? new Date(e.target.value).toISOString() : null);
              }}
              className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
              disabled={loading}
            />
          </div>
        </div>

        {/* Labels Count Summary */}
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Labels</label>
          <div className="bg-white dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{labelIds.length} applied</span>
          </div>
        </div>

      </div>

      {/* Labels Selector */}
      {project.issueLabels && project.issueLabels.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Applied Labels</label>
          <div className="flex flex-wrap gap-1.5">
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
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  } disabled:opacity-50`}
                >
                  {label.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pull Requests Integration */}
      {issue.PullRequestIssue && issue.PullRequestIssue.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <GitPullRequest className="w-4 h-4 text-purple-500" />
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
      <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">Description</h3>
          <button 
            onClick={() => {
              if(isEditingDesc && JSON.stringify(description) !== JSON.stringify(issue.description)) {
                handleUpdate("description", description);
              }
              setIsEditingDesc(!isEditingDesc);
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {isEditingDesc ? (
              <><Check className="w-3.5 h-3.5 text-emerald-500" /> <span>Save</span></>
            ) : (
              <><Edit3 className="w-3.5 h-3.5" /> <span>Edit</span></>
            )}
          </button>
        </div>
        
        <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden bg-white dark:bg-zinc-950 p-2">
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
