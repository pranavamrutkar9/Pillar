import { prisma } from "../db/client.js";
import { eventService } from "./event.service.js";

export const cycleService = {
  async getCyclesByProject(projectId: string) {
    return prisma.cycle.findMany({
      where: { projectId },
      orderBy: { startsAt: 'asc' },
    });
  },

  async getCycleById(cycleId: string, projectId: string) {
    const cycle = await prisma.cycle.findUnique({
      where: { id: cycleId },
      include: {
        issues: {
          include: {
            assignee: { select: { id: true, username: true, avatarUrl: true } },
            status: true,
          }
        }
      }
    });

    if (!cycle || cycle.projectId !== projectId) {
      throw new Error("Cycle not found");
    }

    return cycle;
  },

  async createCycle(projectId: string, actorId: string, data: { name: string; description?: string; startsAt: Date; endsAt: Date }) {
    if (data.startsAt >= data.endsAt) {
      throw new Error("Cycle start date must be before end date");
    }

    const cycle = await prisma.cycle.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        status: "PLANNED",
      }
    });

    await eventService.emit('cycle.created', { cycle }, { projectId, actorId });

    return cycle;
  },

  async updateCycle(cycleId: string, projectId: string, actorId: string, data: { name?: string; description?: string; startsAt?: Date; endsAt?: Date }) {
    const existing = await prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!existing || existing.projectId !== projectId) throw new Error("Cycle not found");

    const startsAt = data.startsAt ?? existing.startsAt;
    const endsAt = data.endsAt ?? existing.endsAt;

    if (startsAt >= endsAt) {
      throw new Error("Cycle start date must be before end date");
    }

    const cycle = await prisma.cycle.update({
      where: { id: cycleId },
      data: {
        name: data.name,
        description: data.description,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
      }
    });

    await eventService.emit('cycle.updated', { cycle }, { projectId, actorId });
    return cycle;
  },

  async deleteCycle(cycleId: string, projectId: string, actorId: string) {
    const existing = await prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!existing || existing.projectId !== projectId) throw new Error("Cycle not found");

    await prisma.cycle.delete({ where: { id: cycleId } });
    await eventService.emit('cycle.deleted', { cycleId }, { projectId, actorId });
  },

  async startCycle(cycleId: string, projectId: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const cycle = await tx.cycle.findUnique({ where: { id: cycleId } });
      if (!cycle || cycle.projectId !== projectId) throw new Error("Cycle not found");

      if (cycle.status !== "PLANNED") {
        throw new Error("Only PLANNED cycles can be started");
      }

      // Ensure no other active cycle exists for this project
      const activeCycle = await tx.cycle.findFirst({
        where: { projectId, status: "ACTIVE" }
      });

      if (activeCycle) {
        throw new Error("Another cycle is already ACTIVE for this project");
      }

      const startedCycle = await tx.cycle.update({
        where: { id: cycleId },
        data: { status: "ACTIVE" }
      });

      // Emit outside transaction in real app, but for simplicity we do it here or let caller do it
      await eventService.emit('cycle.started', { cycle: startedCycle }, { projectId, actorId });

      return startedCycle;
    });
  },

  async completeCycle(cycleId: string, projectId: string, actorId: string) {
    const cycle = await prisma.$transaction(async (tx) => {
      const existing = await tx.cycle.findUnique({ where: { id: cycleId } });
      if (!existing || existing.projectId !== projectId) throw new Error("Cycle not found");

      if (existing.status !== "ACTIVE") {
        throw new Error("Only ACTIVE cycles can be completed");
      }

      const completedCycle = await tx.cycle.update({
        where: { id: cycleId },
        data: { status: "COMPLETED" }
      });

      return completedCycle;
    });

    // The cycleWorker listens to this event to perform carry-forward
    await eventService.emit('cycle.completed', { cycleId, projectId }, { projectId, actorId });
    return cycle;
  }
};
