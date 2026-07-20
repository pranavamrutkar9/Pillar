import { prisma } from "../db/client.js";
import { CreateCommentInput } from "../validators/comment.schema.js";
import { activityService } from "./activity.service.js";
import { eventService } from "./event.service.js";

export const commentService = {
  async createComment(issueId: string, authorId: string, data: CreateCommentInput) {
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) throw new Error("Issue not found");

    const result = await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          issueId,
          authorId,
          body: data.body,
          parentId: data.parentId || null,
        },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } }
        }
      });

      // Create activity for the comment
      await tx.issueActivity.create({
        data: activityService.createActivityPayload(issueId, authorId, 'commented', null, { commentId: comment.id }),
      });

      return comment;
    });

    const bodyString = typeof data.body === 'string' ? data.body : JSON.stringify(data.body);
    const usernames = Array.from(bodyString.matchAll(/@([a-zA-Z0-9_-]+)/g)).map(m => m[1]);
    const uniqueUsernames = [...new Set(usernames)];
    let mentionedUserIds: string[] = [];

    if (uniqueUsernames.length > 0) {
      const users = await prisma.user.findMany({
        where: { username: { in: uniqueUsernames } },
        select: { id: true }
      });
      mentionedUserIds = users.map(u => u.id);
    }

    await eventService.emit('issue.commented', { issueId, comment: result, mentionedUserIds }, { projectId: issue.projectId, actorId: authorId });

    return result;
  },

  async getCommentsByIssue(issueId: string) {
    return await prisma.comment.findMany({
      where: { issueId },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' },
    });
  }
};
