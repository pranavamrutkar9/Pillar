"use client";

import { useProjectStore } from "./ProjectStore";
import BoardView from "./BoardView";
import ListView from "./ListView";
import HackathonTimer from "./HackathonTimer";
import IssueForm from "./IssueForm";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutGrid, 
  List, 
  Search, 
  Plus, 
  Filter, 
  Flame, 
  X
} from "lucide-react";

interface ClientIssuesPageProps {
  cycles?: any[];
  modules?: any[];
  statuses?: any[];
  members?: any[];
  labels?: any[];
  isViewer?: boolean;
}

export default function ClientIssuesPage({ 
  cycles = [], 
  modules = [], 
  statuses, 
  members = [], 
  labels = [],
  isViewer = false 
}: ClientIssuesPageProps) {
  const { project, issues, activeUsers } = useProjectStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [showAllCrunch, setShowAllCrunch] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const resolvedStatuses = statuses || project.issueStatuses || [];
  const resolvedMembers = members.length > 0 ? members : (project.workspace?.members || project.members || []);
  const resolvedLabels = labels.length > 0 ? labels : (project.issueLabels || []);

  const view = searchParams.get('view') || 'board';
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.getAll('status');
  const cycleFilter = searchParams.get('cycleId') || '';
  const moduleFilter = searchParams.get('moduleId') || '';

  const updateUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Crunch Mode logic
  const isHackathon = project?.isHackathonMode && project?.deadline;
  let isCrunchMode = false;
  if (isHackathon) {
    const timeLeft = new Date(project.deadline).getTime() - new Date().getTime();
    isCrunchMode = timeLeft > 0 && timeLeft <= 6 * 60 * 60 * 1000;
  }

  const filteredIssues = issues.filter(issue => {
    if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(issue.statusId)) return false;
    if (cycleFilter && issue.cycleId !== cycleFilter) return false;
    if (moduleFilter && issue.moduleId !== moduleFilter) return false;
    
    if (isCrunchMode && !showAllCrunch) {
      const isCritical = ['HIGH', 'URGENT'].includes(issue.priority);
      const status = project.issueStatuses?.find((s: any) => s.id === issue.statusId);
      if (!isCritical || status?.isDone) return false;
    }

    return true;
  });

  const getInitials = (userId: string) => {
    const member = (project.workspace?.members || project.members)?.find((m: any) => m.userId === userId);
    if (!member || !member.user) return "?";
    const name = member.user.username || member.user.email || "?";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      
      {/* Action & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-2xs">
        
        {/* Left: View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60">
            <button 
              onClick={() => updateUrl('view', 'board')} 
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                view === 'board' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button 
              onClick={() => updateUrl('view', 'list')} 
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                view === 'list' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* Hackathon Timer */}
          {isHackathon && (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <HackathonTimer deadline={project.deadline} />
              {isCrunchMode && (
                <button 
                  onClick={() => setShowAllCrunch(!showAllCrunch)}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                >
                  {showAllCrunch ? "Apply Crunch Filter" : "Show All"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Filters, Presence & New Issue Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Filter issues..." 
              value={searchQuery}
              onChange={(e) => updateUrl('search', e.target.value)}
              className="text-xs pl-8 pr-2.5 py-1.5 w-44 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
            />
          </div>
          
          {/* Status Filter */}
          <select 
            value={statusFilter[0] || ""}
            onChange={(e) => updateUrl('status', e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors cursor-pointer"
          >
            <option value="">All Statuses</option>
            {project.issueStatuses?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Cycle Filter */}
          {cycles && cycles.length > 0 && (
            <select 
              value={cycleFilter}
              onChange={(e) => updateUrl('cycleId', e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors cursor-pointer"
            >
              <option value="">All Cycles</option>
              {cycles.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Module Filter */}
          {modules && modules.length > 0 && (
            <select 
              value={moduleFilter}
              onChange={(e) => updateUrl('moduleId', e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors cursor-pointer"
            >
              <option value="">All Modules</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}

          {/* Active Presence */}
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <div className="flex -space-x-1.5">
                {activeUsers.map(user => (
                  <div 
                    key={user.id} 
                    className="w-5 h-5 rounded-full bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 flex items-center justify-center text-[9px] font-mono font-bold border border-white dark:border-zinc-900 shadow-2xs" 
                    title="Active now"
                  >
                    {getInitials(user.id)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Issue Action Button */}
          {!isViewer && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Issue</span>
            </button>
          )}

        </div>
      </div>

      {/* Crunch Notice */}
      {isCrunchMode && !showAllCrunch && filteredIssues.length === 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 rounded-lg text-xs border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
          <span><strong>Crunch Mode Active:</strong> Non-critical issues are filtered out. Click Show All to reveal full board.</span>
          <button 
            onClick={() => setShowAllCrunch(true)}
            className="underline font-medium text-amber-900 dark:text-amber-100 ml-2"
          >
            Show All
          </button>
        </div>
      )}

      {/* Main View: Board or List */}
      <div>
        {view === 'board' ? <BoardView issues={filteredIssues} /> : <ListView issues={filteredIssues} />}
      </div>

      {/* New Issue Modal Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <IssueForm
              projectId={project.id}
              statuses={resolvedStatuses}
              members={resolvedMembers}
              labels={resolvedLabels}
              cycles={cycles}
              modules={modules}
              onClose={() => setIsCreateOpen(false)}
              onSuccess={() => {
                router.refresh();
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
