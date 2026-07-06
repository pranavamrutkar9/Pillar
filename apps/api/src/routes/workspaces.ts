import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { workspaceService } from '../services/workspaceService.js';
import { requireWorkspaceAdmin } from '../middleware/workspaceAuth.js';
import { inviteService } from '../services/inviteService.js';

const router = Router();

// Protect all workspace routes
router.use(requireAuth);

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
       res.status(400).json({ error: 'Workspace name is required' });
       return;
    }

    const userId = req.user!.id;

    const workspace = await workspaceService.create({ name: name.trim(), userId });

    res.status(201).json({ success: true, workspace });
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const workspaces = await workspaceService.getByUser(userId);
    
    res.status(200).json({ success: true, workspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:workspaceId/invites', requireWorkspaceAdmin, async (req, res) => {
  try {
    const { email, role } = req.body;
    const workspaceId = req.params.workspaceId;
    const userId = req.user!.id;

    if (!email || !role) {
       res.status(400).json({ error: 'Email and role are required' });
       return;
    }

    const invite = await inviteService.createInvite({
      workspaceId,
      email,
      role,
      invitedBy: userId,
    });

    res.status(201).json({ success: true, invite });
  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:workspaceId/invites/:inviteId', requireWorkspaceAdmin, async (req, res) => {
  try {
    const inviteId = req.params.inviteId;
    await inviteService.revokeInvite(inviteId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error revoking invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
