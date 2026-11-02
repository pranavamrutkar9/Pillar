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
  X,
  SlidersHorizontal
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
    <div className="space-y-5 font-sans">
      
      {/* Linear Precision Action & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2.5 bg-[#0D0E11] border border-white/[0.08] rounded-xl shadow-linear-card">
        
        {/* Left: View Switcher (Segmented Control) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 bg-black/40 rounded-lg border border-white/[0.06]">
            <button 
              onClick={() => updateUrl('view', 'board')} 
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                view === 'board' 
                  ? 'bg-[#18191E] text-white shadow-xs border border-white/[0.1]' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button 
              onClick={() => updateUrl('view', 'list')} 
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                view === 'list' 
                  ? 'bg-[#18191E] text-white shadow-xs border border-white/[0.1]' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* Hackathon / Crunch Countdown */}
          {isHackathon && (
            <div className="flex items-center gap-2 pl-3 border-l border-white/[0.08]">
              <HackathonTimer deadline={project.deadline} />
              {isCrunchMode && (
                <button 
                  onClick={() => setShowAllCrunch(!showAllCrunch)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  {showAllCrunch ? "Apply Crunch Filter" : "Show All"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Search, Filter Selects, Presence & Create Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search or filter issues..." 
              value={searchQuery}
              onChange={(e) => updateUrl('search', e.target.value)}
              className="text-xs pl-8 pr-2.5 py-1.5 w-44 sm:w-52 rounded-md border border-white/[0.08] bg-[#141519] text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2] transition-colors"
            />
          </div>
          
          {/* Status Filter */}
          <select 
            value={statusFilter[0] || ""}
            onChange={(e) => updateUrl('status', e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-white/[0.08] bg-[#141519] text-zinc-300 focus:outline-none focus:border-[#5E6AD2] transition-colors cursor-pointer"
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
              className="text-xs px-2.5 py-1.5 rounded-md border border-white/[0.08] bg-[#141519] text-zinc-300 focus:outline-none focus:border-[#5E6AD2] transition-colors cursor-pointer"
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
              className="text-xs px-2.5 py-1.5 rounded-md border border-white/[0.08] bg-[#141519] text-zinc-300 focus:outline-none focus:border-[#5E6AD2] transition-colors cursor-pointer"
            >
              <option value="">All Modules</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}

          {/* Active Presence Indicators */}
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-1 pl-2 border-l border-white/[0.08]">
              <div className="flex -space-x-1.5">
                {activeUsers.map(user => (
                  <div 
                    key={user.id} 
                    className="w-5 h-5 rounded-full bg-[#5E6AD2]/20 border border-[#5E6AD2]/50 text-[#818CF8] flex items-center justify-center text-[9px] font-mono font-bold shadow-xs" 
                    title="Active in project"
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
              className="linear-btn-primary shadow-linear-glow text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Issue</span>
              <span className="linear-kbd ml-1">C</span>
            </button>
          )}

        </div>
      </div>

      {/* Crunch Notice Banner */}
      {isCrunchMode && !showAllCrunch && filteredIssues.length === 0 && (
        <div className="p-3 bg-amber-500/10 text-amber-300 rounded-lg text-xs border border-amber-500/20 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Crunch Mode Active:</strong> Only critical issues are shown. Click Show All to view the entire board.</span>
          </span>
          <button 
            onClick={() => setShowAllCrunch(true)}
            className="underline font-medium text-amber-200 ml-2 hover:text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
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
