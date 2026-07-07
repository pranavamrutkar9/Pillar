import { prisma } from '../db/client.js';
import { emit } from '../events/eventBus.js';

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
};
