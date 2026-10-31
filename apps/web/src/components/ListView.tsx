"use client";

import React from 'react';
import { useProjectStore } from './ProjectStore';
import Link from 'next/link';

function getStatusDot(statusName: string, customColor?: string) {
  if (customColor) return customColor;
  const name = statusName.toLowerCase();
  if (name.includes('done') || name.includes('complete') || name.includes('shipped')) return '#10b981';
  if (name.includes('progress') || name.includes('doing') || name.includes('active')) return '#f59e0b';
  if (name.includes('review') || name.includes('testing')) return '#a855f7';
  if (name.includes('todo') || name.includes('ready') || name.includes('unstarted')) return '#0ea5e9';
  return '#71717a';
}

function PriorityBadge({ priority }: { priority?: string }) {
  const p = (priority || '').toUpperCase();
  if (p === 'URGENT') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Urgent
      </span>
    );
  }
  if (p === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> High
      </span>
    );
  }
  if (p === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Med
      </span>
    );
  }
  if (p === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Low
      </span>
    );
  }
  return <span className="text-zinc-400 text-xs">-</span>;
}

export default function ListView({ issues }: { issues: any[] }) {
  const { project, updateIssueStatusAndPosition } = useProjectStore();
  const statuses = project.issueStatuses || [];

  return (
    <div className="overflow-x-auto border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 shadow-2xs">
      <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
        <thead className="bg-zinc-50/70 dark:bg-zinc-900/40 text-[11px] font-medium border-b border-zinc-200/80 dark:border-zinc-800/80 text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-mono font-normal w-24">Key</th>
            <th className="px-4 py-3 font-normal">Title</th>
            <th className="px-4 py-3 font-normal w-36">Status</th>
            <th className="px-4 py-3 font-normal w-28">Priority</th>
            <th className="px-4 py-3 font-normal w-24">Estimate</th>
            <th className="px-4 py-3 font-normal w-36">Cycle</th>
            <th className="px-4 py-3 font-normal w-36">Module</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {issues.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                No issues match your current filters.
              </td>
            </tr>
          ) : (
            issues.map(issue => {
              const currentStatus = statuses.find((s: any) => s.id === issue.statusId);
              const dotColor = getStatusDot(currentStatus?.name || '', currentStatus?.color);

              return (
                <tr 
                  key={issue.id} 
                  className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors group"
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">
                    <Link 
                      href={`/projects/${project.id}/issues/${issue.sequenceId}`} 
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      {project.slug}-{issue.sequenceId}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <Link 
                      href={`/projects/${project.id}/issues/${issue.sequenceId}`} 
                      className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline transition-colors block truncate max-w-md"
                    >
                      {issue.title}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                      <select 
                        value={issue.statusId}
                        onChange={(e) => updateIssueStatusAndPosition(issue.id, e.target.value, issue.position || 0)}
                        className="bg-transparent border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
                      >
                        {statuses.map((s: any) => (
                          <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <PriorityBadge priority={issue.priority} />
                  </td>

                  <td className="px-4 py-3">
                    {issue.estimate !== null && issue.estimate !== undefined ? (
                      <span className="font-mono text-[11px] text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800/50">
                        {issue.estimate}p
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {issue.cycle ? (
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800/50 truncate max-w-[130px] inline-block" title={issue.cycle.name}>
                        {issue.cycle.name}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {issue.module ? (
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800/50 truncate max-w-[130px] inline-block" title={issue.module.name}>
                        {issue.module.name}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
