import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectAdmin, requireProjectViewer } from '../middleware/projectAuth.js';
import { statusService } from '../services/status.service.js';
import { createStatusSchema, updateStatusSchema, reorderStatusesSchema } from '../validators/status.schema.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', requireProjectViewer, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const statuses = await statusService.getStatuses(projectId);
  return successResponse(res, statuses);
}));

router.post('/', requireProjectAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const parseResult = createStatusSchema.parse(req.body);
  const status = await statusService.createStatus(projectId, parseResult);
  return successResponse(res, status, 201);
}));

router.put('/reorder', requireProjectAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const parseResult = reorderStatusesSchema.parse(req.body);
  const result = await statusService.reorderStatuses(projectId, parseResult);
  return successResponse(res, result);
}));

router.patch('/:statusId', requireProjectAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const statusId = req.params.statusId as string;
  const parseResult = updateStatusSchema.parse(req.body);
  const status = await statusService.updateStatus(projectId, statusId, parseResult);
  return successResponse(res, status);
}));

router.delete('/:statusId', requireProjectAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const statusId = req.params.statusId as string;
  try {
    await statusService.deleteStatus(projectId, statusId);
    return successResponse(res, { success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}));

export default router;
