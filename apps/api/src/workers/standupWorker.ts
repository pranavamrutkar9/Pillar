import { Worker, Queue } from "bullmq";
import { prisma } from "../db/client.js";
import { standupService } from "../services/standup.service.js";
import { toZonedTime, format } from "date-fns-tz";
import IORedis from "ioredis";

// Reuse the existing redis connection from BullMQ setup if possible, or create a new one.
const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const standupQueue = new Queue("standup-generation", { connection });

// Schedule the cron job to run every hour
standupQueue.add("hourly-standup-trigger", {}, {
  repeat: { pattern: "0 * * * *" },
  jobId: "hourly-standup-trigger-job", // Prevent duplicates
});

// Worker to process the generation
const worker = new Worker("standup-generation", async (job) => {
  if (job.name === "hourly-standup-trigger") {
    // 1. Find workspaces where current local time is 08:00 - 08:59
    const nowUtc = new Date();
    const workspaces = await prisma.workspace.findMany({
      select: { id: true, timezone: true }
    });

    for (const ws of workspaces) {
      const timezone = ws.timezone || "UTC";
      const localTime = toZonedTime(nowUtc, timezone);
      const hour = parseInt(format(localTime, "HH", { timeZone: timezone }), 10);
      
      // If it's 8 AM local time
      if (hour === 8) {
        // Enqueue generation for all members
        const members = await prisma.workspaceMember.findMany({
          where: { workspaceId: ws.id },
          select: { userId: true }
        });

        const dateStr = format(localTime, "yyyy-MM-dd", { timeZone: timezone });
        
        for (const member of members) {
          // Check for existing standup
          const existing = await prisma.standup.findUnique({
            where: {
              workspaceId_userId_date: {
                workspaceId: ws.id,
                userId: member.userId,
                date: new Date(dateStr)
              }
            }
          });

          if (!existing) {
            // Enqueue specific user generation
            await standupQueue.add("generate-user-standup", {
              workspaceId: ws.id,
              userId: member.userId,
              dateStr,
              timezone: timezone,
            }, {
              attempts: 3,
              backoff: { type: "exponential", delay: 60000 }, // 1m, 2m, 4m
              jobId: `gen-${ws.id}-${member.userId}-${dateStr}`, // Idempotency
            });
          }
        }
      }
    }
  } else if (job.name === "generate-user-standup") {
    const { workspaceId, userId, dateStr, timezone } = job.data;
    await standupService.generateDraft(workspaceId, userId, dateStr, timezone);
  }
}, { connection });

worker.on("failed", (job, err) => {
  console.error(`Standup Worker Job ${job?.id} failed:`, err);
});

console.log("Standup Worker initialized.");
