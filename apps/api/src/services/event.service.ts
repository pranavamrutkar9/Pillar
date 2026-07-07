import { prisma } from "../db/client.js";

export const eventService = {
  /**
   * Emit an event AFTER a transaction has successfully committed.
   */
  async emit(eventType: string, payload: any, metadata: { workspaceId?: string, projectId?: string, actorId?: string } = {}) {
    try {
      // Create Event record in database (append-only)
      await prisma.event.create({
        data: {
          eventType,
          payload,
          workspaceId: metadata.workspaceId,
          projectId: metadata.projectId,
          actorId: metadata.actorId,
        },
      });

      // TODO: If using BullMQ or external queue, emit it here, e.g.:
      // queue.add(eventType, payload)
    } catch (error) {
      console.error("Failed to emit event:", error);
    }
  }
};
