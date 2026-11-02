"use client";

import React from 'react';
import { useProjectStore } from './ProjectStore';
import Link from 'next/link';

function getStatusDot(statusName: string, customColor?: string) {
  if (customColor) return customColor;
  const name = statusName.toLowerCase();
  if (name.includes('done') || name.includes('complete') || name.includes('shipped')) return '#5E6AD2';
  if (name.includes('progress') || name.includes('doing') || name.includes('active')) return '#F5A623';
  if (name.includes('review') || name.includes('testing')) return '#0091FF';
  if (name.includes('todo') || name.includes('ready') || name.includes('unstarted')) return '#9B9EA8';
  return '#71737F';
}

function PriorityBadge({ priority }: { priority?: string }) {
  const p = (priority || '').toUpperCase();
  if (p === 'URGENT') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Urgent
      </span>
    );
  }
  if (p === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> High
      </span>
    );
  }
  if (p === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Med
      </span>
    );
  }
  if (p === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Low
      </span>
    );
  }
  return <span className="text-zinc-600 text-xs">-</span>;
}

export default function ListView({ issues }: { issues: any[] }) {
  const { project, updateIssueStatusAndPosition } = useProjectStore();
  const statuses = project.issueStatuses || [];

  return (
    <div className="overflow-x-auto border border-white/[0.08] rounded-xl bg-[#0D0E11] shadow-linear-card font-sans">
      <table className="w-full text-left text-xs text-zinc-300">
        <thead className="bg-[#0B0C0E] text-[11px] font-medium border-b border-white/[0.06] text-zinc-400">
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
        <tbody className="divide-y divide-white/[0.04]">
          {issues.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-zinc-500 text-xs">
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
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">
                    <Link 
                      href={`/projects/${project.id}/issues/${issue.sequenceId}`} 
                      className="hover:text-white transition-colors"
                    >
                      {project.slug}-{issue.sequenceId}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <Link 
                      href={`/projects/${project.id}/issues/${issue.sequenceId}`} 
                      className="font-medium text-zinc-200 group-hover:text-white transition-colors block truncate max-w-md"
                    >
                      {issue.title}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: dotColor }} />
                      <select 
                        value={issue.statusId}
                        onChange={(e) => updateIssueStatusAndPosition(issue.id, e.target.value, issue.position || 0)}
                        className="bg-transparent border border-transparent hover:border-white/[0.1] rounded px-1.5 py-0.5 text-xs text-zinc-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#5E6AD2] transition-colors"
                      >
                        {statuses.map((s: any) => (
                          <option key={s.id} value={s.id} className="bg-[#141519] text-white">
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
                      <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                        {issue.estimate}p
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {issue.cycle ? (
                      <span className="text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] truncate max-w-[130px] inline-block" title={issue.cycle.name}>
                        {issue.cycle.name}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {issue.module ? (
                      <span className="text-[10px] text-[#8B96FF] bg-[#5E6AD2]/10 px-2 py-0.5 rounded border border-[#5E6AD2]/20 truncate max-w-[130px] inline-block" title={issue.module.name}>
                        {issue.module.name}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">-</span>
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
