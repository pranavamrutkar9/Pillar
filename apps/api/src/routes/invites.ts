import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { inviteService } from '../services/inviteService.js';
import { prisma } from '../db/client.js';

const router = Router();

// GET /api/invites/pending - Protected endpoint to get pending invites for the logged-in user
router.get('/pending', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) {
       res.status(401).json({ error: 'User email not found' });
       return;
    }

    const invites = await inviteService.getPendingInvitesForEmail(user.email);
    res.status(200).json({ success: true, invites });
  } catch (error) {
    console.error('Error fetching pending invites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/invites/:token - Public endpoint to view invite details
router.get('/:token', async (req, res) => {
  try {
    const token = req.params.token;
    
    if (!token) {
       res.status(400).json({ error: 'Token is required' });
       return;
    }

    const invite = await inviteService.getInviteByToken(token);
    
    if (!invite) {
       res.status(404).json({ error: 'Invite not found or invalid' });
       return;
    }

    res.status(200).json({ success: true, invite });
  } catch (error) {
    console.error('Error fetching invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/invites/:token/accept - Protected endpoint to accept invite
router.post('/:token/accept', requireAuth, async (req, res) => {
  try {
    const token = req.params.token;
    const userId = req.user!.id;
    
    // We need the user's email to validate against the invite email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.email) {
       res.status(401).json({ error: 'User email not found' });
       return;
    }

    const result = await inviteService.acceptInvite({
      token,
      userId,
      userEmail: user.email,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error accepting invite:', error);
    
    if (['INVITE_NOT_FOUND', 'INVITE_EXPIRED', 'INVITE_ACCEPTED'].includes(error.code)) {
       res.status(400).json({ error: error.message });
       return;
    }
    
    if (error.code === 'EMAIL_MISMATCH') {
       res.status(403).json({ error: error.message });
       return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
