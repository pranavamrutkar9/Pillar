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

    await eventService.emit('issue.commented', { issueId, comment: result }, { projectId: issue.projectId, actorId: authorId });

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
