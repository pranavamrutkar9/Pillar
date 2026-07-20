import { Worker, Queue } from 'bullmq';
import { redis } from '../lib/redis.js';
import { notificationService } from '../services/notification.service.js';
import { prisma } from '../db/client.js';
import { Emitter } from '@socket.io/redis-emitter';

export const emailQueue = new Queue('pillar-email', { connection: redis as any });
const io = new Emitter(redis as any);

export const notificationWorker = new Worker('pillar-notification', async (job) => {
  const eventType = job.name;
  const payload = job.data;

  try {
    if (eventType === 'issue.moved' || (eventType === 'issue.updated' && payload.changes?.statusId)) {
      const issue = await prisma.issue.findUnique({ where: { id: payload.issueId } });
      if (issue && issue.assigneeId && issue.assigneeId !== payload.actorId) {
        const notif = await notificationService.createNotification({
          userId: issue.assigneeId,
          actorId: payload.actorId,
          type: 'STATUS_CHANGED',
          title: 'Issue Status Changed',
          body: `Issue ${issue.title} status was changed.`,
          metadata: { issueId: issue.id, projectId: issue.projectId },
        });
        io.to(`user:${issue.assigneeId}`).emit('notification.created', notif);

        if (issue.priority === 'URGENT') {
          await emailQueue.add('email.send', {
            toUserId: issue.assigneeId,
            subject: `URGENT: Status changed for ${issue.title}`,
            text: `The status of ${issue.title} has been updated.`,
          });
        }
      }
    } 
    
    if (eventType === 'issue.commented') {
      const issue = await prisma.issue.findUnique({ where: { id: payload.issueId } });
      if (issue && payload.mentionedUserIds) {
        for (const userId of payload.mentionedUserIds) {
          if (userId !== payload.actorId) {
            const notif = await notificationService.createNotification({
              userId,
              actorId: payload.actorId,
              type: 'COMMENT_MENTION',
              title: 'You were mentioned',
              body: `You were mentioned in a comment on ${issue.title}`,
              metadata: { issueId: issue.id, commentId: payload.comment?.id, projectId: issue.projectId },
            });
            io.to(`user:${userId}`).emit('notification.created', notif);

            await emailQueue.add('email.send', {
              toUserId: userId,
              subject: `You were mentioned in ${issue.title}`,
              text: `You were mentioned in a comment on ${issue.title}.`,
            });
          }
        }
      }
    } 
    
    if ((eventType === 'issue.created' && payload.issue?.assigneeId) || (eventType === 'issue.updated' && payload.changes?.assigneeId !== undefined)) {
       const issueId = eventType === 'issue.created' ? payload.issue.id : payload.issueId;
       const issue = await prisma.issue.findUnique({ where: { id: issueId } });
       if (issue && issue.assigneeId && issue.assigneeId !== payload.actorId) {
          // If it's updated and assignee didn't change (but was passed), don't notify unless it really changed? 
          // Actually, if assigneeId is in changes, it means it changed to this new assigneeId.
          // Wait, if it changed to null, issue.assigneeId is null, so it won't trigger. Correct!
          const notif = await notificationService.createNotification({
            userId: issue.assigneeId,
            actorId: payload.actorId,
            type: 'ISSUE_ASSIGNED',
            title: 'Issue Assigned',
            body: `You were assigned to ${issue.title}`,
            metadata: { issueId: issue.id, projectId: issue.projectId },
          });
          io.to(`user:${issue.assigneeId}`).emit('notification.created', notif);

          await emailQueue.add('email.send', {
            toUserId: issue.assigneeId,
            subject: `You were assigned to ${issue.title}`,
            text: `You have been assigned to ${issue.title}.`,
          });
       }
    }
  } catch (error) {
    console.error(`[NotificationWorker] Failed to process ${eventType}:`, error);
  }
}, { connection: redis as any });

notificationWorker.on('error', (err: any) => {
  if (err.message && err.message.includes('ECONNRESET')) return;
  console.error('[NotificationWorker Error]', err);
});
