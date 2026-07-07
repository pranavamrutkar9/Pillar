import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectAdmin, requireProjectViewer } from '../middleware/projectAuth.js';
import { labelService } from '../services/label.service.js';
import { createLabelSchema, updateLabelSchema } from '../validators/label.schema.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', requireProjectViewer, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const labels = await labelService.getLabels(projectId);
  return successResponse(res, labels);
}));

router.post('/', requireProjectAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const parseResult = createLabelSchema.parse(req.body);
  const label = await labelService.createLabel(projectId, parseResult);
  return successResponse(res, label, 201);
}));

router.patch('/:labelId', requireProjectAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const labelId = req.params.labelId as string;
  const parseResult = updateLabelSchema.parse(req.body);
  const label = await labelService.updateLabel(projectId, labelId, parseResult);
  return successResponse(res, label);
}));

router.delete('/:labelId', requireProjectAdmin, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const labelId = req.params.labelId as string;
  await labelService.deleteLabel(projectId, labelId);
  return successResponse(res, { success: true });
}));

export default router;
