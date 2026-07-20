import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceAdmin, requireWorkspaceMember } from '../middleware/workspaceAuth.js';
import { projectService } from '../services/project.service.js';
import { createProjectSchema } from '../validators/project.schema.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router({ mergeParams: true });

router.post('/', requireAuth, requireWorkspaceAdmin, asyncHandler(async (req, res) => {
  const parseResult = createProjectSchema.parse(req.body);
  const workspaceId = req.params.workspaceId as string;
  const userId = req.user!.id;

  const project = await projectService.createProject(workspaceId, userId, parseResult);
  return successResponse(res, project, 201);
}));

router.get('/', requireAuth, requireWorkspaceMember, asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const projects = await projectService.getProjectsByWorkspace(workspaceId);
  return successResponse(res, projects);
}));

import { viewerAuth } from '../middleware/viewerAuth.js';
import { requireProjectViewer } from '../middleware/projectAuth.js';

router.get('/:projectId', viewerAuth, requireProjectViewer, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const project = await projectService.getProjectById(projectId);
  
  if (!project) {
    throw Object.assign(new Error('Project not found'), { name: 'NotFoundError' });
  }

  return successResponse(res, project);
}));

router.post('/:projectId/shares', requireAuth, requireWorkspaceAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const userId = req.user!.id;
  const share = await projectService.createProjectShare(projectId, userId);
  return successResponse(res, share, 201);
}));

router.get('/:projectId/shares', requireAuth, requireWorkspaceAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const shares = await projectService.getProjectShares(projectId);
  return successResponse(res, shares);
}));

router.delete('/:projectId/shares/:shareId', requireAuth, requireWorkspaceAdmin, asyncHandler(async (req, res) => {
  const shareId = req.params.shareId as string;
  await projectService.revokeProjectShare(shareId);
  return successResponse(res, { success: true });
}));

export default router;
