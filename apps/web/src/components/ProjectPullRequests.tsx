"use client";

import { useState, useEffect } from "react";
import { getProjectPullRequestsAction } from "../actions/githubActions";
import { PullRequestCard } from "./PullRequestCard";
import { GitPullRequest, Loader2 } from "lucide-react";

export function ProjectPullRequests({ projectId }: { projectId: string }) {
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectPullRequestsAction(projectId)
      .then(data => setPrs(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-xs font-mono font-bold text-black dark:text-white">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        LOADING PULL REQUESTS...
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <div className="text-xs font-medium text-black/70 dark:text-white/70 bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo p-10 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 bg-[#FFE600] border-2 border-black flex items-center justify-center shadow-neo-sm">
          <GitPullRequest className="w-6 h-6 text-black" />
        </div>
        <span className="font-black text-sm uppercase tracking-wider text-black dark:text-white">No Pull Requests Linked</span>
        <span className="text-xs text-black/60 dark:text-white/60">Connect a GitHub repository in project settings to view tracked PRs here.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {prs.map(pr => (
        <PullRequestCard key={pr.id} pr={pr} />
      ))}
    </div>
  );
}
