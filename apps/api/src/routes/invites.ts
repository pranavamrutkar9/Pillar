import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { inviteService } from '../services/inviteService.js';
import { prisma } from '../db/client.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router();

// GET /api/invites/pending - Protected endpoint to get pending invites for the logged-in user
router.get('/pending', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) {
    throw Object.assign(new Error('User email not found'), { name: 'UnauthorizedError' });
  }

  const invites = await inviteService.getPendingInvitesForEmail(user.email);
  return successResponse(res, invites);
}));

// GET /api/invites/:token - Public endpoint to view invite details
router.get('/:token', asyncHandler(async (req, res) => {
  const token = req.params.token as string;
  
  if (!token) {
    throw new Error('Token is required');
  }

  const invite = await inviteService.getInviteByToken(token);
  
  if (!invite) {
    throw Object.assign(new Error('Invite not found or invalid'), { name: 'NotFoundError' });
  }

  return successResponse(res, invite);
}));

// POST /api/invites/:token/accept - Protected endpoint to accept invite
router.post('/:token/accept', requireAuth, asyncHandler(async (req, res) => {
  const token = req.params.token as string;
  const userId = req.user!.id;
  
  // We need the user's email to validate against the invite email
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user || !user.email) {
    throw Object.assign(new Error('User email not found'), { name: 'UnauthorizedError' });
  }

  try {
    const result = await inviteService.acceptInvite({
      token,
      userId,
      userEmail: user.email,
    });
    return successResponse(res, result);
  } catch (error: any) {
    if (['INVITE_NOT_FOUND', 'INVITE_EXPIRED', 'INVITE_ACCEPTED'].includes(error.code)) {
      throw new Error(error.message);
    }
    if (error.code === 'EMAIL_MISMATCH') {
      throw Object.assign(new Error(error.message), { name: 'ForbiddenError' });
    }
    throw error;
  }
}));

export default router;
