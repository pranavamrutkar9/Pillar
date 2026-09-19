import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectMember } from '../middleware/projectAuth.js';
import { moduleService } from '../services/module.service.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const modules = await moduleService.getModulesByProject(projectId);
  return successResponse(res, modules);
}));

router.post('/', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const module = await moduleService.createModule(projectId, actorId, req.body);
  return successResponse(res, module, 201);
}));

router.get('/:moduleId', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const { projectId, moduleId } = req.params;
  const module = await moduleService.getModuleById(moduleId, projectId);
  return successResponse(res, module);
}));

router.patch('/:moduleId', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const { projectId, moduleId } = req.params;
  const actorId = req.user!.id;
  const module = await moduleService.updateModule(moduleId, projectId, actorId, req.body);
  return successResponse(res, module);
}));

router.delete('/:moduleId', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const { projectId, moduleId } = req.params;
  const actorId = req.user!.id;
  await moduleService.deleteModule(moduleId, projectId, actorId);
  return successResponse(res, { success: true });
}));

router.get('/:moduleId/progress', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const { projectId, moduleId } = req.params;
  const progress = await moduleService.getModuleProgress(moduleId, projectId);
  return successResponse(res, progress);
}));

export default router;
