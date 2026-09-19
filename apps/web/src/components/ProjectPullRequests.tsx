"use client";

import { useState, useEffect } from "react";
import { getProjectPullRequestsAction } from "../actions/githubActions";
import { PullRequestCard } from "./PullRequestCard";

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
    return <div className="text-sm text-gray-500 animate-pulse">Loading pull requests...</div>;
  }

  if (prs.length === 0) {
    return <div className="text-sm text-gray-500 bg-white/5 border border-white/10 rounded-lg p-6 text-center">No pull requests found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {prs.map(pr => (
        <PullRequestCard key={pr.id} pr={pr} />
      ))}
    </div>
  );
}
