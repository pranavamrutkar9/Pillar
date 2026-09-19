import { prisma } from "../db/client.js";
import { eventService } from "./event.service.js";

export const moduleService = {
  async getModulesByProject(projectId: string) {
    return prisma.module.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async getModuleById(moduleId: string, projectId: string) {
    const mod = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        issues: {
          include: {
            assignee: { select: { id: true, username: true, avatarUrl: true } },
            status: true,
          }
        }
      }
    });

    if (!mod || mod.projectId !== projectId) {
      throw new Error("Module not found");
    }

    return mod;
  },

  async createModule(projectId: string, actorId: string, data: { name: string; description?: string }) {
    const mod = await prisma.module.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
      }
    });

    await eventService.emit('module.created', { module: mod }, { projectId, actorId });

    return mod;
  },

  async updateModule(moduleId: string, projectId: string, actorId: string, data: { name?: string; description?: string }) {
    const existing = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!existing || existing.projectId !== projectId) throw new Error("Module not found");

    const mod = await prisma.module.update({
      where: { id: moduleId },
      data: {
        name: data.name,
        description: data.description,
      }
    });

    await eventService.emit('module.updated', { module: mod }, { projectId, actorId });
    return mod;
  },

  async deleteModule(moduleId: string, projectId: string, actorId: string) {
    const existing = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!existing || existing.projectId !== projectId) throw new Error("Module not found");

    await prisma.module.delete({ where: { id: moduleId } });
    await eventService.emit('module.deleted', { moduleId }, { projectId, actorId });
  },

  async getModuleProgress(moduleId: string, projectId: string) {
    const mod = await this.getModuleById(moduleId, projectId);
    
    const total = mod.issues.length;
    if (total === 0) return { total: 0, completed: 0, percentage: 0 };

    const completed = mod.issues.filter(issue => issue.status.isDone).length;
    const percentage = Math.round((completed / total) * 100);

    return { total, completed, percentage };
  }
};
