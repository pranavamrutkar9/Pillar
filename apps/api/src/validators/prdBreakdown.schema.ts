import { z } from "zod";

export const priorityEnum = z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]);

export const prdClarificationSchema = z.object({
  detectedProjectTitle: z.string().min(2).max(100),
  summary: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      context: z.string(),
      options: z.array(z.string()).min(2).max(4),
      recommendedOption: z.string().optional(),
    })
  ).min(1).max(4),
});

export type PrdClarificationsOutput = z.infer<typeof prdClarificationSchema>;

export const projectBreakdownOutputSchema = z.object({
  projectName: z.string().min(2).max(100),
  projectSlug: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/),
  description: z.string().max(500),
  isHackathonMode: z.boolean().default(false),
  deadline: z.string().datetime().optional().nullable(),

  modules: z.array(
    z.object({
      tempId: z.string().min(1),
      name: z.string().min(2).max(60),
      description: z.string().max(300).optional(),
    })
  ).min(1).max(10),

  labels: z.array(
    z.object({
      tempId: z.string().min(1),
      name: z.string().min(2).max(30),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    })
  ).min(1).max(15),

  issues: z.array(
    z.object({
      tempId: z.string().min(1),
      moduleTempId: z.string().min(1),
      title: z.string().min(3).max(150),
      description: z.string().max(3000),
      priority: priorityEnum.default("MEDIUM"),
      estimate: z.number().int().min(1).max(13).optional(),
      labelTempIds: z.array(z.string()).default([]),
      blockedByTempIds: z.array(z.string()).default([]),
    })
  ).min(1).max(50),
  repairedChanges: z.array(z.string()).default([]),
});

export type ProjectBreakdownOutput = z.infer<typeof projectBreakdownOutputSchema>;

/**
 * Validates semantic integrity and performs precise cycle-edge removal.
 * Instead of clearing all dependencies from cyclic nodes, it identifies the exact
 * back-edge forming the cycle, removes only that offending edge, and records the change.
 */
export function validateAndRepairBreakdown(data: unknown): ProjectBreakdownOutput {
  const parsed = projectBreakdownOutputSchema.parse(data);
  const moduleIds = new Set(parsed.modules.map((m) => m.tempId));
  const labelIds = new Set(parsed.labels.map((l) => l.tempId));
  const issueIds = new Set(parsed.issues.map((i) => i.tempId));
  const idToTitle = new Map(parsed.issues.map((i) => [i.tempId, i.title]));
  const repairedChanges: string[] = [];

  // 1. Semantic Reference Checks & Self-Dependency Pruning
  for (const issue of parsed.issues) {
    if (!moduleIds.has(issue.moduleTempId)) {
      if (parsed.modules.length > 0) {
        issue.moduleTempId = parsed.modules[0].tempId;
        repairedChanges.push(`Reassigned "${issue.title}" to module "${parsed.modules[0].name}"`);
      } else {
        throw new Error(`Issue "${issue.title}" references nonexistent moduleTempId "${issue.moduleTempId}"`);
      }
    }

    // Filter out invalid label IDs
    const validLabels = (issue.labelTempIds || []).filter((id) => labelIds.has(id));
    if (validLabels.length !== (issue.labelTempIds || []).length) {
      issue.labelTempIds = validLabels;
    }

    // Filter self-dependencies and nonexistent blockers
    const originalBlockers = issue.blockedByTempIds || [];
    const validBlockers = originalBlockers.filter((id) => {
      if (id === issue.tempId) {
        repairedChanges.push(`Removed self-dependency from "${issue.title}".`);
        return false;
      }
      if (!issueIds.has(id)) {
        repairedChanges.push(`Removed nonexistent blocker reference from "${issue.title}".`);
        return false;
      }
      return true;
    });
    // Remove duplicate blocker IDs
    issue.blockedByTempIds = Array.from(new Set(validBlockers));
  }

  // 2. Precise Cycle Detection and Edge Removal (DFS Back-Edge Detection)
  function findCycleEdge(): { sourceId: string; blockerId: string } | null {
    const adj = new Map<string, string[]>();
    for (const issue of parsed.issues) {
      adj.set(issue.tempId, [...(issue.blockedByTempIds || [])]);
    }

    const state = new Map<string, number>(); // 0: UNVISITED, 1: VISITING, 2: VISITED

    function dfs(u: string): { sourceId: string; blockerId: string } | null {
      state.set(u, 1);
      const blockers = adj.get(u) || [];
      for (const v of blockers) {
        const vState = state.get(v) || 0;
        if (vState === 1) {
          // Back-edge found: u is blocked by v while v is an active ancestor in the traversal
          return { sourceId: u, blockerId: v };
        }
        if (vState === 0) {
          const found = dfs(v);
          if (found) return found;
        }
      }
      state.set(u, 2);
      return null;
    }

    for (const issue of parsed.issues) {
      if ((state.get(issue.tempId) || 0) === 0) {
        const found = dfs(issue.tempId);
        if (found) return found;
      }
    }

    return null;
  }

  // Iteratively prune only the offending back-edges until the graph is an acyclic DAG
  let cycleEdge = findCycleEdge();
  let maxPasses = 50;
  while (cycleEdge && maxPasses-- > 0) {
    const { sourceId, blockerId } = cycleEdge;
    const sourceIssue = parsed.issues.find((i) => i.tempId === sourceId);
    if (sourceIssue) {
      sourceIssue.blockedByTempIds = sourceIssue.blockedByTempIds.filter((id) => id !== blockerId);
      const uTitle = idToTitle.get(sourceId) || sourceId;
      const vTitle = idToTitle.get(blockerId) || blockerId;
      repairedChanges.push(`Removed circular dependency: "${uTitle}" cannot be blocked by "${vTitle}".`);
    }
    cycleEdge = findCycleEdge();
  }

  parsed.repairedChanges = repairedChanges;
  return parsed;
}
