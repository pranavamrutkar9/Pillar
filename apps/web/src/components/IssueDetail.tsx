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

function getStatusDot(statusName: string, customColor?: string) {
  if (customColor) return customColor;
  const name = statusName.toLowerCase();
  if (name.includes('done') || name.includes('complete') || name.includes('shipped')) return '#5E6AD2';
  if (name.includes('progress') || name.includes('doing') || name.includes('active')) return '#F5A623';
  if (name.includes('review') || name.includes('testing')) return '#8B5CF6';
  if (name.includes('todo') || name.includes('ready') || name.includes('unstarted')) return '#38BDF8';
  return '#626773';
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
    <div className="bg-[#111215] p-6 sm:p-8 rounded-xl border border-white/[0.08] shadow-2xl space-y-7">
      
      {/* Title & Key */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-[#8A8F98] px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
              {project.slug}-{issue.sequenceId}
            </span>
            <span className="text-xs text-[#626773] font-mono">
              Created {format(new Date(issue.createdAt), 'MMM d, yyyy')}
            </span>
          </div>

          {loading && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#5E6AD2] font-mono">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
        </div>

        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => { if(title !== issue.title) handleUpdate("title", title); }}
          className="text-xl sm:text-2xl font-semibold tracking-tight w-full bg-transparent text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-[#5E6AD2]/60 rounded-md px-2 py-1 -ml-2 transition-all border border-transparent hover:border-white/[0.06]"
        />
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-[#141519] border border-white/[0.06]">
        
        {/* Status */}
        <div>
          <label className="text-[10px] font-mono uppercase text-[#626773] block mb-1">Status</label>
          <div className="flex items-center gap-1.5 bg-[#0B0C0E] px-2.5 py-1.5 rounded-md border border-white/[0.08]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
            <select 
              value={statusId}
              onChange={(e) => {
                setStatusId(e.target.value);
                handleUpdate("statusId", e.target.value);
              }}
              className="w-full bg-transparent text-xs font-medium text-[#EDEDED] focus:outline-none cursor-pointer"
              disabled={loading}
            >
              {project.issueStatuses?.map((s: any) => (
                <option key={s.id} value={s.id} className="bg-[#141519] text-[#EDEDED]">{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-[10px] font-mono uppercase text-[#626773] block mb-1">Priority</label>
          <div className="bg-[#0B0C0E] px-2.5 py-1.5 rounded-md border border-white/[0.08]">
            <select 
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                handleUpdate("priority", e.target.value);
              }}
              className="w-full bg-transparent text-xs font-medium text-[#EDEDED] focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="NONE" className="bg-[#141519] text-[#EDEDED]">None</option>
              <option value="LOW" className="bg-[#141519] text-[#EDEDED]">Low</option>
              <option value="MEDIUM" className="bg-[#141519] text-[#EDEDED]">Medium</option>
              <option value="HIGH" className="bg-[#141519] text-[#EDEDED]">High</option>
              <option value="URGENT" className="bg-[#141519] text-[#EDEDED]">Urgent</option>
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="text-[10px] font-mono uppercase text-[#626773] block mb-1">Assignee</label>
          <div className="bg-[#0B0C0E] px-2.5 py-1.5 rounded-md border border-white/[0.08] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#626773] shrink-0" />
            <select 
              value={assigneeId}
              onChange={(e) => {
                setAssigneeId(e.target.value);
                handleUpdate("assigneeId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs font-medium text-[#EDEDED] focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="" className="bg-[#141519] text-[#EDEDED]">Unassigned</option>
              {(project.workspace?.members || project.members)?.map((m: any) => (
                <option key={m.userId} value={m.userId} className="bg-[#141519] text-[#EDEDED]">{m.user?.username || m.user?.email}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimate */}
        <div>
          <label className="text-[10px] font-mono uppercase text-[#626773] block mb-1">Estimate</label>
          <div className="bg-[#0B0C0E] px-2.5 py-1.5 rounded-md border border-white/[0.08]">
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
              className="w-full bg-transparent text-xs font-mono font-medium text-[#EDEDED] focus:outline-none placeholder:text-[#626773]"
              disabled={loading}
            />
          </div>
        </div>

        {/* Cycle */}
        <div>
          <label className="text-[10px] font-mono uppercase text-[#626773] block mb-1">Cycle</label>
          <div className="bg-[#0B0C0E] px-2.5 py-1.5 rounded-md border border-white/[0.08] flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-[#626773] shrink-0" />
            <select 
              value={cycleId}
              onChange={(e) => {
                setCycleId(e.target.value);
                handleUpdate("cycleId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs text-[#EDEDED] focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="" className="bg-[#141519] text-[#EDEDED]">No Cycle</option>
              {cycles.map((c: any) => (
                <option key={c.id} value={c.id} className="bg-[#141519] text-[#EDEDED]">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Module */}
        <div>
          <label className="text-[10px] font-mono uppercase text-[#626773] block mb-1">Module</label>
          <div className="bg-[#0B0C0E] px-2.5 py-1.5 rounded-md border border-white/[0.08] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#626773] shrink-0" />
            <select 
              value={moduleId}
              onChange={(e) => {
                setModuleId(e.target.value);
                handleUpdate("moduleId", e.target.value || null);
              }}
              className="w-full bg-transparent text-xs text-[#EDEDED] focus:outline-none cursor-pointer"
              disabled={loading}
            >
              <option value="" className="bg-[#141519] text-[#EDEDED]">No Module</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id} className="bg-[#141519] text-[#EDEDED]">{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-[10px] font-mono uppercase text-[#626773] block mb-1">Due Date</label>
          <div className="bg-[#0B0C0E] px-2.5 py-1.5 rounded-md border border-white/[0.08] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#626773] shrink-0" />
            <input 
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                handleUpdate("dueDate", e.target.value ? new Date(e.target.value).toISOString() : null);
              }}
              className="w-full bg-transparent text-xs text-[#EDEDED] focus:outline-none [color-scheme:dark]"
              disabled={loading}
            />
          </div>
        </div>

        {/* Labels Count Summary */}
        <div>
          <label className="text-[10px] font-mono uppercase text-[#626773] block mb-1">Labels</label>
          <div className="bg-[#0B0C0E] px-2.5 py-1.5 rounded-md border border-white/[0.08] flex items-center gap-1.5 text-xs text-[#8A8F98]">
            <Tag className="w-3.5 h-3.5 text-[#626773] shrink-0" />
            <span>{labelIds.length} applied</span>
          </div>
        </div>

      </div>

      {/* Labels Selector */}
      {project.issueLabels && project.issueLabels.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#8A8F98]">Applied Labels</label>
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
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    isSelected 
                      ? 'bg-[#5E6AD2]/20 text-[#8B96FF] border-[#5E6AD2]/50 font-medium' 
                      : 'bg-white/[0.03] border-white/[0.08] text-[#8A8F98] hover:text-[#EDEDED] hover:border-white/20'
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
        <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
          <label className="text-xs font-medium text-[#EDEDED] flex items-center gap-1.5">
            <GitPullRequest className="w-4 h-4 text-[#5E6AD2]" />
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
      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono font-medium text-[#626773] uppercase tracking-wider">Description</h3>
          <button 
            onClick={() => {
              if(isEditingDesc && JSON.stringify(description) !== JSON.stringify(issue.description)) {
                handleUpdate("description", description);
              }
              setIsEditingDesc(!isEditingDesc);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED] transition-colors"
          >
            {isEditingDesc ? (
              <><Check className="w-3.5 h-3.5 text-[#5E6AD2]" /> <span>Save</span></>
            ) : (
              <><Edit3 className="w-3.5 h-3.5" /> <span>Edit</span></>
            )}
          </button>
        </div>
        
        <div className="rounded-lg border border-white/[0.08] overflow-hidden bg-[#141519] p-3 text-[#EDEDED]">
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
