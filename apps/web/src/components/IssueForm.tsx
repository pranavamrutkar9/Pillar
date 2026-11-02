"use client";

import { useState } from "react";
import { createIssueAction } from "../actions/issueActions";
import TiptapEditor from "./TiptapEditor";
import { Loader2, Plus, X } from "lucide-react";

interface IssueFormProps {
  projectId: string;
  statuses: any[];
  members?: any[];
  labels?: any[];
  cycles?: any[];
  modules?: any[];
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function IssueForm({ 
  projectId, 
  statuses, 
  members = [], 
  labels = [], 
  cycles = [], 
  modules = [],
  onClose,
  onSuccess
}: IssueFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<any>(null);
  const [statusId, setStatusId] = useState(statuses[0]?.id || "");
  const [priority, setPriority] = useState("NONE");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimate, setEstimate] = useState<number | "">("");
  const [cycleId, setCycleId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await createIssueAction(projectId, {
        title,
        description,
        statusId,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        estimate: estimate === "" ? undefined : estimate,
        cycleId: cycleId || undefined,
        moduleId: moduleId || undefined,
        labelIds,
      });
      setTitle("");
      setDescription(null);
      setStatusId(statuses[0]?.id || "");
      setPriority("NONE");
      setAssigneeId("");
      setDueDate("");
      setEstimate("");
      setCycleId("");
      setModuleId("");
      setLabelIds([]);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      if (onSuccess) onSuccess();
      if (onClose) setTimeout(onClose, 600);
    } catch (err: any) {
      setError(err.message || "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-[#141519] p-6 rounded-xl shadow-2xl border border-white/[0.1] font-sans text-white">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">Create New Issue</h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">Capture a new task, feature request, or engineering bug.</p>
        </div>
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="text-rose-400 text-xs bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
          {error}
        </div>
      )}
      {success && (
        <div className="text-emerald-400 text-xs bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
          Issue created successfully!
        </div>
      )}
      
      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-zinc-300">Issue Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement WebSocket heartbeat reconnection"
          className="linear-input w-full text-sm font-medium"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-zinc-300">Description</label>
        <div className="rounded-lg border border-white/[0.08] overflow-hidden bg-[#0D0E11]">
          <TiptapEditor value={description} onChange={setDescription} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-zinc-300">Status</label>
          <select
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="linear-input w-full text-xs"
            required
          >
            {statuses.map(s => (
              <option key={s.id} value={s.id} className="bg-[#141519] text-white">{s.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-zinc-300">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="linear-input w-full text-xs"
          >
            <option value="NONE" className="bg-[#141519] text-white">No Priority</option>
            <option value="LOW" className="bg-[#141519] text-white">Low</option>
            <option value="MEDIUM" className="bg-[#141519] text-white">Medium</option>
            <option value="HIGH" className="bg-[#141519] text-white">High</option>
            <option value="URGENT" className="bg-[#141519] text-white">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-zinc-300">Assignee</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="linear-input w-full text-xs"
          >
            <option value="" className="bg-[#141519] text-white">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId} className="bg-[#141519] text-white">
                {m.user?.username || m.user?.email}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-zinc-300">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="linear-input w-full text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-zinc-300">Estimate (Points)</label>
          <input
            type="number"
            min="0"
            value={estimate}
            onChange={(e) => setEstimate(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
            className="linear-input w-full text-xs"
            placeholder="e.g. 3"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-zinc-300">Cycle</label>
          <select
            value={cycleId}
            onChange={(e) => setCycleId(e.target.value)}
            className="linear-input w-full text-xs"
          >
            <option value="" className="bg-[#141519] text-white">No Cycle</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#141519] text-white">{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-zinc-300">Module</label>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="linear-input w-full text-xs"
          >
            <option value="" className="bg-[#141519] text-white">No Module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#141519] text-white">{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-zinc-300">Labels</label>
        <div className="flex flex-wrap gap-1.5">
          {labels.map(label => {
            const isSelected = labelIds.includes(label.id);
            return (
              <button
                key={label.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setLabelIds(labelIds.filter(id => id !== label.id));
                  } else {
                    setLabelIds([...labelIds, label.id]);
                  }
                }}
                className={`px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#5E6AD2]/20 text-[#8B96FF] border-[#5E6AD2]/40 font-medium' 
                    : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16]'
                }`}
              >
                {label.name}
              </button>
            );
          })}
          {labels.length === 0 && <span className="text-xs text-zinc-500">No labels configured</span>}
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="linear-btn-secondary text-xs"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="linear-btn-primary shadow-linear-glow text-xs disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Creating...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Issue</span>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
