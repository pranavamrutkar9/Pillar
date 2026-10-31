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
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-black bg-[#FF6B6B] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
        URGENT
      </span>
    );
  }
  if (p === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-black bg-[#FB923C] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
        HIGH
      </span>
    );
  }
  if (p === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-black bg-[#FFE600] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
        MED
      </span>
    );
  }
  if (p === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-black bg-[#38BDF8] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
        LOW
      </span>
    );
  }
  return <span className="text-zinc-400 text-xs font-bold">-</span>;
}

export default function ListView({ issues }: { issues: any[] }) {
  const { project, updateIssueStatusAndPosition } = useProjectStore();
  const statuses = project.issueStatuses || [];

  return (
    <div className="overflow-x-auto border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
      <table className="w-full text-left text-xs text-black dark:text-zinc-200">
        <thead className="bg-[#FFE600] text-black text-xs font-black uppercase border-b-2 border-black dark:border-white tracking-wider">
          <tr>
            <th className="px-4 py-3.5 font-mono w-24">Key</th>
            <th className="px-4 py-3.5">Title</th>
            <th className="px-4 py-3.5 w-36">Status</th>
            <th className="px-4 py-3.5 w-28">Priority</th>
            <th className="px-4 py-3.5 w-24">Estimate</th>
            <th className="px-4 py-3.5 w-36">Cycle</th>
            <th className="px-4 py-3.5 w-36">Module</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-black/10 dark:divide-white/20 font-bold">
          {issues.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-zinc-500 font-bold">
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
                  className="hover:bg-[#FEF08A]/40 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <td className="px-4 py-3 font-mono text-[11px] font-black">
                    <Link 
                      href={`/projects/${project.id}/issues/${issue.sequenceId}`} 
                      className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-black dark:border-white hover:bg-[#FFE600] hover:text-black transition-colors"
                    >
                      {project.slug}-{issue.sequenceId}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <Link 
                      href={`/projects/${project.id}/issues/${issue.sequenceId}`} 
                      className="font-bold text-black dark:text-white hover:underline transition-colors block truncate max-w-md"
                    >
                      {issue.title}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black" style={{ backgroundColor: dotColor }} />
                      <select 
                        value={issue.statusId}
                        onChange={(e) => updateIssueStatusAndPosition(issue.id, e.target.value, issue.position || 0)}
                        className="bg-white dark:bg-zinc-950 border border-black dark:border-white rounded px-2 py-0.5 text-xs font-bold text-black dark:text-white cursor-pointer focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all"
                      >
                        {statuses.map((s: any) => (
                          <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-black dark:text-white font-bold">
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
                      <span className="font-mono font-black text-[11px] text-black bg-[#FFE600] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
                        {issue.estimate}P
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs font-bold">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {issue.cycle ? (
                      <span className="text-[11px] font-mono font-bold text-black bg-[#FEF08A] px-2 py-0.5 rounded border border-black truncate max-w-[130px] inline-block" title={issue.cycle.name}>
                        {issue.cycle.name}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs font-bold">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {issue.module ? (
                      <span className="text-[11px] font-mono font-bold text-black bg-[#BAE6FD] px-2 py-0.5 rounded border border-black truncate max-w-[130px] inline-block" title={issue.module.name}>
                        {issue.module.name}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs font-bold">-</span>
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
