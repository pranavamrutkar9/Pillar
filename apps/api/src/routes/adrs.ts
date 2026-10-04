import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectMember } from '../middleware/projectAuth.js';
import { adrService } from '../services/adr.service.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';
import { z } from 'zod';

const router = Router({ mergeParams: true });

router.use(requireAuth, requireProjectMember);

router.get('/', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const adrs = await adrService.getAdrsByProject(projectId);
  return successResponse(res, adrs);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const adr = await adrService.getAdrById(req.params.id, projectId);
  return successResponse(res, adr);
}));

const createAdrSchema = z.object({
  title: z.string().min(1),
  context: z.string().min(1),
  decision: z.string().min(1),
  alternatives: z.string().optional(),
  consequences: z.string().optional(),
});

router.post('/', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const data = createAdrSchema.parse(req.body);
  const adr = await adrService.createAdr(projectId, actorId, data);
  return successResponse(res, adr, 201);
}));

const updateStatusSchema = z.object({
  status: z.enum(['PROPOSED', 'ACCEPTED', 'DEPRECATED']),
});

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const { status } = updateStatusSchema.parse(req.body);
  const adr = await adrService.updateStatus(req.params.id, projectId, actorId, status);
  return successResponse(res, adr);
}));

const supersedeSchema = z.object({
  replacementAdrId: z.string(),
});

router.post('/:id/supersede', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const { replacementAdrId } = supersedeSchema.parse(req.body);
  const adr = await adrService.supersedeAdr(projectId, actorId, req.params.id, replacementAdrId);
  return successResponse(res, adr);
}));

const linkSchema = z.object({
  type: z.enum(['issue', 'module']),
  targetId: z.string(),
});

router.post('/:id/link', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const { type, targetId } = linkSchema.parse(req.body);
  
  if (type === 'issue') {
    await adrService.linkIssue(req.params.id, targetId, projectId, actorId);
  } else if (type === 'module') {
    await adrService.linkModule(req.params.id, targetId, projectId, actorId);
  }
  
  return successResponse(res, { success: true });
}));

export default router;
