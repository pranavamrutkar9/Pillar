import { prisma } from "../db/client.js";
import { aiService } from "./ai.service.js";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { StandupStatus, GenerationStatus } from "@prisma/client";

export const standupService = {
  async getTodayStandup(workspaceId: string, userId: string, localDateStr: string) {
    const date = new Date(localDateStr);
    return prisma.standup.findUnique({
      where: {
        workspaceId_userId_date: {
          workspaceId,
          userId,
          date,
        },
      },
    });
  },

  async updateStandup(id: string, data: { yesterday?: string[]; today?: string[]; attention?: string[] }) {
    return prisma.standup.update({
      where: { id },
      data: {
        ...(data.yesterday && { yesterday: data.yesterday }),
        ...(data.today && { today: data.today }),
        ...(data.attention && { attention: data.attention }),
      },
    });
  },

  async postStandup(id: string) {
    return prisma.standup.update({
      where: { id },
      data: {
        status: "POSTED",
        postedAt: new Date(),
      },
    });
  },

  async getPostedStandups(workspaceId: string, localDateStr: string) {
    const date = new Date(localDateStr);
    return prisma.standup.findMany({
      where: {
        workspaceId,
        date,
        status: "POSTED",
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
      orderBy: { postedAt: "desc" },
    });
  },

  async generateDraft(workspaceId: string, userId: string, localDateStr: string, timezone: string) {
    const date = new Date(localDateStr);

    // 1. Mark as generating
    const standup = await prisma.standup.upsert({
      where: { workspaceId_userId_date: { workspaceId, userId, date } },
      update: { generationStatus: "GENERATING" },
      create: {
        workspaceId,
        userId,
        date,
        yesterday: [],
        today: [],
        attention: [],
        status: "DRAFT",
        generationStatus: "GENERATING",
      },
    });

    try {
      // Calculate local yesterday and today in UTC
      const localNow = toZonedTime(new Date(), timezone);
      const localYesterday = subDays(localNow, 1);
      
      const yesterdayStartUtc = fromZonedTime(startOfDay(localYesterday), timezone);
      const todayStartUtc = fromZonedTime(startOfDay(localNow), timezone);

      // Aggregate Facts
      const [events, issues, staleIssues, pendingReviews, user] = await Promise.all([
        // Yesterday's events
        prisma.event.findMany({
          where: {
            actorId: userId,
            OR: [
              { workspaceId },
              { project: { workspaceId } }
            ],
            createdAt: { gte: yesterdayStartUtc, lt: todayStartUtc },
          },
          select: { eventType: true, payload: true, createdAt: true },
        }),
        // Today's candidate issues
        prisma.issue.findMany({
          where: {
            assigneeId: userId,
            project: { workspaceId },
            status: { isDone: false }, // Simplification for "In Progress" or "To Do"
          },
          select: { title: true, priority: true, estimate: true, updatedAt: true },
        }),
        // Stale issues (not updated in 48h)
        prisma.issue.findMany({
          where: {
            assigneeId: userId,
            project: { workspaceId },
            status: { isDone: false },
            updatedAt: { lt: subDays(new Date(), 2) },
          },
          select: { title: true, updatedAt: true },
        }),
        // Pull Requests assigned for review (Simplified simulation for DB schema)
        prisma.pullRequest.findMany({
          where: {
            repository: { installation: { ownerId: userId } }, // simplified
            state: "OPEN",
            reviewDecision: "REVIEW_REQUIRED",
          },
          select: { title: true, url: true, createdAt: true },
        }),
        // User Info
        prisma.user.findUnique({ where: { id: userId } }),
      ]);

      const payload = {
        user: { name: user?.username || "Team Member" },
        yesterday: { events },
        today: { assignedIssues: issues },
        attention: { staleIssues, pendingReviews },
      };

      // Call AI
      const aiResponse = await aiService.generateStandup(payload);

      // Save Draft
      await prisma.standup.update({
        where: { id: standup.id },
        data: {
          yesterday: aiResponse.yesterday,
          today: aiResponse.today,
          attention: aiResponse.attention,
          generationStatus: "GENERATED",
        },
      });

      return aiResponse;
    } catch (error) {
      console.error("Standup Generation Error:", error);
      await prisma.standup.update({
        where: { id: standup.id },
        data: { generationStatus: "FAILED" },
      });
      throw error;
    }
  },
};
