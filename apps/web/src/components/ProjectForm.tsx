"use client";

import { useState } from "react";
import { createProjectAction } from "../actions/projectActions";
import { Loader2, Plus, Flame } from "lucide-react";

export default function ProjectForm({ workspaceId }: { workspaceId: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isHackathonMode, setIsHackathonMode] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createProjectAction(workspaceId, name, undefined as any, description, isHackathonMode, deadline);
      setName("");
      setDescription("");
      setIsHackathonMode(false);
      setDeadline("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md p-5 bg-[#111215] rounded-xl border border-white/[0.08] shadow-linear-card font-sans">
      <div>
        <h3 className="text-sm font-semibold text-white">Create New Project</h3>
        <p className="text-[11px] text-zinc-400 mt-0.5">Initialize a tracking repository for your team.</p>
      </div>
      
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}
      
      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-zinc-300">Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Core Engine"
          className="linear-input w-full"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-zinc-300">Description (Optional)</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of project scope..."
          className="linear-input w-full resize-none"
        />
      </div>

      <div className="pt-1 flex items-center space-x-2.5">
        <input
          type="checkbox"
          id="hackathonMode"
          checked={isHackathonMode}
          onChange={(e) => setIsHackathonMode(e.target.checked)}
          className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.04] text-[#5E6AD2] focus:ring-[#5E6AD2] cursor-pointer"
        />
        <label htmlFor="hackathonMode" className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 cursor-pointer">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Enable Crunch / Hackathon Countdown</span>
        </label>
      </div>

      {isHackathonMode && (
        <div className="space-y-1.5 pl-6 border-l border-white/[0.08]">
          <label className="block text-[11px] font-medium text-zinc-400">Target Deadline</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="linear-input w-full"
            required={isHackathonMode}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="linear-btn-primary w-full py-2 shadow-linear-glow disabled:opacity-50 mt-2"
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Creating Project...</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </span>
        )}
      </button>
    </form>
  );
}
