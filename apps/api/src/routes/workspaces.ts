import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { workspaceService } from '../services/workspaceService.js';
import { requireWorkspaceAdmin, requireWorkspaceMember } from '../middleware/workspaceAuth.js';
import { inviteService } from '../services/inviteService.js';
import { searchService } from '../services/searchService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router();

// Protect all workspace routes
router.use(requireAuth);

router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Workspace name is required');
  }

  const userId = req.user!.id;
  const workspace = await workspaceService.create({ name: name.trim(), userId });

  return successResponse(res, workspace, 201);
}));

router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const workspaces = await workspaceService.getByUser(userId);
  return successResponse(res, workspaces);
}));

router.get('/:workspaceId', requireWorkspaceMember, asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const workspace = await workspaceService.getById(workspaceId);
  
  if (!workspace) {
    throw Object.assign(new Error('Workspace not found'), { name: 'NotFoundError' });
  }

  return successResponse(res, workspace);
}));

router.get('/:workspaceId/dashboard', requireWorkspaceMember, asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const userId = req.user!.id;
  const dashboard = await workspaceService.getDashboard(workspaceId, userId);
  return successResponse(res, dashboard);
}));

router.get('/:workspaceId/search', requireWorkspaceMember, asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const userId = req.user!.id;
  const query = req.query.q as string || '';
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  
  const results = await searchService.searchWorkspace(workspaceId, userId, query, limit);
  return successResponse(res, results);
}));

router.post('/:workspaceId/invites', requireWorkspaceAdmin, asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const workspaceId = req.params.workspaceId as string;
  const userId = req.user!.id;

  if (!email || !role) {
    throw new Error('Email and role are required');
  }

  const invite = await inviteService.createInvite({
    workspaceId,
    email,
    role,
    invitedBy: userId,
  });

  return successResponse(res, invite, 201);
}));

router.delete('/:workspaceId/invites/:inviteId', requireWorkspaceAdmin, asyncHandler(async (req, res) => {
  const inviteId = req.params.inviteId as string;
  await inviteService.revokeInvite(inviteId);
  return successResponse(res, null);
}));

export default router;
