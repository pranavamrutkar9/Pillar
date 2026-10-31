"use client";

import { useState, useEffect } from "react";
import { getProjectPullRequestsAction } from "../actions/githubActions";
import { PullRequestCard } from "./PullRequestCard";
import { GitPullRequest } from "lucide-react";

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
      <div className="flex items-center justify-center p-8 text-xs text-zinc-400">
        <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mr-2" />
        Loading pull requests...
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <div className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
        <GitPullRequest className="w-6 h-6 text-zinc-400" />
        <span>No pull requests linked to this project yet.</span>
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
