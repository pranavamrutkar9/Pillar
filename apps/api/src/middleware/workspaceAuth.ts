import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client.js';

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export const requireWorkspaceAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!userId) throw new UnauthorizedError('Missing user');
    if (!workspaceId) throw new Error('Bad Request: Missing workspaceId parameter');

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenError('Requires workspace admin role');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireWorkspaceMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!userId) throw new UnauthorizedError('Missing user');
    if (!workspaceId) throw new Error('Bad Request: Missing workspaceId parameter');

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenError('Requires workspace member role');
    }

    next();
  } catch (error) {
    next(error);
  }
};
