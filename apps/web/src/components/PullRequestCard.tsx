import React from 'react';
import { GitPullRequest, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PRProps {
  pr: any;
}

export function PullRequestCard({ pr }: PRProps) {
  const getStatusColor = () => {
    switch (pr.state) {
      case 'OPEN': return 'bg-[#4ADE80] text-black border-black';
      case 'MERGED': return 'bg-[#C084FC] text-black border-black';
      case 'CLOSED': return 'bg-[#FF6B6B] text-black border-black';
      case 'DRAFT': return 'bg-white dark:bg-[#20222a] text-black dark:text-white border-black dark:border-white';
      default: return 'bg-white dark:bg-[#20222a] text-black dark:text-white border-black dark:border-white';
    }
  };

  const getCiIcon = () => {
    switch (pr.ciState) {
      case 'SUCCESS': return <CheckCircle2 className="w-3.5 h-3.5 text-black" />;
      case 'FAILURE': return <XCircle className="w-3.5 h-3.5 text-black" />;
      case 'PENDING': return <Clock className="w-3.5 h-3.5 text-black" />;
      default: return <AlertCircle className="w-3.5 h-3.5 text-black" />;
    }
  };

  return (
    <div className="flex flex-col border-2 border-black dark:border-white p-4 bg-white dark:bg-[#181920] shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all font-sans">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-6 h-6 bg-[#C084FC] border border-black flex items-center justify-center shrink-0">
            <GitPullRequest className="w-3.5 h-3.5 text-black" />
          </div>
          <a 
            href={pr.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-black text-black dark:text-white hover:underline truncate"
          >
            {pr.title}
          </a>
          <span className="text-xs font-mono font-bold text-black/60 dark:text-white/60">#{pr.number}</span>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider border-2 shrink-0 ${getStatusColor()}`}>
          {pr.state}
        </span>
      </div>

      <div className="flex items-center space-x-3 text-xs text-black/70 dark:text-white/70 mb-4">
        <div className="flex items-center space-x-1.5">
          {pr.authorAvatarUrl ? (
            <img src={pr.authorAvatarUrl} alt={pr.authorGithubLogin} className="w-4 h-4 border border-black" />
          ) : (
            <div className="w-4 h-4 bg-[#FFE600] border border-black" />
          )}
          <span className="font-mono text-[11px] font-bold text-black dark:text-white">{pr.authorGithubLogin || 'Unknown'}</span>
        </div>
        {pr.reviewDecision && (
          <div className="flex items-center">
            <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-black ${pr.reviewDecision === 'APPROVED' ? 'bg-[#4ADE80] text-black' : 'bg-[#FFE600] text-black'}`}>
              {pr.reviewDecision.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-black dark:border-white text-[11px] font-mono">
        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-[#FFFDF8] dark:bg-[#20222a] border border-black dark:border-white">
          {getCiIcon()}
          <span className="font-bold text-black dark:text-white">
            {pr.ciState ? pr.ciState.charAt(0) + pr.ciState.slice(1).toLowerCase() : 'No Checks'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 font-mono font-bold">
          <span className="text-[#16A34A] dark:text-[#4ADE80]">+{pr.additions}</span>
          <span className="text-[#DC2626] dark:text-[#FF6B6B]">-{pr.deletions}</span>
          <span className="text-black/60 dark:text-white/60">{pr.commitCount}c</span>
        </div>
      </div>
    </div>
  );
}
