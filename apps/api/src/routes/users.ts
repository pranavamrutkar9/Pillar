import { Router } from 'express';
import { prisma } from '../db/client.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router();

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      avatarUrl: true,
      githubUsername: true,
      createdAt: true,
      _count: {
        select: {
          workspaceMembers: true,
          projectMembers: true,
          issuesAssigned: true,
          issuesCreated: true,
          comments: true,
        }
      }
    }
  });

  if (!user) {
    throw Object.assign(new Error('User not found'), { name: 'NotFoundError' });
  }

  return successResponse(res, user);
}));

router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { username, avatarUrl } = req.body;

  const dataToUpdate: any = {};
  if (username !== undefined) dataToUpdate.username = username;
  if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl;

  const user = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
  });

  const { passwordHash: _, ...safeUser } = user;
  return successResponse(res, safeUser);
}));

export default router;
