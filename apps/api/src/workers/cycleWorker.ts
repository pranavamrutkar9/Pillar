import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { prisma } from "../db/client.js";
import { eventService } from "../services/event.service.js";

export const cycleWorker = new Worker("pillar-cycle", async (job) => {
  const eventType = job.name;
  const payload = job.data.payload || job.data;
  const projectId = job.data.projectId;

  if (eventType === 'cycle.completed' && payload.cycleId) {
    const cycleId = payload.cycleId;
    const completedCycle = await prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!completedCycle) return;

    // 1. Find all unfinished issues in the cycle
    const unfinishedIssues = await prisma.issue.findMany({
      where: {
        cycleId,
        status: { isDone: false }
      },
      include: { status: true }
    });

    if (unfinishedIssues.length === 0) return;

    // 2. Find target cycle (Deterministic Carry-Forward)
    // Earliest PLANNED cycle whose startsAt >= completed_cycle.endsAt
    let targetCycleId: string | null = null;
    const plannedCycle = await prisma.cycle.findFirst({
      where: {
        projectId,
        status: 'PLANNED',
        startsAt: { gte: completedCycle.endsAt }
      },
      orderBy: { startsAt: 'asc' }
    });

    if (plannedCycle) {
      targetCycleId = plannedCycle.id;
    } else {
      // Fallback: Current ACTIVE cycle
      const activeCycle = await prisma.cycle.findFirst({
        where: { projectId, status: 'ACTIVE' }
      });
      if (activeCycle) {
        targetCycleId = activeCycle.id;
      }
    }

    // 3. Move issues and emit `issue.carried_forward`
    for (const issue of unfinishedIssues) {
      // Update issue
      await prisma.issue.update({
        where: { id: issue.id },
        data: { cycleId: targetCycleId }
      });

      // We explicitly emit `issue.carried_forward` here.
      // Other workers can process this (e.g. notifications).
      await eventService.emit('issue.carried_forward', {
        issueId: issue.id,
        oldCycleId: cycleId,
        cycleId: targetCycleId,
        estimate: issue.estimate
      }, { projectId, actorId: 'system' });
      
      // Also emit removed and added so that cycle analytics history works generically
      await eventService.emit('issue.removed_from_cycle', {
        issueId: issue.id,
        cycleId: cycleId,
        estimate: issue.estimate
      }, { projectId, actorId: 'system' });
      
      if (targetCycleId) {
        await eventService.emit('issue.added_to_cycle', {
          issueId: issue.id,
          cycleId: targetCycleId,
          estimate: issue.estimate
        }, { projectId, actorId: 'system' });
      }
    }
  }

}, { connection: redis as any });

cycleWorker.on("error", (err: any) => {
  if (err.message && err.message.includes("ECONNRESET")) return;
  console.error("[CycleWorker Error]", err);
});
