import { prisma } from "../db/client.js";
import { CreateProjectInput } from "../validators/project.schema.js";
import { eventService } from "./event.service.js";

export const projectService = {
  async createProject(workspaceId: string, userId: string, data: CreateProjectInput) {
    let finalSlug = data.slug;
    if (!finalSlug) {
      let baseSlug = data.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3);
      if (!baseSlug) baseSlug = 'PRJ';
      
      let counter = 1;
      finalSlug = baseSlug;
      while (await prisma.project.findUnique({ where: { workspaceId_slug: { workspaceId, slug: finalSlug } } })) {
        finalSlug = `${baseSlug}${counter}`;
        counter++;
      }
    }

    // Start a transaction: Create project + default statuses
    const project = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          workspaceId,
          name: data.name,
          slug: finalSlug,
          description: data.description,
          isHackathonMode: data.isHackathonMode,
          deadline: data.deadline ? new Date(data.deadline) : null,
          createdBy: userId,
        },
      });

      // Create default statuses
      await tx.issueStatus.createMany({
        data: [
          {
            projectId: project.id,
            name: "Todo",
            color: "#e2e8f0",
            position: 1,
            isDefault: true,
            isDone: false,
          },
          {
            projectId: project.id,
            name: "In Progress",
            color: "#60a5fa",
            position: 2,
            isDefault: false,
            isDone: false,
          },
          {
            projectId: project.id,
            name: "Done",
            color: "#4ade80",
            position: 3,
            isDefault: false,
            isDone: true,
          },
        ],
      });

      // Add creator as ADMIN project member
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: 'ADMIN',
        },
      });

      return project;
    });

    await eventService.emit('project.created', { projectId: project.id }, { 
      workspaceId, 
      actorId: userId 
    });

    return project;
  },

  async getProjectsByWorkspace(workspaceId: string) {
    return await prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProjectById(projectId: string) {
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        issueStatuses: {
          orderBy: { position: 'asc' }
        },
        issueLabels: true,
        workspace: {
          include: {
            members: {
              include: { user: { select: { id: true, username: true, email: true, avatarUrl: true } } }
            }
          }
        },
        members: {
          include: { user: { select: { id: true, username: true, email: true, avatarUrl: true } } }
        }
      }
    });
  },

  async createProjectShare(projectId: string, userId: string, expiresAt?: Date) {
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    return await prisma.projectShare.create({
      data: {
        projectId,
        createdBy: userId,
        token,
        expiresAt,
      }
    });
  },

  async getProjectShares(projectId: string) {
    return await prisma.projectShare.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async revokeProjectShare(shareId: string) {
    return await prisma.projectShare.delete({
      where: { id: shareId }
    });
  },
};

