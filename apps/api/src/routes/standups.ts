import { Router } from "express";
import { standupService } from "../services/standup.service.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { prisma } from "../db/client.js";

const router = Router({ mergeParams: true });

// GET /api/workspaces/:workspaceId/standups
router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { date } = req.query; // format: YYYY-MM-DD
  
  if (!date) return res.status(400).json({ success: false, error: "Missing date query parameter" });

  const standups = await standupService.getPostedStandups(workspaceId, date as string);
  res.json({ success: true, data: standups });
}));

// GET /api/workspaces/:workspaceId/standups/today
router.get("/today", requireAuth, asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user!.id;
  
  // Use UTC today for simplicity or accept local date string from client
  const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
  
  const standup = await standupService.getTodayStandup(workspaceId, userId, dateStr);
  res.json({ success: true, data: standup });
}));

// PATCH /api/workspaces/:workspaceId/standups/:id
router.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { yesterday, today, attention } = req.body;
  
  const standup = await standupService.updateStandup(id, { yesterday, today, attention });
  res.json({ success: true, data: standup });
}));

// POST /api/workspaces/:workspaceId/standups/:id/post
router.post("/:id/post", requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const standup = await standupService.postStandup(id);
  res.json({ success: true, data: standup });
}));

// POST /api/workspaces/:workspaceId/standups/generate
router.post("/generate", requireAuth, asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user!.id;
  const dateStr = (req.body.date as string) || new Date().toISOString().split('T')[0];
  
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) return res.status(404).json({ success: false, error: "Workspace not found" });

  // Manually trigger the generation
  const result = await standupService.generateDraft(workspaceId, userId, dateStr, workspace.timezone);
  res.json({ success: true, data: result });
}));

export default router;
