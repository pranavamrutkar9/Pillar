import { prisma } from "../db/client.js";
import { redis } from "../lib/redis.js";
import { emit as publishToQueue } from "../events/eventBus.js";
import { ProjectBreakdownOutput } from "../validators/prdBreakdown.schema.js";

const redisGetSafe = async (key: string, timeoutMs = 2000): Promise<string | null> => {
  try {
    return await Promise.race([
      redis.get(key),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  } catch {
    return null;
  }
};

const redisSetSafe = async (key: string, value: string, ttlSeconds = 86400, timeoutMs = 2000) => {
  try {
    await Promise.race([
      redis.set(key, value, "EX", ttlSeconds),
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  } catch (err) {
    console.warn("[Idempotency] Failed to save key in Redis:", err);
  }
};

export const prdProjectBreakdownService = {
  async commitBreakdown(
    workspaceId: string,
    userId: string,
    data: ProjectBreakdownOutput,
    idempotencyKey?: string
  ) {
    // 1. Verify workspace membership and permissions
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new Error("Unauthorized: user is not a member of this workspace");
    }

    // 2. Server-side Idempotency Check: Prevent duplicate submissions
    const keyToCheck = idempotencyKey || `name:${workspaceId}:${data.projectName.trim().toLowerCase().replace(/\s+/g, "-")}`;

    try {
      const cachedProjectId = await redisGetSafe(
        `idempotency:breakdown:${workspaceId}:${keyToCheck}`
      );
      if (cachedProjectId) {
        const existingProject = await prisma.project.findUnique({
          where: { id: cachedProjectId },
        });
        if (existingProject) {
          console.log(`[Idempotency] Key [${keyToCheck}]: Returning existing project ${existingProject.id} (${existingProject.name}) from Redis cache`);
          return existingProject;
        }
      }
    } catch (redisErr) {
      console.warn("[Idempotency] Redis cache check failed, falling back to database check:", redisErr);
    }

    // Check PostgreSQL event table for prior commit with this idempotencyKey
    const existingEvent = await prisma.event.findFirst({
      where: {
        workspaceId,
        eventType: { in: ["project.created_from_prd", "project.breakdown_imported", "project.created"] },
        payload: {
          path: ["idempotencyKey"],
          equals: keyToCheck,
        },
      },
    });

    if (existingEvent?.projectId) {
      const existingProject = await prisma.project.findUnique({
        where: { id: existingEvent.projectId },
      });
      if (existingProject) {
        console.log(`[Idempotency] Key [${keyToCheck}]: Returning existing project ${existingProject.id} (${existingProject.name}) from PostgreSQL event outbox`);
        return existingProject;
      }
    }

    // Check if project with exact same name already exists in this workspace
    const existingProjectByName = await prisma.project.findFirst({
      where: {
        workspaceId,
        name: { equals: data.projectName.trim(), mode: "insensitive" },
      },
    });

    if (existingProjectByName) {
      console.log(`[Idempotency] Key [${keyToCheck}]: Existing project with name "${data.projectName}" found (${existingProjectByName.id}). Preventing duplicate creation.`);
      return existingProjectByName;
    }

    // 3. Execute single atomic database transaction
    const project = await prisma.$transaction(async (tx) => {
      // Slug uniqueness guarantee
      let finalSlug = data.projectSlug.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!finalSlug) finalSlug = "PRJ";

      let counter = 1;
      let candidateSlug = finalSlug;
      while (
        await tx.project.findUnique({
          where: { workspaceId_slug: { workspaceId, slug: candidateSlug } },
        })
      ) {
        candidateSlug = `${finalSlug.substring(0, 3)}${counter}`;
        counter++;
      }

      // Create Project with default sequence 1
      const newProject = await tx.project.create({
        data: {
          workspaceId,
          name: data.projectName,
          slug: candidateSlug,
          description: data.description,
          isHackathonMode: data.isHackathonMode || false,
          deadline: data.deadline ? new Date(data.deadline) : null,
          createdBy: userId,
          nextIssueSequence: 1,
        },
      });

      // Create Default Statuses
      const todoStatus = await tx.issueStatus.create({
        data: {
          projectId: newProject.id,
          name: "Todo",
          color: "#e2e8f0",
          position: 1,
          isDefault: true,
          isDone: false,
        },
      });

      await tx.issueStatus.createMany({
        data: [
          {
            projectId: newProject.id,
            name: "In Progress",
            color: "#60a5fa",
            position: 2,
            isDefault: false,
            isDone: false,
          },
          {
            projectId: newProject.id,
            name: "Done",
            color: "#4ade80",
            position: 3,
            isDefault: false,
            isDone: true,
          },
        ],
      });

      // Add Creator as ADMIN Project Member
      await tx.projectMember.create({
        data: {
          projectId: newProject.id,
          userId,
          role: "ADMIN",
        },
      });

      // Create Modules & Map Temporary IDs
      const moduleIdMap = new Map<string, string>();
      for (const mod of data.modules) {
        const createdMod = await tx.module.create({
          data: {
            projectId: newProject.id,
            name: mod.name,
            description: mod.description,
          },
        });
        moduleIdMap.set(mod.tempId, createdMod.id);
      }

      // Create Labels & Map Temporary IDs
      const labelIdMap = new Map<string, string>();
      for (const lbl of data.labels) {
        const createdLbl = await tx.issueLabel.create({
          data: {
            projectId: newProject.id,
            name: lbl.name,
            color: lbl.color,
          },
        });
        labelIdMap.set(lbl.tempId, createdLbl.id);
      }

      // Batch allocate sequence IDs in a single atomic update query
      const totalIssues = data.issues.length;
      const updatedProject = await tx.project.update({
        where: { id: newProject.id },
        data: { nextIssueSequence: { increment: totalIssues } },
        select: { nextIssueSequence: true },
      });
      const startSeq = updatedProject.nextIssueSequence - totalIssues;

      // Create Issues with sequential sequenceIds (startSeq + idx)
      const issueIdMap = new Map<string, string>();
      const labelMapsToInsert: Array<{ issueId: string; labelId: string }> = [];
      const activitiesToInsert: Array<{
        issueId: string;
        actorId: string;
        action: string;
        newValue: any;
      }> = [];

      for (let idx = 0; idx < data.issues.length; idx++) {
        const iss = data.issues[idx];
        const realModuleId = moduleIdMap.get(iss.moduleTempId) || null;

        const createdIssue = await tx.issue.create({
          data: {
            projectId: newProject.id,
            title: iss.title,
            description: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: iss.description }],
                },
              ],
            },
            statusId: todoStatus.id,
            priority: iss.priority,
            estimate: iss.estimate,
            sequenceId: startSeq + idx,
            position: (idx + 1) * 1000,
            creatorId: userId,
            moduleId: realModuleId,
          },
        });
        issueIdMap.set(iss.tempId, createdIssue.id);

        // Collect Labels for batched insertion
        if (iss.labelTempIds && iss.labelTempIds.length > 0) {
          const validLabelIds = iss.labelTempIds
            .map((t) => labelIdMap.get(t))
            .filter(Boolean) as string[];

          for (const labelId of validLabelIds) {
            labelMapsToInsert.push({
              issueId: createdIssue.id,
              labelId,
            });
          }
        }

        // Collect Activity Log for batched insertion
        activitiesToInsert.push({
          issueId: createdIssue.id,
          actorId: userId,
          action: "created",
          newValue: { source: "ai_breakdown" },
        });
      }

      // Batch insert all label mappings
      if (labelMapsToInsert.length > 0) {
        await tx.issueLabelMap.createMany({
          data: labelMapsToInsert,
        });
      }

      // Batch insert all issue activities
      if (activitiesToInsert.length > 0) {
        await tx.issueActivity.createMany({
          data: activitiesToInsert,
        });
      }

      // Create Issue Dependencies (IssueRelation)
      const relationsToInsert: Array<{
        issueId: string;
        relatedIssueId: string;
        relationType: string;
      }> = [];

      for (const iss of data.issues) {
        const currentIssueId = issueIdMap.get(iss.tempId);
        if (!currentIssueId || !iss.blockedByTempIds) continue;

        for (const blockerTempId of iss.blockedByTempIds) {
          const blockerIssueId = issueIdMap.get(blockerTempId);
          if (blockerIssueId && blockerIssueId !== currentIssueId) {
            relationsToInsert.push({
              issueId: currentIssueId,
              relatedIssueId: blockerIssueId,
              relationType: "BLOCKED_BY",
            });
          }
        }
      }

      if (relationsToInsert.length > 0) {
        await tx.issueRelation.createMany({
          data: relationsToInsert,
        });
      }

      // 4. Atomically persist Event rows in PostgreSQL within the same transaction (Transactional Outbox)
      await tx.event.create({
        data: {
          eventType: "project.created",
          workspaceId,
          projectId: newProject.id,
          actorId: userId,
          payload: {
            projectId: newProject.id,
            idempotencyKey: idempotencyKey || null,
          },
        },
      });

      await tx.event.create({
        data: {
          eventType: "project.created_from_prd",
          workspaceId,
          projectId: newProject.id,
          actorId: userId,
          payload: {
            projectId: newProject.id,
            idempotencyKey: idempotencyKey || null,
            moduleCount: data.modules.length,
            issueCount: data.issues.length,
            dependencyCount: relationsToInsert.length,
          },
        },
      });

      return newProject;
    }, {
      maxWait: 20000, // 20s wait to acquire transaction slot
      timeout: 60000, // 60s timeout for remote cloud DB transactions with multiple entities
    });

    // 5. Cache Idempotency Key in Redis (24-hour expiration)
    await redisSetSafe(
      `idempotency:breakdown:${workspaceId}:${keyToCheck}`,
      project.id,
      86400
    );
    if (idempotencyKey) {
      await redisSetSafe(
        `idempotency:breakdown:${workspaceId}:${idempotencyKey}`,
        project.id,
        86400
      );
    }

    // 6. Post-Transaction Queue Dispatch (BullMQ) with resilient failure handling
    try {
      await publishToQueue("project.created", {
        projectId: project.id,
        workspaceId,
        actorId: userId,
      });

      await publishToQueue("project.breakdown_imported", {
        projectId: project.id,
        workspaceId,
        actorId: userId,
        moduleCount: data.modules.length,
        issueCount: data.issues.length,
      });
    } catch (queueErr) {
      // If BullMQ is temporarily unavailable, the project is still safely committed
      // and event records are stored in PostgreSQL for outbox recovery.
      console.error(
        "[EventBus] BullMQ publish failed after transaction commit. Event preserved in PostgreSQL:",
        queueErr
      );
    }

    return project;
  },
};
