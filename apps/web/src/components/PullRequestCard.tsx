import React from 'react';
import { GitPullRequest, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PRProps {
  pr: any;
}

export function PullRequestCard({ pr }: PRProps) {
  const getStatusColor = () => {
    switch (pr.state) {
      case 'OPEN': return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/40';
      case 'MERGED': return 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-900/40';
      case 'CLOSED': return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200/60 dark:border-red-900/40';
      case 'DRAFT': return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
      default: return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
    }
  };

  const getCiIcon = () => {
    switch (pr.ciState) {
      case 'SUCCESS': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'FAILURE': return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      case 'PENDING': return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      default: return <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="flex flex-col border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <GitPullRequest className="w-4 h-4 text-purple-500" />
          <a 
            href={pr.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline truncate max-w-[220px]"
          >
            {pr.title}
          </a>
          <span className="text-xs font-mono text-zinc-400">#{pr.number}</span>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded border ${getStatusColor()}`}>
          {pr.state}
        </span>
      </div>

      <div className="flex items-center space-x-3 text-xs text-zinc-500 mb-3">
        <div className="flex items-center space-x-1.5">
          {pr.authorAvatarUrl ? (
            <img src={pr.authorAvatarUrl} alt={pr.authorGithubLogin} className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-800" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          )}
          <span className="font-mono text-[11px]">{pr.authorGithubLogin || 'Unknown'}</span>
        </div>
        {pr.reviewDecision && (
          <div className="flex items-center">
            <span className={`text-[11px] font-medium ${pr.reviewDecision === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {pr.reviewDecision.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400">
        <div className="flex items-center space-x-1.5">
          {getCiIcon()}
          <span>
            {pr.ciState ? pr.ciState.charAt(0) + pr.ciState.slice(1).toLowerCase() : 'No Checks'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 font-mono">
          <span className="text-emerald-600 dark:text-emerald-400">+{pr.additions}</span>
          <span className="text-red-500">-{pr.deletions}</span>
          <span>{pr.commitCount}c</span>
        </div>
      </div>
    </div>
  );
}
