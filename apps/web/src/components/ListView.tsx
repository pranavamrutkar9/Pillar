"use client";

import React from 'react';
import { useProjectStore } from './ProjectStore';
import Link from 'next/link';

function PriorityBadge({ priority }: { priority?: string }) {
  const p = (priority || '').toUpperCase();
  if (p === 'URGENT') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-white bg-[#D32F2F] px-1.5 py-0.5 border border-[#121212]">
        <span>●</span> URGENT
      </span>
    );
  }
  if (p === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#121212] bg-[#FBC02D] px-1.5 py-0.5 border border-[#121212]">
        <span>▲</span> HIGH
      </span>
    );
  }
  if (p === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-white bg-[#1976D2] px-1.5 py-0.5 border border-[#121212]">
        <span>■</span> MED
      </span>
    );
  }
  if (p === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#121212] bg-[#FAF6EE] px-1.5 py-0.5 border border-[#121212]">
        <span>-</span> LOW
      </span>
    );
  }
  return <span className="text-neutral-400 text-xs font-mono">-</span>;
}

export default function ListView({ issues }: { issues: any[] }) {
  const { project, updateIssueStatusAndPosition } = useProjectStore();
  const statuses = project.issueStatuses || [];

  return (
    <div className="overflow-x-auto border-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[4px_4px_0px_#121212] dark:shadow-[4px_4px_0px_#FFF] font-sans">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#121212] text-white dark:bg-white dark:text-[#121212] text-[10px] font-black uppercase tracking-wider border-b-2 border-[#121212]">
          <tr>
            <th className="px-4 py-3 font-mono w-24">ID</th>
            <th className="px-4 py-3">TITLE</th>
            <th className="px-4 py-3 w-40">STAGE</th>
            <th className="px-4 py-3 w-32">PRIORITY</th>
            <th className="px-4 py-3 w-24">ESTIMATE</th>
            <th className="px-4 py-3 w-36">CYCLE</th>
            <th className="px-4 py-3 w-36">MODULE</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-[#121212] dark:divide-white">
          {issues.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-xs font-black uppercase text-neutral-400">
                No tickets match current parameters.
              </td>
            </tr>
          ) : (
            issues.map(issue => {
              const currentStatus = statuses.find((s: any) => s.id === issue.statusId);

              return (
                <tr 
                  key={issue.id} 
                  className="hover:bg-[#FAF6EE] dark:hover:bg-[#22242B] transition-colors group"
                >
                  <td className="px-4 py-3 font-mono text-[11px] font-black text-[#121212] dark:text-white">
                    <Link 
                      href={`/projects/${project.id}/issues/${issue.sequenceId}`} 
                      className="bg-[#FAF6EE] dark:bg-[#202022] px-1.5 py-0.5 border border-[#121212] hover:bg-[#FBC02D] transition-colors"
                    >
                      {project.slug}-{issue.sequenceId}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <Link 
                      href={`/projects/${project.id}/issues/${issue.sequenceId}`} 
                      className="font-black uppercase tracking-tight text-[#121212] dark:text-white hover:text-[#D32F2F] transition-colors block truncate max-w-md"
                    >
                      {issue.title}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-1.5 bg-[#FAF6EE] dark:bg-[#111215] px-2 py-1 border border-[#121212]">
                      <select 
                        value={issue.statusId}
                        onChange={(e) => updateIssueStatusAndPosition(issue.id, e.target.value, 0)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-wider text-[#121212] dark:text-white focus:outline-none cursor-pointer"
                      >
                        {statuses.map((s: any) => (
                          <option key={s.id} value={s.id} className="bg-white text-[#121212]">{s.name.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <PriorityBadge priority={issue.priority} />
                  </td>

                  <td className="px-4 py-3 font-mono font-black text-[11px] text-[#121212] dark:text-white">
                    {issue.estimate !== null && issue.estimate !== undefined ? (
                      <span className="bg-[#FAF6EE] dark:bg-[#222] px-1.5 py-0.5 border border-[#121212]">
                        {issue.estimate}PT
                      </span>
                    ) : '-'}
                  </td>

                  <td className="px-4 py-3 text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-400">
                    {issue.cycle ? (
                      <span className="bg-[#1976D2] text-white px-1.5 py-0.5 border border-[#121212]">
                        {issue.cycle.name}
                      </span>
                    ) : '-'}
                  </td>

                  <td className="px-4 py-3 text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-400">
                    {issue.module ? (
                      <span className="bg-[#FBC02D] text-[#121212] px-1.5 py-0.5 border border-[#121212]">
                        {issue.module.name}
                      </span>
                    ) : '-'}
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
