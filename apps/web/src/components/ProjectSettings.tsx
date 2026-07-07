"use client";

import { useState } from "react";
import { createStatusAction, updateStatusAction, deleteStatusAction, createLabelAction, updateLabelAction, deleteLabelAction } from "../actions/settingsActions";

export default function ProjectSettings({ project }: { project: any }) {
  const [statuses, setStatuses] = useState<any[]>(project.issueStatuses || []);
  const [labels, setLabels] = useState<any[]>(project.issueLabels || []);
  
  const [newStatusName, setNewStatusName] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName) return;
    setLoading(true);
    setError("");
    try {
      const status = await createStatusAction(project.id, { name: newStatusName });
      setStatuses([...statuses, status]);
      setNewStatusName("");
    } catch (err: any) {
      setError(err.message || "Failed to create status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    if (confirmDelete !== statusId) {
      setConfirmDelete(statusId);
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await deleteStatusAction(project.id, statusId);
      setStatuses(statuses.filter((s) => s.id !== statusId));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete status");
      setConfirmDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (statusId: string, updates: any) => {
    setLoading(true);
    setError("");
    try {
      const updated = await updateStatusAction(project.id, statusId, updates);
      setStatuses(statuses.map((s) => (s.id === statusId ? updated : s)));
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName) return;
    setLoading(true);
    setError("");
    try {
      const label = await createLabelAction(project.id, { name: newLabelName, color: newLabelColor });
      setLabels([...labels, label]);
      setNewLabelName("");
    } catch (err: any) {
      setError(err.message || "Failed to create label");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (confirmDelete !== labelId) {
      setConfirmDelete(labelId);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await deleteLabelAction(project.id, labelId);
      setLabels(labels.filter((l) => l.id !== labelId));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete label");
      setConfirmDelete(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
      <section className="bg-white dark:bg-zinc-950 p-6 rounded-lg shadow border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Statuses</h2>
        <div className="space-y-4 mb-6">
          {statuses.map((status) => (
            <div key={status.id} className="flex items-center justify-between p-3 border rounded-md dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={status.name}
                  onChange={(e) => handleUpdateStatus(status.id, { name: e.target.value })}
                  className="bg-transparent font-medium focus:outline-none focus:border-b border-gray-300"
                  disabled={loading}
                />
              </div>
              <button
                onClick={() => handleDeleteStatus(status.id)}
                disabled={loading}
                className={`text-sm disabled:opacity-50 ${confirmDelete === status.id ? 'text-red-700 font-bold bg-red-100 px-2 py-1 rounded' : 'text-red-500 hover:text-red-700'}`}
              >
                {confirmDelete === status.id ? 'Confirm?' : 'Delete'}
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddStatus} className="flex gap-2">
          <input
            type="text"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            placeholder="New status name..."
            className="flex-1 bg-transparent rounded-md border-gray-300 dark:border-zinc-700 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newStatusName}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </section>

      <section className="bg-white dark:bg-zinc-950 p-6 rounded-lg shadow border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Labels</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {labels.map((label) => (
            <div key={label.id} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-zinc-900 border rounded-full text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color || "#000" }}></span>
              <span>{label.name}</span>
              <button
                onClick={() => handleDeleteLabel(label.id)}
                disabled={loading}
                className={`ml-2 text-sm disabled:opacity-50 ${confirmDelete === label.id ? 'text-red-600 font-bold' : 'text-gray-400 hover:text-red-500'}`}
              >
                {confirmDelete === label.id ? 'Sure?' : '\u00d7'}
              </button>
            </div>
          ))}
          {labels.length === 0 && <span className="text-sm text-gray-500">No labels defined.</span>}
        </div>

        <form onSubmit={handleAddLabel} className="flex gap-2">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="New label name..."
            className="flex-1 bg-transparent rounded-md border-gray-300 dark:border-zinc-700 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <input
            type="color"
            value={newLabelColor}
            onChange={(e) => setNewLabelColor(e.target.value)}
            className="p-1 h-10 w-10 border rounded bg-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newLabelName}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </section>
    </div>
  );
}
