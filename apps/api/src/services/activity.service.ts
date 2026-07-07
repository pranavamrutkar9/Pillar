import { Prisma } from "@prisma/client";

export const activityService = {
  createActivityPayload(issueId: string, actorId: string, action: string, oldValue?: any, newValue?: any) {
    return {
      issueId,
      actorId,
      action,
      oldValue: oldValue ? (oldValue as Prisma.InputJsonValue) : Prisma.JsonNull,
      newValue: newValue ? (newValue as Prisma.InputJsonValue) : Prisma.JsonNull,
    };
  }
};
