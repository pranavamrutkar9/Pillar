import React from 'react';
import { GitPullRequest, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PRProps {
  pr: any;
}

export function PullRequestCard({ pr }: PRProps) {
  const getStatusColor = () => {
    switch (pr.state) {
      case 'OPEN': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'MERGED': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'CLOSED': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'DRAFT': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getCiIcon = () => {
    switch (pr.ciState) {
      case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'FAILURE': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <GitPullRequest className={`w-5 h-5 ${getStatusColor().split(' ')[0]}`} />
          <a 
            href={pr.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-semibold text-white hover:underline truncate max-w-[200px]"
          >
            {pr.title}
          </a>
          <span className="text-xs text-gray-400">#{pr.number}</span>
        </div>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor()}`}>
          {pr.state}
        </span>
      </div>

      <div className="flex items-center space-x-4 text-xs text-gray-400 mb-4">
        <div className="flex items-center space-x-1.5">
          {pr.authorAvatarUrl ? (
            <img src={pr.authorAvatarUrl} alt={pr.authorGithubLogin} className="w-4 h-4 rounded-full" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gray-600" />
          )}
          <span>{pr.authorGithubLogin || 'Unknown'}</span>
        </div>
        {pr.reviewDecision && (
          <div className="flex items-center">
            <span className={pr.reviewDecision === 'APPROVED' ? 'text-green-400' : 'text-yellow-400'}>
              {pr.reviewDecision.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <div className="flex items-center space-x-2 text-xs">
          {getCiIcon()}
          <span className="text-gray-300">
            {pr.ciState ? pr.ciState.charAt(0) + pr.ciState.slice(1).toLowerCase() : 'No Checks'}
          </span>
        </div>
        
        <div className="flex items-center space-x-3 text-xs text-gray-400">
          <span className="text-green-400">+{pr.additions}</span>
          <span className="text-red-400">-{pr.deletions}</span>
          <span>{pr.commitCount} commits</span>
        </div>
      </div>
    </div>
  );
}
