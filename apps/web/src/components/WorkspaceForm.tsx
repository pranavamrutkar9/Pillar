"use client";

import { useState } from "react";
import { createWorkspaceAction } from "../actions/workspaceActions";
import { Loader2, Plus } from "lucide-react";

export function WorkspaceForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await createWorkspaceAction(name);
      setName("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Create a new workspace
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Organize projects, team members, and architecture records in one place.
        </p>
      </div>

      {error && (
        <div className="p-2 rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="workspace-name"
          type="text"
          placeholder="e.g. Acme Engineering"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
