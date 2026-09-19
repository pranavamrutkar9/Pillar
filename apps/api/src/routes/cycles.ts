import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectMember } from '../middleware/projectAuth.js';
import { cycleService } from '../services/cycle.service.js';
import { cycleAnalyticsService } from '../services/cycleAnalytics.service.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const cycles = await cycleService.getCyclesByProject(projectId);
  return successResponse(res, cycles);
}));

router.post('/', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const data = {
    ...req.body,
    startsAt: new Date(req.body.startsAt),
    endsAt: new Date(req.body.endsAt)
  };
  const cycle = await cycleService.createCycle(projectId, actorId, data);
  return successResponse(res, cycle, 201);
}));

router.get('/:cycleId', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const { projectId, cycleId } = req.params;
  const cycle = await cycleService.getCycleById(cycleId, projectId);
  return successResponse(res, cycle);
}));

router.patch('/:cycleId', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const { projectId, cycleId } = req.params;
  const actorId = req.user!.id;
  const data = { ...req.body };
  if (data.startsAt) data.startsAt = new Date(data.startsAt);
  if (data.endsAt) data.endsAt = new Date(data.endsAt);
  
  const cycle = await cycleService.updateCycle(cycleId, projectId, actorId, data);
  return successResponse(res, cycle);
}));

router.delete('/:cycleId', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const { projectId, cycleId } = req.params;
  const actorId = req.user!.id;
  await cycleService.deleteCycle(cycleId, projectId, actorId);
  return successResponse(res, { success: true });
}));

router.post('/:cycleId/start', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const { projectId, cycleId } = req.params;
  const actorId = req.user!.id;
  const cycle = await cycleService.startCycle(cycleId, projectId, actorId);
  return successResponse(res, cycle);
}));

router.post('/:cycleId/complete', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const { projectId, cycleId } = req.params;
  const actorId = req.user!.id;
  const cycle = await cycleService.completeCycle(cycleId, projectId, actorId);
  return successResponse(res, cycle);
}));

router.get('/:cycleId/analytics', requireAuth, requireProjectMember, asyncHandler(async (req, res) => {
  const { projectId, cycleId } = req.params;
  const summary = await cycleAnalyticsService.getCycleSummary(cycleId, projectId);
  const burndown = await cycleAnalyticsService.getCycleBurndown(cycleId, projectId);
  return successResponse(res, { summary, burndown });
}));

export default router;
