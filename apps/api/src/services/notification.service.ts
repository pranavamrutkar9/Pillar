import { prisma } from "../db/client.js";
import { NotificationType } from "@prisma/client";

export const notificationService = {
  async createNotification(data: {
    userId: string;
    actorId?: string;
    type: NotificationType;
    title: string;
    body: string;
    metadata: any;
  }) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        actorId: data.actorId,
        type: data.type,
        title: data.title,
        body: data.body,
        metadata: data.metadata,
      },
    });
  },

  async getUserNotifications(userId: string, limit = 50) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          }
        }
      }
    });
  },

  async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { 
        id: notificationId,
        userId: userId, // ensure user owns it
      },
      data: { readAt: new Date() },
    });
  },
  
  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { 
        userId: userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  },
};
