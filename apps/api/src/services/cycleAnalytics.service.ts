import { prisma } from "../db/client.js";
import { cycleService } from "./cycle.service.js";

export const cycleAnalyticsService = {
  async getCycleSummary(cycleId: string, projectId: string) {
    const cycle = await cycleService.getCycleById(cycleId, projectId);

    // Initial scope and scope changes based on events
    const events = await prisma.event.findMany({
      where: {
        projectId,
        eventType: {
          in: ['issue.added_to_cycle', 'issue.removed_from_cycle', 'issue.carried_forward']
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    let initialScopePoints = 0;
    let addedScopePoints = 0;
    let removedScopePoints = 0;
    let carriedForwardPoints = 0;

    // A Set to track issues currently in scope for this cycle during playback
    const currentScope = new Map<string, number>();

    events.forEach(event => {
      const payload: any = event.payload;
      if (payload.cycleId === cycleId) {
        const estimate = payload.estimate || 0; // fallback to 0

        if (event.eventType === 'issue.added_to_cycle') {
          // If added before cycle started, it's initial scope. Otherwise added scope.
          if (cycle.startsAt && event.createdAt < cycle.startsAt) {
            initialScopePoints += estimate;
          } else {
            addedScopePoints += estimate;
          }
          currentScope.set(payload.issueId, estimate);
        } else if (event.eventType === 'issue.removed_from_cycle') {
          removedScopePoints += estimate;
          currentScope.delete(payload.issueId);
        } else if (event.eventType === 'issue.carried_forward') {
          // Here payload.cycleId might be the new cycle (added) or old cycle (removed) depending on how carry forward emitted it.
          // Let's assume `issue.carried_forward` event payload has { oldCycleId, newCycleId, estimate }
          // Actually, our cycleWorker will emit `issue.carried_forward` which might just be a notification.
          // We also emit `added` and `removed` via the standard updateIssue inside cycleWorker.
        }
      }
    });

    const completedIssues = cycle.issues.filter(i => i.status.isDone);
    const velocity = completedIssues.reduce((acc, issue) => acc + (issue.estimate || 0), 0);
    const finalScopePoints = initialScopePoints + addedScopePoints - removedScopePoints;

    let completionRate = 0;
    if (finalScopePoints > 0) {
      completionRate = Math.round((velocity / finalScopePoints) * 100);
    } else {
      // Fallback to issue count if no estimates are used anywhere
      const totalIssues = cycle.issues.length;
      if (totalIssues > 0) {
        completionRate = Math.round((completedIssues.length / totalIssues) * 100);
      }
    }

    return {
      velocity,
      completionRate,
      initialScopePoints,
      addedScopePoints,
      removedScopePoints,
      finalScopePoints
    };
  },

  async getCycleBurndown(cycleId: string, projectId: string) {
    const cycle = await cycleService.getCycleById(cycleId, projectId);
    
    // Simplistic burndown: remaining estimate over time
    // In a real app we'd construct a daily snapshot array from `cycle.startsAt` to `cycle.endsAt`
    // using event history of issues entering, leaving, and being marked done.
    
    // For Week 9, we'll construct a mock-like or simplified daily progression:
    const days = [];
    const start = new Date(cycle.startsAt).getTime();
    const end = new Date(cycle.endsAt).getTime();
    const dayMs = 1000 * 60 * 60 * 24;

    const totalDays = Math.ceil((end - start) / dayMs);
    let remaining = cycle.issues.reduce((acc, iss) => acc + (iss.estimate || 0), 0); // Starting point proxy

    for (let i = 0; i <= totalDays; i++) {
      days.push({
        day: i + 1,
        remaining,
        ideal: Math.max(0, remaining - (remaining / totalDays) * i)
      });
    }

    return days;
  }
};
