import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireWorkspaceMember } from "../middleware/workspaceAuth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { successResponse, errorResponse } from "../lib/apiResponse.js";
import { aiService } from "../services/ai.service.js";
import { prdParserService } from "../services/prdParser.service.js";
import { prdProjectBreakdownService } from "../services/prdProjectBreakdown.service.js";
import { validateAndRepairBreakdown } from "../validators/prdBreakdown.schema.js";

const router = Router({ mergeParams: true });

// 1. Analyze PRD & return clarifying questions
router.post(
  "/analyze",
  requireAuth,
  requireWorkspaceMember,
  asyncHandler(async (req, res) => {
    const { prdText } = req.body;

    if (!prdText || typeof prdText !== "string" || prdText.trim().length === 0) {
      return errorResponse(res, "prdText is required. Please paste your PRD text directly.", 400);
    }

    const textToAnalyze = prdParserService.normalizeText(prdText);
    const analysis = await aiService.analyzePrdClarifications(textToAnalyze);
    return successResponse(res, {
      ...analysis,
      normalizedPrdText: textToAnalyze,
    });
  })
);

// 2. Generate structured breakdown JSON
router.post(
  "/generate",
  requireAuth,
  requireWorkspaceMember,
  asyncHandler(async (req, res) => {
    const { prdText, answers } = req.body;
    if (!prdText || typeof prdText !== "string" || prdText.trim().length === 0) {
      return errorResponse(res, "prdText is required", 400);
    }

    const normalized = prdParserService.normalizeText(prdText);
    const breakdown = await aiService.generateProjectBreakdown(normalized, answers || {});
    return successResponse(res, breakdown);
  })
);

// 3. Commit validated breakdown in single atomic transaction
router.post(
  "/commit",
  requireAuth,
  requireWorkspaceMember,
  asyncHandler(async (req, res) => {
    const workspaceId = req.params.workspaceId as string;
    const userId = req.user!.id;
    const { breakdown, idempotencyKey: bodyIdempotencyKey } = req.body;
    const idempotencyKey = (req.headers["x-idempotency-key"] as string) || bodyIdempotencyKey || undefined;

    if (!breakdown) {
      return errorResponse(res, "Breakdown payload is required", 400);
    }

    // Validate and repair DAG constraints on final client edits
    const validated = validateAndRepairBreakdown(breakdown);
    const project = await prdProjectBreakdownService.commitBreakdown(
      workspaceId,
      userId,
      validated,
      idempotencyKey
    );

    return successResponse(res, { projectId: project.id, slug: project.slug }, 201);
  })
);

export default router;
