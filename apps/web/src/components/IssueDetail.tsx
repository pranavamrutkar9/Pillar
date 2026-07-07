"use client";

import { useState } from "react";
import { updateIssueAction } from "../actions/issueActions";
import TiptapEditor from "./TiptapEditor";
import { format } from "date-fns";

export default function IssueDetail({ issue, project }: { issue: any, project: any }) {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);
  const [statusId, setStatusId] = useState(issue.statusId);
  const [priority, setPriority] = useState(issue.priority);
  const [assigneeId, setAssigneeId] = useState(issue.assigneeId || "");
  const [dueDate, setDueDate] = useState(issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : "");
  const [labelIds, setLabelIds] = useState<string[]>(issue.labels?.map((l: any) => l.label.id) || []);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (field: string, value: any) => {
    setLoading(true);
    try {
      await updateIssueAction(issue.projectId, issue.id, { [field]: value });
    } catch (err) {
      console.error(err);
      alert("Failed to update issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 p-6 rounded-lg shadow border border-gray-100 dark:border-zinc-800 space-y-6">
      <div className="flex justify-between items-start">
        <div className="w-full">
          <span className="text-sm font-semibold text-gray-500 mb-2 block">{project.slug}-{issue.sequenceId}</span>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => { if(title !== issue.title) handleUpdate("title", title); }}
            className="text-2xl font-bold w-full bg-transparent focus:outline-none focus:border-b border-dashed border-gray-300 dark:border-zinc-700"
          />
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-zinc-800 pb-4">
        <div>
          <label className="text-xs text-gray-500 uppercase">Status</label>
          <select 
            value={statusId}
            onChange={(e) => {
              setStatusId(e.target.value);
              handleUpdate("statusId", e.target.value);
            }}
            className="block mt-1 bg-gray-50 dark:bg-zinc-900 border-transparent rounded text-sm focus:ring-blue-500"
            disabled={loading}
          >
            {project.issueStatuses?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase">Priority</label>
          <select 
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              handleUpdate("priority", e.target.value);
            }}
            className="block mt-1 bg-gray-50 dark:bg-zinc-900 border-transparent rounded text-sm focus:ring-blue-500"
            disabled={loading}
          >
            <option value="NONE">None</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        
        <div>
          <label className="text-xs text-gray-500 uppercase">Assignee</label>
          <select 
            value={assigneeId}
            onChange={(e) => {
              setAssigneeId(e.target.value);
              handleUpdate("assigneeId", e.target.value || null);
            }}
            className="block mt-1 bg-gray-50 dark:bg-zinc-900 border-transparent rounded text-sm focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">Unassigned</option>
            {project.members?.map((m: any) => (
              <option key={m.userId} value={m.userId}>{m.user?.username || m.user?.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase">Due Date</label>
          <input 
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              handleUpdate("dueDate", e.target.value ? new Date(e.target.value).toISOString() : null);
            }}
            className="block mt-1 bg-gray-50 dark:bg-zinc-900 border-transparent rounded text-sm focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-500 uppercase">Created</label>
          <div className="mt-2 text-sm">{format(new Date(issue.createdAt), 'MMM d, yyyy')}</div>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-zinc-800 pb-4">
        <label className="text-xs text-gray-500 uppercase block mb-2">Labels</label>
        <div className="flex flex-wrap gap-2">
          {project.issueLabels?.map((label: any) => {
            const isSelected = labelIds.includes(label.id);
            return (
              <button
                key={label.id}
                type="button"
                disabled={loading}
                onClick={() => {
                  let newLabelIds;
                  if (isSelected) {
                    newLabelIds = labelIds.filter(id => id !== label.id);
                  } else {
                    newLabelIds = [...labelIds, label.id];
                  }
                  setLabelIds(newLabelIds);
                  handleUpdate("labelIds", newLabelIds);
                }}
                className={`px-2 py-1 text-xs rounded-full border ${isSelected ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300'} disabled:opacity-50`}
              >
                {label.name}
              </button>
            )
          })}
          {(!project.issueLabels || project.issueLabels.length === 0) && <span className="text-xs text-gray-400">No labels available</span>}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">Description</h3>
          <button 
            onClick={() => {
              if(isEditingDesc && JSON.stringify(description) !== JSON.stringify(issue.description)) {
                handleUpdate("description", description);
              }
              setIsEditingDesc(!isEditingDesc);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isEditingDesc ? "Save" : "Edit"}
          </button>
        </div>
        
        <TiptapEditor 
          value={description} 
          onChange={setDescription} 
          editable={isEditingDesc} 
        />
      </div>
    </div>
  );
}
