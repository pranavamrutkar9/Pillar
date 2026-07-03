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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-6 w-full max-w-sm">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Create a Workspace</h2>
      <input
        type="text"
        placeholder="Workspace Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-black dark:text-white"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-md bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Workspace"}
      </button>
    </form>
  );
}
