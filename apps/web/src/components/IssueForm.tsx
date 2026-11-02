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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white dark:bg-[#181A20] p-6 border-4 border-[#121212] dark:border-white shadow-[8px_8px_0px_#121212] dark:shadow-[8px_8px_0px_#FFF] font-sans relative">
      {/* Bauhaus Top Triad Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 grid grid-cols-3">
        <div className="bg-[#D32F2F]" />
        <div className="bg-[#1976D2]" />
        <div className="bg-[#FBC02D]" />
      </div>

      <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212] pt-1">
        <div>
          <h3 className="text-base font-black uppercase tracking-tight text-[#121212] dark:text-white">CONSTRUCT NEW TICKET</h3>
          <p className="text-xs font-mono uppercase text-neutral-500">Record a discrete engineering task or architectural defect.</p>
        </div>
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 border-2 border-[#121212] hover:bg-[#D32F2F] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-[#D32F2F] text-white border-2 border-[#121212] text-xs font-black uppercase">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-600 text-white border-2 border-[#121212] text-xs font-black uppercase">
          Ticket constructed and linked to pipeline.
        </div>
      )}

      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-[#121212] dark:text-white mb-1">
          TICKET TITLE *
        </label>
        <input 
          type="text" 
          required 
          placeholder="e.g. Implement schema migration validation worker"
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-[#121212] bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-white focus:outline-none focus:border-[#D32F2F]"
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-[#121212] dark:text-white mb-1">
          SPECIFICATION DETAILS
        </label>
        <div className="border-2 border-[#121212] bg-[#FAF6EE] dark:bg-[#111215] p-2">
          <TiptapEditor value={description} onChange={setDescription} />
        </div>
      </div>

      {/* Grid of properties */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#FAF6EE] dark:bg-[#111215] border-2 border-[#121212]">
        
        <div>
          <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">STAGE</label>
          <select 
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="w-full px-2 py-1 text-xs font-black uppercase border-2 border-[#121212] bg-white dark:bg-[#181A20] text-[#121212] dark:text-white focus:outline-none"
          >
            {statuses.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">PRIORITY</label>
          <select 
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-2 py-1 text-xs font-black uppercase border-2 border-[#121212] bg-white dark:bg-[#181A20] text-[#121212] dark:text-white focus:outline-none"
          >
            <option value="NONE">NONE</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">OPERATOR</label>
          <select 
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-2 py-1 text-xs font-black uppercase border-2 border-[#121212] bg-white dark:bg-[#181A20] text-[#121212] dark:text-white focus:outline-none"
          >
            <option value="">UNASSIGNED</option>
            {members.map((m: any) => (
              <option key={m.userId} value={m.userId}>{(m.user?.username || m.user?.email).toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">ESTIMATE</label>
          <input 
            type="number"
            min="0"
            placeholder="POINTS"
            value={estimate}
            onChange={(e) => setEstimate(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
            className="w-full px-2 py-1 text-xs font-mono font-black border-2 border-[#121212] bg-white dark:bg-[#181A20] text-[#121212] dark:text-white focus:outline-none"
          />
        </div>

        {cycles.length > 0 && (
          <div>
            <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">CYCLE</label>
            <select 
              value={cycleId}
              onChange={(e) => setCycleId(e.target.value)}
              className="w-full px-2 py-1 text-xs font-black uppercase border-2 border-[#121212] bg-white dark:bg-[#181A20] text-[#121212] dark:text-white focus:outline-none"
            >
              <option value="">NO CYCLE</option>
              {cycles.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}

        {modules.length > 0 && (
          <div>
            <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">MODULE</label>
            <select 
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full px-2 py-1 text-xs font-black uppercase border-2 border-[#121212] bg-white dark:bg-[#181A20] text-[#121212] dark:text-white focus:outline-none"
            >
              <option value="">NO MODULE</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">DUE DATE</label>
          <input 
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-2 py-1 text-xs font-bold uppercase border-2 border-[#121212] bg-white dark:bg-[#181A20] text-[#121212] dark:text-white focus:outline-none"
          />
        </div>

      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-wider text-[#121212] dark:text-white">LABELS</label>
          <div className="flex flex-wrap gap-2">
            {labels.map((label: any) => {
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
                  className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border-2 border-[#121212] transition-all ${
                    isSelected 
                      ? 'bg-[#1976D2] text-white shadow-[2px_2px_0px_#121212]' 
                      : 'bg-white text-[#121212] hover:bg-[#FAF6EE]'
                  }`}
                >
                  {label.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-3 border-t-2 border-[#121212]">
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border-2 border-[#121212] font-black text-xs uppercase tracking-wider hover:bg-[#FAF6EE] text-[#121212] dark:text-white transition-colors"
          >
            DISCARD
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#121212] transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>CREATE TICKET</span>
        </button>
      </div>
    </form>
  );
}
