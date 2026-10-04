import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectMember } from '../middleware/projectAuth.js';
import { rfcService } from '../services/rfc.service.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';
import { z } from 'zod';

const router = Router({ mergeParams: true });

router.use(requireAuth, requireProjectMember);

router.get('/', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const rfcs = await rfcService.getRfcsByProject(projectId);
  return successResponse(res, rfcs);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const rfc = await rfcService.getRfcById(req.params.id, projectId);
  return successResponse(res, rfc);
}));

const createRfcSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
});

router.post('/', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const data = createRfcSchema.parse(req.body);
  const rfc = await rfcService.createRfc(projectId, actorId, data);
  return successResponse(res, rfc, 201);
}));

const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'IN_REVIEW', 'ACCEPTED', 'IMPLEMENTED']),
});

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const { status } = updateStatusSchema.parse(req.body);
  const rfc = await rfcService.updateStatus(req.params.id, projectId, actorId, status);
  return successResponse(res, rfc);
}));

const addSectionSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  position: z.number(),
});

router.post('/:id/sections', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const data = addSectionSchema.parse(req.body);
  const section = await rfcService.addSection(req.params.id, projectId, data);
  return successResponse(res, section, 201);
}));

const addCommentSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().optional(),
});

router.post('/:id/sections/:sectionId/comments', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const { content, parentId } = addCommentSchema.parse(req.body);
  const comment = await rfcService.addSectionComment(req.params.sectionId, projectId, actorId, content, parentId);
  return successResponse(res, comment, 201);
}));

const voteSchema = z.object({
  vote: z.enum(['APPROVE', 'REQUEST_CHANGES', 'ABSTAIN']),
});

router.post('/:id/vote', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const { vote } = voteSchema.parse(req.body);
  const voteRecord = await rfcService.castVote(req.params.id, projectId, actorId, vote);
  return successResponse(res, voteRecord);
}));

const addTaskSchema = z.object({
  description: z.string().min(1),
});

router.post('/:id/tasks', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const { description } = addTaskSchema.parse(req.body);
  const task = await rfcService.addImplementationTask(req.params.id, projectId, description);
  return successResponse(res, task, 201);
}));

router.post('/:id/spawn-issues', asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const actorId = req.user!.id;
  const issues = await rfcService.spawnIssuesFromRfc(req.params.id, projectId, actorId);
  return successResponse(res, issues, 201);
}));

export default router;
