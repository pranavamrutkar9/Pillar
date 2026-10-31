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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-xs border border-zinc-200/80 dark:border-zinc-800/80">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Create New Issue</h3>
          <p className="text-xs text-zinc-500">Capture a new task, bug, or feature request.</p>
        </div>
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200/60 dark:border-red-900/40">
          {error}
        </div>
      )}
      {success && (
        <div className="text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
          Issue created successfully!
        </div>
      )}
      
      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Issue Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement WebSocket heartbeat reconnection"
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/40">
          <TiptapEditor value={description} onChange={setDescription} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
          <select
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
            required
          >
            {statuses.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
          >
            <option value="NONE">None</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Assignee</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.user?.username || m.user?.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Estimate (Points)</label>
          <input
            type="number"
            min="0"
            value={estimate}
            onChange={(e) => setEstimate(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
            placeholder="e.g. 3"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cycle</label>
          <select
            value={cycleId}
            onChange={(e) => setCycleId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
          >
            <option value="">No Cycle</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Module</label>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:border-zinc-600 transition-colors"
          >
            <option value="">No Module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Labels</label>
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
                className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${
                  isSelected 
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium' 
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                }`}
              >
                {label.name}
              </button>
            );
          })}
          {labels.length === 0 && <span className="text-xs text-zinc-400">No labels configured</span>}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Create Issue</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
