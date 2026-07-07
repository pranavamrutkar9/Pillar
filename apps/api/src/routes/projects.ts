import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceAdmin, requireWorkspaceMember } from '../middleware/workspaceAuth.js';
import { projectService } from '../services/project.service.js';
import { createProjectSchema } from '../validators/project.schema.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', requireWorkspaceAdmin, asyncHandler(async (req, res) => {
  const parseResult = createProjectSchema.parse(req.body);
  const workspaceId = req.params.workspaceId as string;
  const userId = req.user!.id;

  const project = await projectService.createProject(workspaceId, userId, parseResult);
  return successResponse(res, project, 201);
}));

router.get('/', requireWorkspaceMember, asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const projects = await projectService.getProjectsByWorkspace(workspaceId);
  return successResponse(res, projects);
}));

router.get('/:projectId', requireWorkspaceMember, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const project = await projectService.getProjectById(projectId);
  
  if (!project) {
    throw Object.assign(new Error('Project not found'), { name: 'NotFoundError' });
  }

  return successResponse(res, project);
}));

export default router;
