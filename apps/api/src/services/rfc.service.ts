import { prisma } from "../db/client.js";
import { eventService } from "./event.service.js";
import { RfcStatus, RfcVoteType, RfcTaskStatus } from "@prisma/client";
import { issueService } from "./issue.service.js"; // Assume exists for generating issues

export const rfcService = {
  async getRfcsByProject(projectId: string) {
    return prisma.rfc.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        votes: true,
      },
    });
  },

  async getRfcById(rfcId: string, projectId: string) {
    const rfc = await prisma.rfc.findUnique({
      where: { id: rfcId },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        sections: {
          orderBy: { position: "asc" },
          include: {
            _count: { select: { comments: true } },
          },
        },
        tasks: {
          orderBy: { createdAt: "asc" },
        },
        votes: true,
        modules: { include: { module: true } },
      },
    });

    if (!rfc || rfc.projectId !== projectId) {
      throw new Error("RFC not found");
    }

    return rfc;
  },

  async createRfc(
    projectId: string,
    authorId: string,
    data: { title: string; summary?: string }
  ) {
    const rfc = await prisma.rfc.create({
      data: {
        projectId,
        authorId,
        title: data.title,
        summary: data.summary,
        status: "DRAFT",
      },
    });

    await eventService.emit("rfc.created", { rfcId: rfc.id, title: rfc.title }, { projectId, actorId: authorId });
    return rfc;
  },

  async updateStatus(rfcId: string, projectId: string, actorId: string, newStatus: RfcStatus) {
    const rfc = await prisma.$transaction(async (tx) => {
      const existing = await tx.rfc.findUnique({ where: { id: rfcId } });
      if (!existing || existing.projectId !== projectId) throw new Error("RFC not found");

      // Enforce State Machine
      if (existing.status === "DRAFT" && newStatus !== "IN_REVIEW") {
        throw new Error("A DRAFT RFC can only move to IN_REVIEW");
      }
      if (existing.status === "IN_REVIEW" && !["ACCEPTED", "DRAFT"].includes(newStatus)) {
        throw new Error("An IN_REVIEW RFC can only move to ACCEPTED or back to DRAFT");
      }
      if (existing.status === "ACCEPTED" && newStatus !== "IMPLEMENTED") {
        throw new Error("An ACCEPTED RFC can only move to IMPLEMENTED");
      }
      if (existing.status === "IMPLEMENTED") {
        throw new Error("RFC is already IMPLEMENTED and cannot change status");
      }

      return tx.rfc.update({
        where: { id: rfcId },
        data: { status: newStatus },
      });
    });

    if (newStatus === "IN_REVIEW") {
      await eventService.emit("rfc.submitted", { rfcId }, { projectId, actorId });
    } else if (newStatus === "ACCEPTED") {
      await eventService.emit("rfc.accepted", { rfcId }, { projectId, actorId });
    } else if (newStatus === "IMPLEMENTED") {
      await eventService.emit("rfc.implemented", { rfcId }, { projectId, actorId });
    }

    return rfc;
  },

  async addSection(rfcId: string, projectId: string, data: { title: string; content: string; position: number }) {
    const section = await prisma.rfcSection.create({
      data: {
        rfcId,
        title: data.title,
        content: data.content,
        position: data.position,
      },
    });
    return section;
  },

  async addSectionComment(
    sectionId: string,
    projectId: string,
    actorId: string,
    content: string,
    parentId?: string
  ) {
    let actualRfcId = "";
    const comment = await prisma.$transaction(async (tx) => {
      const section = await tx.rfcSection.findUnique({
        where: { id: sectionId },
        include: { rfc: true },
      });
      if (!section || section.rfc.projectId !== projectId) throw new Error("Section not found");

      const isMember = await tx.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: actorId } },
      });
      if (!isMember) throw new Error("Only project members can comment on RFCs");

      actualRfcId = section.rfc.id;

      return tx.rfcSectionComment.create({
        data: {
          sectionId,
          authorId: actorId,
          content,
          parentId,
        },
      });
    });

    await eventService.emit("rfc.section_commented", { commentId: comment.id, rfcId: actualRfcId }, { projectId, actorId });
    return comment;
  },

  async castVote(rfcId: string, projectId: string, actorId: string, voteType: RfcVoteType) {
    const vote = await prisma.$transaction(async (tx) => {
      const rfc = await tx.rfc.findUnique({ where: { id: rfcId } });
      if (!rfc || rfc.projectId !== projectId) throw new Error("RFC not found");
      
      // Ensure user has project access (simplified here; real app checks ProjectMember)
      const isMember = await tx.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: actorId } },
      });
      if (!isMember) throw new Error("Only project members can vote");

      return tx.rfcVote.upsert({
        where: { rfcId_userId: { rfcId, userId: actorId } },
        update: { vote: voteType },
        create: {
          rfcId,
          userId: actorId,
          vote: voteType,
        },
      });
    });

    await eventService.emit("rfc.vote_cast", { rfcId, vote: voteType }, { projectId, actorId });
    return vote;
  },

  async addImplementationTask(rfcId: string, projectId: string, description: string) {
    return prisma.rfcImplementationTask.create({
      data: {
        rfcId,
        description,
        status: "PENDING",
      },
    });
  },

  async spawnIssuesFromRfc(rfcId: string, projectId: string, actorId: string) {
    const generatedIssues = await prisma.$transaction(async (tx) => {
      const rfc = await tx.rfc.findUnique({
        where: { id: rfcId },
        include: { tasks: true },
      });

      if (!rfc || rfc.projectId !== projectId) throw new Error("RFC not found");
      if (rfc.status !== "ACCEPTED") throw new Error("RFC must be ACCEPTED to generate issues");

      const ungeneratedTasks = rfc.tasks.filter((task) => !task.generatedIssueId);
      if (ungeneratedTasks.length === 0) {
        return []; // Idempotent: already generated
      }

      // We need the default status for new issues in this project
      const defaultStatus = await tx.issueStatus.findFirst({
        where: { projectId, isDefault: true },
      });
      if (!defaultStatus) throw new Error("Project has no default issue status");

      const project = await tx.project.update({
        where: { id: projectId },
        data: { nextIssueSequence: { increment: ungeneratedTasks.length } },
        select: { nextIssueSequence: true },
      });
      let currentSequenceId = project.nextIssueSequence - ungeneratedTasks.length;

      const issuesCreated = [];
      for (const task of ungeneratedTasks) {
        const issue = await tx.issue.create({
          data: {
            projectId,
            title: task.description,
            description: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: `Generated from RFC: ${rfc.title}` }],
                },
              ],
            },
            statusId: defaultStatus.id,
            creatorId: actorId,
            sequenceId: currentSequenceId++,
          },
        });

        // Link the task to the newly generated issue
        await tx.rfcImplementationTask.update({
          where: { id: task.id },
          data: { generatedIssueId: issue.id },
        });

        issuesCreated.push(issue);
      }

      return issuesCreated;
    });

    if (generatedIssues.length > 0) {
      await eventService.emit("rfc.issues_spawned", { rfcId, count: generatedIssues.length }, { projectId, actorId });
    }

    return generatedIssues;
  },
};
