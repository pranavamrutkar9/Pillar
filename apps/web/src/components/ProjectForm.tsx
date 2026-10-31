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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md p-6 bg-white dark:bg-zinc-900 rounded-2xl border-3 border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff]">
      <div>
        <h3 className="text-sm font-black uppercase text-black dark:text-white">Create New Project</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">Initialize a tracking repository for your team.</p>
      </div>
      
      {error && (
        <div className="p-2.5 rounded-lg bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] text-black dark:text-white text-xs font-bold">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Core Engine"
          className="w-full px-3 py-2 text-sm rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] dark:focus:shadow-[3px_3px_0px_0px_#fff] transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Description (Optional)</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of project scope..."
          className="w-full px-3 py-2 text-sm rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] dark:focus:shadow-[3px_3px_0px_0px_#fff] transition-all"
        />
      </div>

      <div className="pt-1 flex items-center space-x-2.5">
        <input
          type="checkbox"
          id="hackathonMode"
          checked={isHackathonMode}
          onChange={(e) => setIsHackathonMode(e.target.checked)}
          className="w-4 h-4 rounded border-2 border-black text-black accent-[#FFE600] cursor-pointer"
        />
        <label htmlFor="hackathonMode" className="text-xs font-bold text-black dark:text-white cursor-pointer select-none">
          Enable Hackathon / Crunch Countdown
        </label>
      </div>

      {isHackathonMode && (
        <div>
          <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Target Deadline</label>
          <DatePicker
            selected={deadline ? new Date(deadline) : null}
            onChange={(date: Date | null) => setDeadline(date ? date.toISOString() : "")}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] dark:focus:shadow-[3px_3px_0px_0px_#fff] transition-all"
            placeholderText="Select deadline"
            required={isHackathonMode}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-black text-black bg-[#FFE600] hover:bg-[#FFDE59] border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
        ) : (
          <>
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Project</span>
          </>
        )}
      </button>
    </form>
  );
}
