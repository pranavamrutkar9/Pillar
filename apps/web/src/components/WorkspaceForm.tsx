"use client";

import { useState } from "react";
import { createWorkspaceAction } from "../actions/workspaceActions";

export function WorkspaceForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createWorkspaceAction(name);
      setName("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <label htmlFor="workspace-name" className="text-sm font-semibold text-black dark:text-white">
        Create a new workspace
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="workspace-name"
          type="text"
          placeholder="Workspace Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#111] text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 font-medium rounded-md bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 min-w-[100px] flex items-center justify-center"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
