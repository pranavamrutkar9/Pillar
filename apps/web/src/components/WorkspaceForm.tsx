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
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {error && (
        <div className="p-2 border-2 border-[#D32F2F] bg-[#D32F2F]/10 text-[#D32F2F] text-xs font-bold">
          {error}
        </div>
      )}
      <div className="space-y-1">
        <label className="text-xs font-black uppercase">WORKSPACE DESIGNATION</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bauhaus Weimar"
          className="w-full p-2.5 bg-white dark:bg-[#181A20] border-2 border-[#121212] dark:border-white text-xs font-bold outline-none focus:border-[#1976D2]"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[#1976D2] hover:bg-[#0D47A1] text-white font-black text-xs uppercase tracking-wider border-2 border-[#121212] shadow-[2px_2px_0px_#121212] transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? "CREATING..." : "COMMIT WORKSPACE [→]"}
      </button>
    </form>
  );
}
