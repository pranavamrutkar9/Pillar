import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { workspaceService } from '../services/workspaceService.js';

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

export default router;
