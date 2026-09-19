import { prisma } from "../db/client.js";
import { CreateIssueInput, UpdateIssueInput } from "../validators/issue.schema.js";
import { activityService } from "./activity.service.js";
import { eventService } from "./event.service.js";

export const issueService = {
  async createIssue(projectId: string, creatorId: string, data: CreateIssueInput) {
    const issue = await prisma.$transaction(async (tx) => {
      if (data.cycleId) {
        const cycle = await tx.cycle.findUnique({ where: { id: data.cycleId } });
        if (!cycle || cycle.projectId !== projectId) throw new Error("Invalid cycle or cross-project assignment not allowed");
      }
      if (data.moduleId) {
        const module = await tx.module.findUnique({ where: { id: data.moduleId } });
        if (!module || module.projectId !== projectId) throw new Error("Invalid module or cross-project assignment not allowed");
      }

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
          cycleId: data.cycleId,
          moduleId: data.moduleId,
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

    if (issue.cycleId) {
      await eventService.emit('issue.added_to_cycle', { 
        issueId: issue.id, 
        cycleId: issue.cycleId, 
        estimate: issue.estimate 
      }, { projectId, actorId: creatorId });
    }

    return issue;
  },

  async updateIssue(issueId: string, actorId: string, data: UpdateIssueInput) {
    const result = await prisma.$transaction(async (tx) => {
      const oldIssue = await tx.issue.findUnique({ where: { id: issueId } });
      if (!oldIssue) throw new Error("Issue not found");
      const projectId = oldIssue.projectId;

      if (data.cycleId !== undefined && data.cycleId !== null) {
        const cycle = await tx.cycle.findUnique({ where: { id: data.cycleId } });
        if (!cycle || cycle.projectId !== projectId) throw new Error("Invalid cycle or cross-project assignment not allowed");
      }
      if (data.moduleId !== undefined && data.moduleId !== null) {
        const module = await tx.module.findUnique({ where: { id: data.moduleId } });
        if (!module || module.projectId !== projectId) throw new Error("Invalid module or cross-project assignment not allowed");
      }

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
          cycleId: data.cycleId,
          moduleId: data.moduleId,
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
      const changedValues: any = {};
      result.changedKeys.forEach((key: string) => {
        changedValues[key] = (result.newIssue as any)[key];
      });
      
      const projectId = result.newIssue.projectId;

      await eventService.emit('issue.updated', { 
        issueId, 
        changes: changedValues,
        cycleId: result.newIssue.cycleId,
        estimate: result.newIssue.estimate
      }, { projectId, actorId });

      // Cycle added/removed tracking
      const oldCycleId = result.oldIssue.cycleId;
      const newCycleId = result.newIssue.cycleId;
      const newEstimate = result.newIssue.estimate;

      if (oldCycleId !== newCycleId) {
        if (oldCycleId) {
          await eventService.emit('issue.removed_from_cycle', {
            issueId,
            cycleId: oldCycleId,
            estimate: result.oldIssue.estimate // Historical snapshot of estimate at removal
          }, { projectId, actorId });
        }
        if (newCycleId) {
          await eventService.emit('issue.added_to_cycle', {
            issueId,
            cycleId: newCycleId,
            estimate: newEstimate // Historical snapshot of estimate at addition
          }, { projectId, actorId });
        }
      }

      if (result.oldIssue.moduleId !== result.newIssue.moduleId) {
        await eventService.emit('issue.module_changed', {
          issueId,
          oldModuleId: result.oldIssue.moduleId,
          newModuleId: result.newIssue.moduleId,
        }, { projectId, actorId });
      }
    }

    return result.newIssue;
  },

  async moveIssue(issueId: string, actorId: string, statusId: string, position: number) {
    const result = await prisma.$transaction(async (tx) => {
      const oldIssue = await tx.issue.findUnique({ where: { id: issueId } });
      if (!oldIssue) throw new Error("Issue not found");

      const newIssue = await tx.issue.update({
        where: { id: issueId },
        data: { statusId, position },
      });

      // Compute changed fields for activity logging
      if (oldIssue.statusId !== statusId) {
        await tx.issueActivity.create({
          data: activityService.createActivityPayload(issueId, actorId, 'updated', { statusId: oldIssue.statusId }, { statusId: newIssue.statusId }),
        });
      }

      return { oldIssue, newIssue };
    });

    await eventService.emit('issue.moved', { 
      issueId, 
      changes: { statusId, position },
      cycleId: result.newIssue.cycleId,
      estimate: result.newIssue.estimate
    }, { projectId: result.newIssue.projectId, actorId });

    return result.newIssue;
  },

  async getIssuesByProject(projectId: string) {
    return await prisma.issue.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, username: true, avatarUrl: true } },
        status: true,
        labels: { include: { label: true } },
        cycle: true,
        module: true,
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
        cycle: true,
        module: true,
        project: { select: { id: true, name: true, slug: true, githubRepositoryId: true, githubMergedStatusId: true } },
        activities: {
          include: { actor: { select: { id: true, username: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
        PullRequestIssue: { include: { pullRequest: true } }
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
        cycle: true,
        module: true,
        project: { select: { id: true, name: true, slug: true, githubRepositoryId: true, githubMergedStatusId: true } },
        activities: {
          include: { actor: { select: { id: true, username: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
        PullRequestIssue: { include: { pullRequest: true } }
      },
    });
  }
};
