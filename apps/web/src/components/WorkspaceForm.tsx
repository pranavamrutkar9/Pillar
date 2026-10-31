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
        <h3 className="text-sm font-black uppercase text-black dark:text-white">
          Create New Workspace
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
          Organize projects, cycles, team members, and ADRs in one hub.
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] text-black dark:text-white text-xs font-bold">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          id="workspace-name"
          type="text"
          placeholder="e.g. Acme Engineering"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border-2 border-black dark:border-white rounded-lg bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] dark:focus:shadow-[3px_3px_0px_0px_#fff] transition-all"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-4 py-2 text-xs font-black rounded-lg bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
