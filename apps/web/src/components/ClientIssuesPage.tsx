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
    <div className="space-y-5">
      
      {/* Action & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
        
        {/* Left: View Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-950 rounded-lg border-2 border-black dark:border-white gap-1">
            <button 
              onClick={() => updateUrl('view', 'board')} 
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                view === 'board' 
                  ? 'bg-[#FFE600] text-black border border-black shadow-[1.5px_1.5px_0px_0px_#000]' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Board</span>
            </button>
            <button 
              onClick={() => updateUrl('view', 'list')} 
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                view === 'list' 
                  ? 'bg-[#FFE600] text-black border border-black shadow-[1.5px_1.5px_0px_0px_#000]' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>List</span>
            </button>
          </div>

          {/* Hackathon Timer */}
          {isHackathon && (
            <div className="flex items-center gap-2 pl-2 border-l-2 border-black dark:border-white">
              <HackathonTimer deadline={project.deadline} />
              {isCrunchMode && (
                <button 
                  onClick={() => setShowAllCrunch(!showAllCrunch)}
                  className="text-[11px] font-mono font-black px-2.5 py-1 rounded-lg bg-[#FF6B6B] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
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
            <Search className="w-4 h-4 text-black dark:text-white absolute left-2.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input 
              type="text" 
              placeholder="Filter issues..." 
              value={searchQuery}
              onChange={(e) => updateUrl('search', e.target.value)}
              className="text-xs font-bold pl-8 pr-2.5 py-1.5 w-44 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all"
            />
          </div>
          
          {/* Status Filter */}
          <select 
            value={statusFilter[0] || ""}
            onChange={(e) => updateUrl('status', e.target.value)}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all cursor-pointer"
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
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all cursor-pointer"
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
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all cursor-pointer"
            >
              <option value="">All Modules</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}

          {/* Active Presence */}
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-1 pl-2 border-l-2 border-black dark:border-white">
              <div className="flex -space-x-1.5">
                {activeUsers.map(user => (
                  <div 
                    key={user.id} 
                    className="w-6 h-6 rounded-lg bg-[#FFE600] text-black flex items-center justify-center text-[10px] font-mono font-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]" 
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Issue</span>
            </button>
          )}

        </div>
      </div>

      {/* Crunch Notice */}
      {isCrunchMode && !showAllCrunch && filteredIssues.length === 0 && (
        <div className="p-3.5 bg-[#FF6B6B] text-black font-bold rounded-xl text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-between">
          <span><strong>CRUNCH MODE ACTIVE:</strong> Non-critical issues are filtered out. Click Show All to reveal full board.</span>
          <button 
            onClick={() => setShowAllCrunch(true)}
            className="underline font-black ml-2 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
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
