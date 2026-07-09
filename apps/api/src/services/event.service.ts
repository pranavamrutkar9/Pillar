import { prisma } from "../db/client.js";
import { emit as publishToQueue } from "../events/eventBus.js";

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

      // Fan out to BullMQ queues for background processing (Realtime, Activity, etc.)
      await publishToQueue(eventType, { ...payload, ...metadata });
    } catch (error) {
      console.error("Failed to emit event:", error);
    }
  }
};
