import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectViewer } from '../middleware/projectAuth.js';
import { projectService } from '../services/project.service.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/:projectId', requireProjectViewer, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const project = await projectService.getProjectById(projectId);
  
  if (!project) {
    throw Object.assign(new Error('Project not found'), { name: 'NotFoundError' });
  }

  return successResponse(res, project);
}));

export default router;
