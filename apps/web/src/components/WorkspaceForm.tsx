"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkspaceAction } from "@/actions/workspaceActions";
import { Plus, Loader2 } from "lucide-react";

export function WorkspaceForm() {
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
      await createWorkspaceAction(name);
      setName("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-sans text-xs">
      {error && (
        <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-zinc-300">Workspace Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Engineering"
          className="linear-input w-full"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="linear-btn-primary w-full py-2 shadow-linear-glow disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Creating...</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Workspace</span>
          </span>
        )}
      </button>
    </form>
  );
}

export default WorkspaceForm;
