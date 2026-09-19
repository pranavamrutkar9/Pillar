import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectViewer, requireProjectAdmin } from '../middleware/projectAuth.js';
import { projectService } from '../services/project.service.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router({ mergeParams: true });

import { viewerAuth } from '../middleware/viewerAuth.js';

router.get('/:projectId', viewerAuth, requireProjectViewer, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const project = await projectService.getProjectById(projectId);
  
  if (!project) {
    throw Object.assign(new Error('Project not found'), { name: 'NotFoundError' });
  }

  return successResponse(res, project);
}));

router.get('/:projectId/pull-requests', viewerAuth, requireProjectViewer, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const prs = await projectService.getPullRequests(projectId);
  return successResponse(res, prs);
}));

router.put('/:projectId/github', requireAuth, requireProjectAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const data = req.body;
  const project = await projectService.updateGithubSettings(projectId, data);
  return successResponse(res, project);
}));

router.post('/:projectId/github/sync', requireAuth, requireProjectAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  await projectService.triggerGithubSync(projectId);
  return successResponse(res, { success: true });
}));

export default router;
