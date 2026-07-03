import { prisma } from '../db/client.js';
import { emit } from '../events/eventBus.js';

export const workspaceService = {
  async create(data: { name: string; userId: string }) {
    // Generate a simple unique slug from the name
    let slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (!slug) slug = 'workspace';
    
    // Add random string to guarantee uniqueness
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    slug = `${slug}-${uniqueSuffix}`;

    // Execute within a transaction
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
    });

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
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
};
