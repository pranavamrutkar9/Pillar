"use client";

import { useState } from "react";
import { createProjectAction } from "../actions/projectActions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Loader2, Plus, Sparkles } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md p-5 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create New Project</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Initialize a tracking repository for your team.</p>
      </div>
      
      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Core Engine"
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description (Optional)</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of project scope..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
        />
      </div>

      <div className="pt-1 flex items-center space-x-2">
        <input
          type="checkbox"
          id="hackathonMode"
          checked={isHackathonMode}
          onChange={(e) => setIsHackathonMode(e.target.checked)}
          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 dark:focus:ring-zinc-100"
        />
        <label htmlFor="hackathonMode" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
          Enable Hackathon / Crunch Countdown
        </label>
      </div>

      {isHackathonMode && (
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Target Deadline</label>
          <DatePicker
            selected={deadline ? new Date(deadline) : null}
            onChange={(date: Date | null) => setDeadline(date ? date.toISOString() : "")}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
            placeholderText="Select deadline"
            required={isHackathonMode}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </>
        )}
      </button>
    </form>
  );
}
