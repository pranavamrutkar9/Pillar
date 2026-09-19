import { prisma } from "../db/client.js";
import { cycleService } from "./cycle.service.js";

export const cycleAnalyticsService = {
  async getCycleSummary(cycleId: string, projectId: string) {
    const cycle = await cycleService.getCycleById(cycleId, projectId);

    const events = await prisma.event.findMany({
      where: {
        projectId,
        eventType: {
          in: ['issue.added_to_cycle', 'issue.removed_from_cycle', 'issue.updated', 'issue.moved']
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    let initialScopePoints = 0;
    let addedScopePoints = 0;
    let removedScopePoints = 0;

    // Track the estimate of each issue while it is in the cycle
    const currentScope = new Map<string, number>();

    events.forEach(event => {
      const payload: any = event.payload;
      const issueId = payload.issueId;
      
      if (event.eventType === 'issue.added_to_cycle' && payload.cycleId === cycleId) {
        const estimate = payload.estimate || 0;
        currentScope.set(issueId, estimate);
        
        if (cycle.startsAt && event.createdAt < cycle.startsAt) {
          initialScopePoints += estimate;
        } else if (cycle.startsAt && event.createdAt >= cycle.startsAt) {
          addedScopePoints += estimate;
        }
      } 
      else if (event.eventType === 'issue.removed_from_cycle' && payload.cycleId === cycleId) {
        const estimate = payload.estimate || 0;
        if (currentScope.has(issueId)) {
          if (cycle.startsAt && event.createdAt >= cycle.startsAt) {
            removedScopePoints += estimate;
          } else {
            // It was added and removed before cycle started, so it's not initial scope anymore
            initialScopePoints -= estimate;
          }
          currentScope.delete(issueId);
        }
      }
      else if (event.eventType === 'issue.updated' && currentScope.has(issueId)) {
        if (payload.changes?.estimate !== undefined) {
          const oldEstimate = currentScope.get(issueId) || 0;
          const newEstimate = payload.changes.estimate || 0;
          const diff = newEstimate - oldEstimate;
          
          if (cycle.startsAt && event.createdAt >= cycle.startsAt) {
            if (diff > 0) addedScopePoints += diff;
            if (diff < 0) removedScopePoints += Math.abs(diff);
          } else {
            initialScopePoints += diff;
          }
          currentScope.set(issueId, newEstimate);
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
    if (!cycle.startsAt || !cycle.endsAt) return [];

    const events = await prisma.event.findMany({
      where: {
        projectId,
        eventType: {
          in: ['issue.added_to_cycle', 'issue.removed_from_cycle', 'issue.updated', 'issue.moved']
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // We need to know which statuses are 'done'
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { issueStatuses: true }
    });
    const doneStatusIds = new Set(project?.issueStatuses.filter(s => s.isDone).map(s => s.id));

    // Day by day simulation
    const days: any[] = [];
    const startMs = new Date(cycle.startsAt).getTime();
    const endMs = new Date(cycle.endsAt).getTime();
    const dayMs = 1000 * 60 * 60 * 24;
    const totalDays = Math.ceil((endMs - startMs) / dayMs);

    // Playback state
    let remaining = 0; // Total points not done
    const issueState = new Map<string, { estimate: number, isDone: boolean, inCycle: boolean }>();
    
    // 1. Process all events before cycle start to build initial state
    let eventIdx = 0;
    while (eventIdx < events.length && events[eventIdx].createdAt.getTime() < startMs) {
      const event = events[eventIdx];
      const payload: any = event.payload;
      const issueId = payload.issueId;

      if (!issueState.has(issueId)) {
        issueState.set(issueId, { estimate: 0, isDone: false, inCycle: false });
      }
      const state = issueState.get(issueId)!;

      if (event.eventType === 'issue.added_to_cycle' && payload.cycleId === cycleId) {
        state.inCycle = true;
        state.estimate = payload.estimate || 0;
      } else if (event.eventType === 'issue.removed_from_cycle' && payload.cycleId === cycleId) {
        state.inCycle = false;
      } else if (event.eventType === 'issue.updated' && payload.changes) {
        if (payload.changes.estimate !== undefined) state.estimate = payload.changes.estimate || 0;
        if (payload.changes.statusId !== undefined) state.isDone = doneStatusIds.has(payload.changes.statusId);
      } else if (event.eventType === 'issue.moved' && payload.changes) {
        if (payload.changes.statusId !== undefined) state.isDone = doneStatusIds.has(payload.changes.statusId);
      }
      eventIdx++;
    }

    // Calculate initial remaining
    for (const [id, state] of issueState.entries()) {
      if (state.inCycle && !state.isDone) {
        remaining += state.estimate;
      }
    }

    // 2. Process day by day
    for (let day = 0; day <= totalDays; day++) {
      const dayEndMs = startMs + (day * dayMs);
      
      // Process events that happened on this day
      while (eventIdx < events.length && events[eventIdx].createdAt.getTime() <= dayEndMs) {
        const event = events[eventIdx];
        const payload: any = event.payload;
        const issueId = payload.issueId;

        if (!issueState.has(issueId)) {
          issueState.set(issueId, { estimate: 0, isDone: false, inCycle: false });
        }
        const state = issueState.get(issueId)!;
        const wasInScopeAndNotDone = state.inCycle && !state.isDone;
        const oldEstimate = state.estimate;

        if (event.eventType === 'issue.added_to_cycle' && payload.cycleId === cycleId) {
          state.inCycle = true;
          state.estimate = payload.estimate || 0;
        } else if (event.eventType === 'issue.removed_from_cycle' && payload.cycleId === cycleId) {
          state.inCycle = false;
        } else if (event.eventType === 'issue.updated' && payload.changes) {
          if (payload.changes.estimate !== undefined) state.estimate = payload.changes.estimate || 0;
          if (payload.changes.statusId !== undefined) state.isDone = doneStatusIds.has(payload.changes.statusId);
        } else if (event.eventType === 'issue.moved' && payload.changes) {
          if (payload.changes.statusId !== undefined) state.isDone = doneStatusIds.has(payload.changes.statusId);
        }

        const isInScopeAndNotDone = state.inCycle && !state.isDone;
        
        // Adjust remaining
        if (wasInScopeAndNotDone && !isInScopeAndNotDone) {
          remaining -= oldEstimate;
        } else if (!wasInScopeAndNotDone && isInScopeAndNotDone) {
          remaining += state.estimate;
        } else if (wasInScopeAndNotDone && isInScopeAndNotDone) {
          remaining += (state.estimate - oldEstimate);
        }

        eventIdx++;
      }

      // Record end of day snapshot
      days.push({
        day: day + 1, // 1-indexed for display
        remaining: Math.max(0, remaining),
        ideal: 0 // Will calculate below
      });
    }

    // 3. Set ideal burndown line
    // Ideal starts at the first day's remaining, and linearly goes to 0 by the last day
    const startRemaining = days[0]?.remaining || 0;
    for (let i = 0; i <= totalDays; i++) {
      days[i].ideal = Math.max(0, startRemaining - (startRemaining / totalDays) * i);
    }

    return days;
  }
};
