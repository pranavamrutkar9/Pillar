import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client.js';

export const requireWorkspaceAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const workspaceId = req.params.workspaceId;

    if (!userId) {
       res.status(401).json({ error: 'Unauthorized: Missing user' });
       return;
    }

    if (!workspaceId) {
       res.status(400).json({ error: 'Bad Request: Missing workspaceId parameter' });
       return;
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member || member.role !== 'ADMIN') {
       res.status(403).json({ error: 'Forbidden: Requires workspace admin role' });
       return;
    }

    next();
  } catch (error) {
    console.error('Authorization Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
