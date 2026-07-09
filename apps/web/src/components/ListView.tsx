"use client";

import React from 'react';
import { useProjectStore } from './ProjectStore';
import Link from 'next/link';

export default function ListView({ issues }: { issues: any[] }) {
  const { project, updateIssueStatusAndPosition } = useProjectStore();
  const statuses = project.issueStatuses || [];

  return (
    <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
      <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
        <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase font-medium border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Priority</th>
          </tr>
        </thead>
        <tbody>
          {issues.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No issues found.</td>
            </tr>
          ) : (
            issues.map(issue => (
              <tr key={issue.id} className="border-b border-zinc-100 dark:border-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  <Link href={`/projects/${project.id}/issues/${issue.sequenceId}`} className="hover:underline">
                    {project.slug}-{issue.sequenceId}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  <Link href={`/projects/${project.id}/issues/${issue.sequenceId}`} className="hover:underline">
                    {issue.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <select 
                    value={issue.statusId}
                    onChange={(e) => updateIssueStatusAndPosition(issue.id, e.target.value, issue.position || 0)}
                    className="bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 rounded px-2 py-1 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {issue.priority || 'No Priority'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
