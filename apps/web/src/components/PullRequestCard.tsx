import React from 'react';
import { GitPullRequest, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PRProps {
  pr: any;
}

export function PullRequestCard({ pr }: PRProps) {
  const getStatusColor = () => {
    switch (pr.state) {
      case 'OPEN': return 'text-[#5E6AD2] bg-[#5E6AD2]/10 border-[#5E6AD2]/30';
      case 'MERGED': return 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/30';
      case 'CLOSED': return 'text-[#F43F5E] bg-[#F43F5E]/10 border-[#F43F5E]/30';
      case 'DRAFT': return 'text-[#8A8F98] bg-white/[0.04] border-white/10';
      default: return 'text-[#8A8F98] bg-white/[0.04] border-white/10';
    }
  };

  const getCiIcon = () => {
    switch (pr.ciState) {
      case 'SUCCESS': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'FAILURE': return <XCircle className="w-3.5 h-3.5 text-red-400" />;
      case 'PENDING': return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      default: return <AlertCircle className="w-3.5 h-3.5 text-[#626773]" />;
    }
  };

  return (
    <div className="flex flex-col border border-white/[0.08] rounded-lg p-3.5 bg-[#141519] hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <GitPullRequest className="w-4 h-4 text-[#5E6AD2]" />
          <a 
            href={pr.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-semibold text-[#EDEDED] hover:text-[#5E6AD2] hover:underline truncate max-w-[220px]"
          >
            {pr.title}
          </a>
          <span className="text-xs font-mono text-[#626773]">#{pr.number}</span>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded border ${getStatusColor()}`}>
          {pr.state}
        </span>
      </div>

      <div className="flex items-center space-x-3 text-xs text-[#8A8F98] mb-3">
        <div className="flex items-center space-x-1.5">
          {pr.authorAvatarUrl ? (
            <img src={pr.authorAvatarUrl} alt={pr.authorGithubLogin} className="w-4 h-4 rounded-full border border-white/10" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-[#1F2027]" />
          )}
          <span className="font-mono text-[11px] text-[#EDEDED]">{pr.authorGithubLogin || 'Unknown'}</span>
        </div>
        {pr.reviewDecision && (
          <div className="flex items-center">
            <span className={`text-[11px] font-medium ${pr.reviewDecision === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {pr.reviewDecision.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs border-t border-white/[0.06] pt-2 text-[#8A8F98]">
        <div className="flex items-center space-x-1.5 font-mono text-[11px]">
          <span>{pr.sourceBranch}</span>
          <span>→</span>
          <span>{pr.targetBranch}</span>
        </div>
        {pr.ciState && (
          <div className="flex items-center space-x-1.5">
            {getCiIcon()}
            <span className="capitalize font-mono text-[10px] text-[#8A8F98]">{pr.ciState.toLowerCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
