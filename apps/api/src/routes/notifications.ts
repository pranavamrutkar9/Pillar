import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { notificationService } from '../services/notification.service.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { successResponse } from '../lib/apiResponse.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const notifications = await notificationService.getUserNotifications(userId, 20);
  return successResponse(res, notifications);
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  await notificationService.markAllAsRead(userId);
  return successResponse(res, { success: true });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const notificationId = req.params.id as string;
  await notificationService.markAsRead(notificationId, userId);
  return successResponse(res, { success: true });
}));

export default router;
