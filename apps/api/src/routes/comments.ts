import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectMember, requireProjectViewer } from '../middleware/projectAuth.js';
import { commentService } from '../services/comment.service.js';
import { createCommentSchema } from '../validators/comment.schema.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', requireProjectMember, asyncHandler(async (req, res) => {
  const parseResult = createCommentSchema.parse(req.body);
  const issueId = req.params.issueId as string;

  if (!issueId) {
    throw new Error("issueId is required");
  }

  const userId = req.user!.id;
  try {
    const comment = await commentService.createComment(issueId, userId, parseResult);
    return successResponse(res, comment, 201);
  } catch (error: any) {
    if (error.message === 'Issue not found') {
      throw Object.assign(new Error('Issue not found'), { name: 'NotFoundError' });
    }
    throw error;
  }
}));

router.get('/', requireProjectViewer, asyncHandler(async (req, res) => {
  const issueId = req.params.issueId as string;
  if (!issueId) {
    throw new Error("issueId is required");
  }

  const comments = await commentService.getCommentsByIssue(issueId);
  return successResponse(res, comments);
}));

export default router;
