"use client";

import { useProjectStore } from "./ProjectStore";
import BoardView from "./BoardView";
import ListView from "./ListView";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function ClientIssuesPage() {
  const { project, issues, activeUsers } = useProjectStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const view = searchParams.get('view') || 'board';
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.getAll('status');

  const updateUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const filteredIssues = issues.filter(issue => {
    if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(issue.statusId)) return false;
    return true;
  });

  // Get initials for active users
  const getInitials = (userId: string) => {
    const member = project.members?.find((m: any) => m.userId === userId);
    if (!member || !member.user) return "?";
    const name = member.user.username || "?";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 gap-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => updateUrl('view', 'board')} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'board' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
          >
            Board
          </button>
          <button 
            onClick={() => updateUrl('view', 'list')} 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
          >
            List
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              placeholder="Search issues..." 
              value={searchQuery}
              onChange={(e) => updateUrl('search', e.target.value)}
              className="text-sm px-3 py-1.5 w-48 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select 
              value={statusFilter[0] || ""}
              onChange={(e) => updateUrl('status', e.target.value)}
              className="text-sm px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {project.issueStatuses?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          {activeUsers.length > 0 && (
            <div className="flex items-center space-x-1 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 mr-1">Active:</span>
              <div className="flex -space-x-2">
                {activeUsers.map(user => (
                  <div key={user.id} className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold border border-white dark:border-zinc-900 shadow-sm" title="Online">
                    {getInitials(user.id)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {view === 'board' ? <BoardView issues={filteredIssues} /> : <ListView issues={filteredIssues} />}
    </div>
  );
}
