import { prisma } from "../db/client.js";
import { eventService } from "./event.service.js";
import { AdrStatus } from "@prisma/client";

export const adrService = {
  async getAdrsByProject(projectId: string) {
    return prisma.adr.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
  },

  async getAdrById(adrId: string, projectId: string) {
    const adr = await prisma.adr.findUnique({
      where: { id: adrId },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        supersededBy: true,
        supersedes: true,
        issues: { include: { issue: true } },
        modules: { include: { module: true } },
        pullRequests: { include: { pullRequest: true } },
      },
    });

    if (!adr || adr.projectId !== projectId) {
      throw new Error("ADR not found");
    }

    return adr;
  },

  async createAdr(
    projectId: string,
    authorId: string,
    data: {
      title: string;
      context: string;
      decision: string;
      alternatives?: string;
      consequences?: string;
    }
  ) {
    const adr = await prisma.adr.create({
      data: {
        projectId,
        authorId,
        title: data.title,
        context: data.context,
        decision: data.decision,
        alternatives: data.alternatives,
        consequences: data.consequences,
        status: "PROPOSED",
      },
    });

    await eventService.emit(
      "adr.created",
      { adrId: adr.id, title: adr.title },
      { projectId, actorId: authorId }
    );

    return adr;
  },

  async updateStatus(
    adrId: string,
    projectId: string,
    actorId: string,
    newStatus: AdrStatus
  ) {
    const adr = await prisma.$transaction(async (tx) => {
      const existing = await tx.adr.findUnique({ where: { id: adrId } });
      if (!existing || existing.projectId !== projectId) {
        throw new Error("ADR not found");
      }

      // Enforce State Machine: PROPOSED -> ACCEPTED -> DEPRECATED
      // SUPERSEDED is handled exclusively by supersedeAdr()
      if (newStatus === "SUPERSEDED") {
        throw new Error("Use supersedeAdr to mark an ADR as superseded");
      }

      if (existing.status === "PROPOSED" && newStatus !== "ACCEPTED") {
        throw new Error("A PROPOSED ADR can only transition to ACCEPTED");
      }

      if (existing.status === "DEPRECATED" || existing.status === "SUPERSEDED") {
        throw new Error("Cannot change status of a deprecated or superseded ADR");
      }

      const updated = await tx.adr.update({
        where: { id: adrId },
        data: { status: newStatus },
      });

      return updated;
    });

    if (newStatus === "ACCEPTED") {
      await eventService.emit("adr.accepted", { adrId }, { projectId, actorId });
    } else if (newStatus === "DEPRECATED") {
      await eventService.emit("adr.deprecated", { adrId }, { projectId, actorId });
    }

    return adr;
  },

  async supersedeAdr(
    projectId: string,
    actorId: string,
    oldAdrId: string,
    replacementAdrId: string
  ) {
    if (oldAdrId === replacementAdrId) {
      throw new Error("An ADR cannot supersede itself");
    }

    const { oldAdr, newAdr } = await prisma.$transaction(async (tx) => {
      const old = await tx.adr.findUnique({ where: { id: oldAdrId } });
      const replacement = await tx.adr.findUnique({ where: { id: replacementAdrId } });

      if (!old || old.projectId !== projectId) throw new Error("Original ADR not found");
      if (!replacement || replacement.projectId !== projectId) throw new Error("Replacement ADR not found");

      if (old.status === "SUPERSEDED") {
        throw new Error("Original ADR is already superseded");
      }

      if (replacement.status !== "ACCEPTED") {
        throw new Error("Replacement ADR must be in ACCEPTED status");
      }

      // Check for cycles (e.g. A supersedes B, B supersedes A)
      // Note: Only direct cycle detection. Transitive cycles (A→B→C→A) 
      // are not detected in V1. Add recursive check before V2.
      if (replacement.supersededById === old.id) {
        throw new Error("Cannot create a supersession cycle");
      }

      const updatedOld = await tx.adr.update({
        where: { id: oldAdrId },
        data: {
          status: "SUPERSEDED",
          supersededById: replacementAdrId,
        },
      });

      return { oldAdr: updatedOld, newAdr: replacement };
    });

    await eventService.emit(
      "adr.superseded",
      { oldAdrId, replacementAdrId },
      { projectId, actorId }
    );

    return oldAdr;
  },

  async linkIssue(adrId: string, issueId: string, projectId: string, actorId: string) {
    const adrIssue = await prisma.$transaction(async (tx) => {
      const adr = await tx.adr.findUnique({ where: { id: adrId } });
      const issue = await tx.issue.findUnique({ where: { id: issueId } });

      if (!adr || adr.projectId !== projectId) throw new Error("ADR not found");
      if (!issue || issue.projectId !== projectId) throw new Error("Issue not found or belongs to a different project");

      return tx.adrIssue.create({
        data: { adrId, issueId },
      });
    });

    await eventService.emit("adr.issue_linked", { adrId, issueId }, { projectId, actorId });
    return adrIssue;
  },

  async linkModule(adrId: string, moduleId: string, projectId: string, actorId: string) {
    const adrModule = await prisma.$transaction(async (tx) => {
      const adr = await tx.adr.findUnique({ where: { id: adrId } });
      const module = await tx.module.findUnique({ where: { id: moduleId } });

      if (!adr || adr.projectId !== projectId) throw new Error("ADR not found");
      if (!module || module.projectId !== projectId) throw new Error("Module not found or belongs to a different project");

      return tx.adrModule.create({
        data: { adrId, moduleId },
      });
    });

    await eventService.emit("adr.module_linked", { adrId, moduleId }, { projectId, actorId });
    return adrModule;
  },
};
