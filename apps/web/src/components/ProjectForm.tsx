"use client";

import { useState } from "react";
import { createProjectAction } from "../actions/projectActions";

export default function ProjectForm({ workspaceId }: { workspaceId: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createProjectAction(workspaceId, name, undefined as any, description);
      setName("");
      setDescription("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md p-6 bg-white dark:bg-zinc-950 rounded-lg shadow border border-gray-100 dark:border-zinc-800">
      <h3 className="text-lg font-medium text-black dark:text-white">Create Project</h3>
      
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full bg-transparent rounded-md border-gray-300 dark:border-zinc-700 shadow-sm p-2 border"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full bg-transparent rounded-md border-gray-300 dark:border-zinc-700 shadow-sm p-2 border"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
      >
        {loading ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}
