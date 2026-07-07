import { prisma } from "../db/client.js";
import { CreateStatusInput, UpdateStatusInput, ReorderStatusesInput } from "../validators/status.schema.js";

export const statusService = {
  async getStatuses(projectId: string) {
    return await prisma.issueStatus.findMany({
      where: { projectId },
      orderBy: { position: "asc" },
    });
  },

  async createStatus(projectId: string, data: CreateStatusInput) {
    let position = data.position;
    if (position === undefined) {
      const lastStatus = await prisma.issueStatus.findFirst({
        where: { projectId },
        orderBy: { position: "desc" },
      });
      position = lastStatus ? lastStatus.position + 1 : 1;
    }

    return await prisma.issueStatus.create({
      data: {
        projectId,
        name: data.name,
        color: data.color,
        position,
        isDefault: data.isDefault || false,
        isDone: data.isDone || false,
      },
    });
  },

  async updateStatus(projectId: string, statusId: string, data: UpdateStatusInput) {
    return await prisma.issueStatus.update({
      where: { id: statusId, projectId },
      data,
    });
  },

  async deleteStatus(projectId: string, statusId: string) {
    const issuesUsingStatus = await prisma.issue.count({
      where: { projectId, statusId },
    });

    if (issuesUsingStatus > 0) {
      throw new Error("Cannot delete status that is in use by issues.");
    }

    return await prisma.issueStatus.delete({
      where: { id: statusId, projectId },
    });
  },

  async reorderStatuses(projectId: string, data: ReorderStatusesInput) {
    return await prisma.$transaction(
      data.statuses.map((status) =>
        prisma.issueStatus.update({
          where: { id: status.id, projectId },
          data: { position: status.position },
        })
      )
    );
  }
};
