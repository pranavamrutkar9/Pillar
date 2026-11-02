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
    <div className="space-y-4 font-sans">
      
      {/* Bauhaus Action & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white dark:bg-[#181A20] border-2 border-[#121212] dark:border-white shadow-[3px_3px_0px_#121212] dark:shadow-[3px_3px_0px_#FFF]">
        
        {/* Left: View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border-2 border-[#121212] bg-[#FAF6EE] dark:bg-[#111215] p-0.5">
            <button 
              onClick={() => updateUrl('view', 'board')} 
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider transition-all ${
                view === 'board' 
                  ? 'bg-[#121212] text-white dark:bg-white dark:text-[#121212]' 
                  : 'text-[#121212] dark:text-neutral-400 hover:text-[#D32F2F]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>BOARD</span>
            </button>
            <button 
              onClick={() => updateUrl('view', 'list')} 
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider transition-all ${
                view === 'list' 
                  ? 'bg-[#121212] text-white dark:bg-white dark:text-[#121212]' 
                  : 'text-[#121212] dark:text-neutral-400 hover:text-[#D32F2F]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>LIST</span>
            </button>
          </div>

          {/* Hackathon Timer */}
          {isHackathon && (
            <div className="flex items-center gap-2 pl-2 border-l-2 border-[#121212]">
              <HackathonTimer deadline={project.deadline} />
              {isCrunchMode && (
                <button 
                  onClick={() => setShowAllCrunch(!showAllCrunch)}
                  className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#FBC02D] text-[#121212] border border-[#121212]"
                >
                  {showAllCrunch ? "CRUNCH FILTER" : "SHOW ALL"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Filters, Presence & New Issue Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="SEARCH ISSUES..." 
              value={searchQuery}
              onChange={(e) => updateUrl('search', e.target.value)}
              className="text-xs font-bold uppercase pl-8 pr-2.5 py-1.5 w-44 border-2 border-[#121212] dark:border-white bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#1976D2] transition-colors"
            />
          </div>
          
          {/* Status Filter */}
          <select 
            value={statusFilter[0] || ""}
            onChange={(e) => updateUrl('status', e.target.value)}
            className="text-xs font-black uppercase px-2.5 py-1.5 border-2 border-[#121212] dark:border-white bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-white focus:outline-none focus:border-[#1976D2] cursor-pointer"
          >
            <option value="">STATUS: ALL</option>
            {project.issueStatuses?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
            ))}
          </select>

          {/* Cycle Filter */}
          {cycles && cycles.length > 0 && (
            <select 
              value={cycleFilter}
              onChange={(e) => updateUrl('cycleId', e.target.value)}
              className="text-xs font-black uppercase px-2.5 py-1.5 border-2 border-[#121212] dark:border-white bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-white focus:outline-none focus:border-[#1976D2] cursor-pointer"
            >
              <option value="">CYCLE: ALL</option>
              {cycles.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
              ))}
            </select>
          )}

          {/* Module Filter */}
          {modules && modules.length > 0 && (
            <select 
              value={moduleFilter}
              onChange={(e) => updateUrl('moduleId', e.target.value)}
              className="text-xs font-black uppercase px-2.5 py-1.5 border-2 border-[#121212] dark:border-white bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-white focus:outline-none focus:border-[#1976D2] cursor-pointer"
            >
              <option value="">MODULE: ALL</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>
              ))}
            </select>
          )}

          {/* Active Presence */}
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-1 pl-2 border-l-2 border-[#121212]">
              <div className="flex -space-x-1">
                {activeUsers.map(user => (
                  <div 
                    key={user.id} 
                    className="w-6 h-6 bg-[#D32F2F] text-white flex items-center justify-center text-[10px] font-mono font-black border border-[#121212] shadow-[1px_1px_0px_#121212]" 
                    title="Active collaborator"
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
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#121212] transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW TICKET</span>
            </button>
          )}

        </div>
      </div>

      {/* Crunch Notice */}
      {isCrunchMode && !showAllCrunch && filteredIssues.length === 0 && (
        <div className="p-3 bg-[#FBC02D] text-[#121212] border-2 border-[#121212] text-xs font-black uppercase flex items-center justify-between shadow-[2px_2px_0px_#121212]">
          <span><strong>CRUNCH PROTOCOL ENGAGED:</strong> Showing high-priority tickets only.</span>
          <button 
            onClick={() => setShowAllCrunch(true)}
            className="underline font-black text-[#D32F2F] ml-2"
          >
            SHOW FULL REPOSITORY
          </button>
        </div>
      )}

      {/* Main View: Board or List */}
      <div>
        {view === 'board' ? <BoardView issues={filteredIssues} /> : <ListView issues={filteredIssues} />}
      </div>

      {/* New Issue Modal Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/70 backdrop-blur-xs p-4 animate-in fade-in duration-100">
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
