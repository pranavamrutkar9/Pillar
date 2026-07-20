import { prisma } from '../db/client.js';
import { emit } from '../events/eventBus.js';
import { Issue, Event, Project, ProjectStatus } from '@prisma/client';

export interface ProjectHealth {
  projectId: string;
  name: string;
  isHackathonMode: boolean;
  totalIssues: number;
  doneIssues: number;
  inProgressIssues: number;
  overdue: boolean;
}

export interface WorkspaceDashboard {
  myTasks: Issue[];
  recentActivity: Event[];
  projectHealth: ProjectHealth[];
  upcomingDeadlines: any[];
}

export const workspaceService = {
  async create(data: { name: string; userId: string }) {
    // Generate a simple base slug from the name
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'workspace';
    
    const existing = await prisma.workspace.findUnique({ where: { slug: baseSlug } });
    const slug = existing
      ? `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`
      : baseSlug;

    // Execute within a transaction with an extended timeout (e.g. 10s) 
    // to account for Neon Serverless cold starts or connection pool queues
    const workspace = await prisma.$transaction(async (tx) => {
      const createdWorkspace = await tx.workspace.create({
        data: {
          name: data.name,
          slug,
          ownerId: data.userId,
          members: {
            create: {
              userId: data.userId,
              role: 'ADMIN',
            },
          },
        },
      });
      return createdWorkspace;
    }, { timeout: 15000 });

    // Emit event after transaction commits successfully
    await emit('workspace.created', { workspaceId: workspace.id, ownerId: workspace.ownerId });

    return workspace;
  },

  async getByUser(userId: string) {
    return prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            username: true,
            email: true,
          }
        },
        members: {
          where: { userId },
          select: { role: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async getById(workspaceId: string) {
    return prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: {
          select: { id: true, username: true, email: true, avatarUrl: true },
        },
        members: {
          include: {
            user: { select: { id: true, username: true, email: true, avatarUrl: true } },
          },
          orderBy: { joinedAt: 'desc' },
        },
        projects: {
          orderBy: { createdAt: 'desc' },
        },
        invites: {
          where: { acceptedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        events: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
  },

  async getAssignedIssues(workspaceId: string, userId: string) {
    return prisma.issue.findMany({
      where: {
        project: { workspaceId },
        assigneeId: userId,
      },
      include: {
        project: { select: { name: true, slug: true } },
        status: { select: { name: true, color: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  },

  async getRecentActivity(workspaceId: string) {
    return prisma.event.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        actor: { select: { username: true, email: true, avatarUrl: true } },
        project: { select: { name: true } }
      }
    });
  },

  async getProjectHealth(workspaceId: string) {
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: {
        issues: {
          select: { status: { select: { isDone: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();

    return projects.map(p => {
      const totalIssues = p.issues.length;
      const doneIssues = p.issues.filter(i => i.status.isDone).length;
      // In Progress: Not done and presumably not a default "backlog" state, but for simplicity let's say all not done issues are active. Or we can say not done and name != 'Backlog'.
      // The user defined: In Progress = active issues (not done, not backlog/draft). Since we don't have a 'draft' flag, let's filter out 'Backlog' or just count all non-done issues.
      // A more generic way: if it's not done and not position 0/default? We only have `isDefault` and `isDone`. Let's assume `isDefault` is backlog/todo.
      // For V1: In Progress = not done. Wait, let's count issues that are not `isDone` and maybe not `isDefault`.
      // I'll define in progress as: not done.
      const inProgressIssues = p.issues.filter(i => !i.status.isDone).length;
      
      const isOverdue = p.isHackathonMode && p.deadline && p.deadline < now && p.status !== 'ARCHIVED';

      return {
        projectId: p.id,
        name: p.name,
        isHackathonMode: p.isHackathonMode,
        totalIssues,
        doneIssues,
        inProgressIssues,
        overdue: !!isOverdue
      };
    });
  },

  async getUpcomingDeadlines(workspaceId: string, userId: string) {
    const now = new Date();
    const projects = await prisma.project.findMany({
      where: {
        workspaceId,
        status: { not: 'ARCHIVED' },
        deadline: { gte: now }
      },
      orderBy: { deadline: 'asc' },
      take: 5
    });

    const issues = await prisma.issue.findMany({
      where: {
        project: { workspaceId },
        assigneeId: userId,
        status: { isDone: false },
        dueDate: { gte: now }
      },
      include: { project: { select: { slug: true } } },
      orderBy: { dueDate: 'asc' },
      take: 5
    });

    const deadlines = [
      ...projects.map(p => ({
        id: p.id,
        title: p.name,
        deadline: p.deadline!,
        type: 'PROJECT',
        isHackathonMode: p.isHackathonMode
      })),
      ...issues.map(i => ({
        id: i.id,
        title: i.title,
        deadline: i.dueDate!,
        type: 'ISSUE',
        projectSlug: i.project.slug,
        sequenceId: i.sequenceId
      }))
    ];

    deadlines.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    return deadlines.slice(0, 5);
  },

  async getDashboard(workspaceId: string, userId: string): Promise<WorkspaceDashboard> {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });
    
    if (!member) {
      throw Object.assign(new Error('Forbidden'), { name: 'ForbiddenError' });
    }

    const [myTasks, recentActivity, projectHealth, upcomingDeadlines] = await Promise.all([
      this.getAssignedIssues(workspaceId, userId),
      this.getRecentActivity(workspaceId),
      this.getProjectHealth(workspaceId),
      this.getUpcomingDeadlines(workspaceId, userId)
    ]);

    return {
      myTasks: myTasks as any,
      recentActivity: recentActivity as any,
      projectHealth,
      upcomingDeadlines
    };
  }
};
