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
    <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] border-3 border-black dark:border-white space-y-8">
      
      {/* Title & Key */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-black px-2.5 py-1 rounded bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {project.slug}-{issue.sequenceId}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-500">
              Created {format(new Date(issue.createdAt), 'MMM d, yyyy')}
            </span>
          </div>

          {loading && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-black">
              <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" /> Saving...
            </span>
          )}
        </div>

        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => { if(title !== issue.title) handleUpdate("title", title); }}
          className="text-2xl sm:text-3xl font-black tracking-tight w-full bg-white dark:bg-zinc-950 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] dark:focus:shadow-[3px_3px_0px_0px_#fff] rounded-xl px-3 py-2 transition-all"
        />
      </div>

      {/* Properties Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-amber-50/50 dark:bg-zinc-950 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
        
        {/* Status */}
        <div>
          <label className="text-[10px] font-mono font-black uppercase text-black dark:text-white block mb-1">Status</label>
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff]">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black" style={{ backgroundColor: statusColor }} />
            <select 
              value={statusId}
              onChange={(e) => {
                setStatusId(e.target.value);
                handleUpdate("statusId", e.target.value);
              }}
              className="w-full bg-transparent text-xs font-bold text-black dark:text-white focus:outline-none cursor-pointer"
              disabled={loading}
            >
              {project.issueStatuses?.map((s: any) => (
                <option key={s.id} value={s.id} className="text-black">{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-[10px] font-mono font-black uppercase text-black dark:text-white block mb-1">Priority</label>
          <div className="bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff]">
            <select 
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                handleUpdate("priority", e.target.value);
              }}
              className="w-full bg-transparent text-xs font-bold text-black dark:text-white focus:outline-none cursor-pointer"
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
          <label className="text-[10px] font-mono font-black uppercase text-black dark:text-white block mb-1">Assignee</label>
          <div className="bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-black dark:text-white shrink-0 stroke-[2.5]" />
            <select 
              value={assigneeId}
              onChange={(e) => {
                setAssigneeId(e.target.value);
                handleUpdate("assigneeId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs font-bold text-black dark:text-white focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="">Unassigned</option>
              {(project.workspace?.members || project.members)?.map((m: any) => (
                <option key={m.userId} value={m.userId} className="text-black">{m.user?.username || m.user?.email}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimate */}
        <div>
          <label className="text-[10px] font-mono font-black uppercase text-black dark:text-white block mb-1">Estimate</label>
          <div className="bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff]">
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
              className="w-full bg-transparent text-xs font-mono font-black text-black dark:text-white focus:outline-none"
              disabled={loading}
            />
          </div>
        </div>

        {/* Cycle */}
        <div>
          <label className="text-[10px] font-mono font-black uppercase text-black dark:text-white block mb-1">Cycle</label>
          <div className="bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff] flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-black dark:text-white shrink-0 stroke-[2.5]" />
            <select 
              value={cycleId}
              onChange={(e) => {
                setCycleId(e.target.value);
                handleUpdate("cycleId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs font-bold text-black dark:text-white focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="">No Cycle</option>
              {cycles.map((c: any) => (
                <option key={c.id} value={c.id} className="text-black">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Module */}
        <div>
          <label className="text-[10px] font-mono font-black uppercase text-black dark:text-white block mb-1">Module</label>
          <div className="bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-black dark:text-white shrink-0 stroke-[2.5]" />
            <select 
              value={moduleId}
              onChange={(e) => {
                setModuleId(e.target.value);
                handleUpdate("moduleId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs font-bold text-black dark:text-white focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="">No Module</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id} className="text-black">{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-[10px] font-mono font-black uppercase text-black dark:text-white block mb-1">Due Date</label>
          <div className="bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-black dark:text-white shrink-0 stroke-[2.5]" />
            <input 
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                handleUpdate("dueDate", e.target.value ? new Date(e.target.value).toISOString() : null);
              }}
              className="w-full bg-transparent text-xs font-bold text-black dark:text-white focus:outline-none"
              disabled={loading}
            />
          </div>
        </div>

        {/* Labels Count Summary */}
        <div>
          <label className="text-[10px] font-mono font-black uppercase text-black dark:text-white block mb-1">Labels</label>
          <div className="bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff] flex items-center gap-1.5 text-xs font-bold text-black dark:text-white">
            <Tag className="w-3.5 h-3.5 text-black dark:text-white shrink-0 stroke-[2.5]" />
            <span>{labelIds.length} applied</span>
          </div>
        </div>

      </div>

      {/* Labels Selector */}
      {project.issueLabels && project.issueLabels.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-black dark:text-white">Applied Labels</label>
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
                  className={`px-3 py-1 text-xs font-bold rounded-lg border-2 border-black transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000]' 
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-[1px_1px_0px_0px_#000]'
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
        <div className="space-y-3 pt-4 border-t-2 border-black dark:border-white">
          <label className="text-xs font-black uppercase text-black dark:text-white flex items-center gap-1.5">
            <GitPullRequest className="w-4 h-4 text-purple-600 stroke-[2.5]" />
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
      <div className="space-y-3 pt-4 border-t-2 border-black dark:border-white">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono font-black text-black dark:text-white uppercase tracking-wider">Description</h3>
          <button 
            onClick={() => {
              if(isEditingDesc && JSON.stringify(description) !== JSON.stringify(issue.description)) {
                handleUpdate("description", description);
              }
              setIsEditingDesc(!isEditingDesc);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black rounded-lg bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            {isEditingDesc ? (
              <><Check className="w-3.5 h-3.5 stroke-[3]" /> <span>Save</span></>
            ) : (
              <><Edit3 className="w-3.5 h-3.5 stroke-[2.5]" /> <span>Edit</span></>
            )}
          </button>
        </div>
        
        <div>
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
