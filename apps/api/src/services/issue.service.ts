import { prisma } from "../db/client.js";
import { CreateIssueInput, UpdateIssueInput } from "../validators/issue.schema.js";
import { activityService } from "./activity.service.js";
import { eventService } from "./event.service.js";

export const issueService = {
  async createIssue(projectId: string, creatorId: string, data: CreateIssueInput) {
    const issue = await prisma.$transaction(async (tx) => {
      // Atomically increment the sequence ID for this project
      const project = await tx.project.update({
        where: { id: projectId },
        data: { nextIssueSequence: { increment: 1 } },
        select: { nextIssueSequence: true },
      });
      const nextSequenceId = project.nextIssueSequence - 1;

      // Create issue
      const newIssue = await tx.issue.create({
        data: {
          projectId,
          creatorId,
          title: data.title,
          description: (data.description ?? null) as any,
          statusId: data.statusId,
          priority: data.priority,
          assigneeId: data.assigneeId,
          dueDate: data.dueDate,
          estimate: data.estimate,
          sequenceId: nextSequenceId,
          ...(data.labelIds && data.labelIds.length > 0 && {
            labels: {
              create: data.labelIds.map((labelId) => ({
                label: { connect: { id: labelId } }
              }))
            }
          })
        },
      });

      // Create activity log
      await tx.issueActivity.create({
        data: activityService.createActivityPayload(newIssue.id, creatorId, 'created', null, newIssue),
      });

      return newIssue;
    });

    // Emit event outside transaction
    await eventService.emit('issue.created', { issue }, { projectId, actorId: creatorId });

    return issue;
  },

  async updateIssue(issueId: string, actorId: string, data: UpdateIssueInput) {
    const result = await prisma.$transaction(async (tx) => {
      const oldIssue = await tx.issue.findUnique({ where: { id: issueId } });
      if (!oldIssue) throw new Error("Issue not found");

      const newIssue = await tx.issue.update({
        where: { id: issueId },
        data: {
          title: data.title,
          description: data.description !== undefined ? data.description as any : undefined,
          statusId: data.statusId,
          priority: data.priority,
          assigneeId: data.assigneeId,
          dueDate: data.dueDate,
          estimate: data.estimate,
        },
      });

      if (data.labelIds !== undefined) {
        // Delete all old label mappings
        await tx.issueLabelMap.deleteMany({
          where: { issueId },
        });

        if (data.labelIds.length > 0) {
          await tx.issueLabelMap.createMany({
            data: data.labelIds.map((labelId) => ({
              issueId,
              labelId,
            })),
          });
        }
      }

      // Compute changed fields for activity logging
      const changedKeys = Object.keys(data).filter(
        (key) => (data as any)[key] !== undefined && (data as any)[key] !== (oldIssue as any)[key]
      );

      if (changedKeys.length > 0) {
        const oldValues: any = {};
        const newValues: any = {};
        
        changedKeys.forEach(key => {
          oldValues[key] = (oldIssue as any)[key];
          newValues[key] = (newIssue as any)[key];
        });

        await tx.issueActivity.create({
          data: activityService.createActivityPayload(issueId, actorId, 'updated', oldValues, newValues),
        });
      }

      return { oldIssue, newIssue, changedKeys };
    });

    if (result.changedKeys.length > 0) {
      await eventService.emit('issue.updated', { 
        issueId, 
        changes: result.changedKeys 
      }, { projectId: result.newIssue.projectId, actorId });
    }

    return result.newIssue;
  },

  async getIssuesByProject(projectId: string) {
    return await prisma.issue.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, username: true, avatarUrl: true } },
        status: true,
        labels: { include: { label: true } },
      },
      orderBy: { sequenceId: 'desc' },
    });
  },

  async getIssueById(issueId: string) {
    return await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        assignee: { select: { id: true, username: true, avatarUrl: true } },
        creator: { select: { id: true, username: true, avatarUrl: true } },
        status: true,
        labels: { include: { label: true } },
        project: { select: { id: true, name: true, slug: true } },
        activities: {
          include: { actor: { select: { id: true, username: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  async getIssueBySequenceId(projectId: string, sequenceId: number) {
    return await prisma.issue.findUnique({
      where: { projectId_sequenceId: { projectId, sequenceId } },
      include: {
        assignee: { select: { id: true, username: true, avatarUrl: true } },
        creator: { select: { id: true, username: true, avatarUrl: true } },
        status: true,
        labels: { include: { label: true } },
        project: { select: { id: true, name: true, slug: true } },
        activities: {
          include: { actor: { select: { id: true, username: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
};
