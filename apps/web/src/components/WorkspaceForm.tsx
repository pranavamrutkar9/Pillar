"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkspaceAction } from "@/actions/workspaceActions";

export default function WorkspaceForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await createWorkspaceAction({ name });
      if (res.workspace) {
        setName("");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-sans text-xs">
      {error && (
        <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-zinc-400">Workspace name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Corp"
          className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.08] text-white text-xs outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-md bg-gradient-to-b from-[#5E6AD2] to-[#4B55C1] hover:brightness-110 text-white font-medium text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Creating..." : "Create Workspace"}
      </button>
    </form>
  );
}
