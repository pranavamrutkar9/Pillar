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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] border-3 border-black dark:border-white">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
        <div>
          <h3 className="text-base font-black text-black dark:text-white uppercase tracking-wider">Create New Issue</h3>
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Capture a new task, bug, or feature request.</p>
        </div>
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="text-black bg-[#FF6B6B]/20 font-bold text-xs p-2.5 rounded-lg border-2 border-[#FF6B6B]">
          {error}
        </div>
      )}
      {success && (
        <div className="text-black bg-[#4ADE80]/30 font-bold text-xs p-2.5 rounded-lg border-2 border-[#4ADE80]">
          Issue created successfully!
        </div>
      )}
      
      <div>
        <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Issue Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement WebSocket heartbeat reconnection"
          className="w-full px-3 py-2 text-sm font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Description</label>
        <div>
          <TiptapEditor value={description} onChange={setDescription} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Status</label>
          <select
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all cursor-pointer"
            required
          >
            {statuses.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all cursor-pointer"
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
          <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Assignee</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all cursor-pointer"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.user?.username || m.user?.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Estimate (Points)</label>
          <input
            type="number"
            min="0"
            value={estimate}
            onChange={(e) => setEstimate(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all"
            placeholder="e.g. 3"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Cycle</label>
          <select
            value={cycleId}
            onChange={(e) => setCycleId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all cursor-pointer"
          >
            <option value="">No Cycle</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Module</label>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all cursor-pointer"
          >
            <option value="">No Module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Labels</label>
        <div className="flex flex-wrap gap-2">
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
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border-2 border-black transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000]' 
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-[1px_1px_0px_0px_#000]'
                }`}
              >
                {label.name}
              </button>
            );
          })}
          {labels.length === 0 && <span className="text-xs text-zinc-500 font-bold">No labels configured</span>}
        </div>
      </div>

      <div className="pt-3 flex items-center justify-end gap-3 border-t-2 border-black dark:border-white">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-black rounded-lg text-black dark:text-white hover:underline transition-all cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-black text-black bg-[#FFE600] hover:bg-[#FFDE59] border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Issue</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
