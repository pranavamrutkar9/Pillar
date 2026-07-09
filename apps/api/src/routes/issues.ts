import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectMember, requireProjectViewer } from '../middleware/projectAuth.js';
import { issueService } from '../services/issue.service.js';
import { createIssueSchema, updateIssueSchema, moveIssueSchema } from '../validators/issue.schema.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', requireProjectMember, asyncHandler(async (req, res) => {
  const parseResult = createIssueSchema.parse(req.body);
  const projectId = req.params.projectId as string;
  const userId = req.user!.id;

  const issue = await issueService.createIssue(projectId, userId, parseResult);
  return successResponse(res, issue, 201);
}));

router.get('/', requireProjectViewer, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const issues = await issueService.getIssuesByProject(projectId);
  return successResponse(res, issues);
}));

router.get('/seq/:sequenceId', requireProjectViewer, asyncHandler(async (req, res) => {
  const projectId = req.params.projectId as string;
  const sequenceId = parseInt(req.params.sequenceId as string, 10);
  
  if (isNaN(sequenceId)) {
    throw new Error('Invalid sequenceId');
  }

  const issue = await issueService.getIssueBySequenceId(projectId, sequenceId);
  
  if (!issue) {
    throw Object.assign(new Error('Issue not found'), { name: 'NotFoundError' });
  }

  return successResponse(res, issue);
}));

router.get('/:issueId', requireProjectViewer, asyncHandler(async (req, res) => {
  const issueId = req.params.issueId as string;
  const issue = await issueService.getIssueById(issueId);
  
  if (!issue) {
    throw Object.assign(new Error('Issue not found'), { name: 'NotFoundError' });
  }

  return successResponse(res, issue);
}));

router.patch('/:issueId', requireProjectMember, asyncHandler(async (req, res) => {
  const parseResult = updateIssueSchema.parse(req.body);
  const issueId = req.params.issueId as string;
  const userId = req.user!.id;

  try {
    const issue = await issueService.updateIssue(issueId, userId, parseResult);
    return successResponse(res, issue);
  } catch (error: any) {
    if (error.message === 'Issue not found') {
      throw Object.assign(new Error('Issue not found'), { name: 'NotFoundError' });
    }
    throw error;
  }
}));

router.post('/:issueId/move', requireProjectMember, asyncHandler(async (req, res) => {
  const parseResult = moveIssueSchema.parse(req.body);
  const issueId = req.params.issueId as string;
  const userId = req.user!.id;

  try {
    const issue = await issueService.moveIssue(issueId, userId, parseResult.statusId, parseResult.position);
    return successResponse(res, issue);
  } catch (error: any) {
    if (error.message === 'Issue not found') {
      throw Object.assign(new Error('Issue not found'), { name: 'NotFoundError' });
    }
    throw error;
  }
}));

export default router;
