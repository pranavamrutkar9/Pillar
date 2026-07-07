"use client";

import { useState } from "react";
import { createIssueAction } from "../actions/issueActions";
import TiptapEditor from "./TiptapEditor";

export default function IssueForm({ projectId, statuses, members = [], labels = [] }: { projectId: string, statuses: any[], members?: any[], labels?: any[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<any>(null);
  const [statusId, setStatusId] = useState(statuses[0]?.id || "");
  const [priority, setPriority] = useState("NONE");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await createIssueAction(projectId, {
        title,
        description,
        statusId,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        labelIds,
      });
      setTitle("");
      setDescription(null);
      setStatusId(statuses[0]?.id || "");
      setPriority("NONE");
      setAssigneeId("");
      setDueDate("");
      setLabelIds([]);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white dark:bg-zinc-950 p-6 rounded-lg shadow border border-gray-100 dark:border-zinc-800">
      <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">Create New Issue</h3>
      
      {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
      {success && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">Issue created!</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full bg-transparent rounded-md border-gray-300 dark:border-zinc-700 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <div className="mt-1">
          <TiptapEditor value={description} onChange={setDescription} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="mt-1 block w-full bg-transparent dark:bg-zinc-900 rounded-md border-gray-300 dark:border-zinc-700 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {statuses.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-1 block w-full bg-transparent dark:bg-zinc-900 rounded-md border-gray-300 dark:border-zinc-700 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="NONE">None</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignee</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="mt-1 block w-full bg-transparent dark:bg-zinc-900 rounded-md border-gray-300 dark:border-zinc-700 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.user?.username || m.user?.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full bg-transparent dark:bg-zinc-900 rounded-md border-gray-300 dark:border-zinc-700 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Labels</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {labels.map(label => {
            const isSelected = labelIds.includes(label.id);
            return (
              <button
                key={label.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setLabelIds(labelIds.filter(id => id !== label.id));
                  } else {
                    setLabelIds([...labelIds, label.id]);
                  }
                }}
                className={`px-2 py-1 text-xs rounded-full border ${isSelected ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300'}`}
              >
                {label.name}
              </button>
            )
          })}
          {labels.length === 0 && <span className="text-xs text-gray-400">No labels available</span>}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Issue"}
        </button>
      </div>
    </form>
  );
}
