import { prisma } from "../db/client.js";
import { CreateLabelInput, UpdateLabelInput } from "../validators/label.schema.js";

export const labelService = {
  async getLabels(projectId: string) {
    return await prisma.issueLabel.findMany({
      where: { projectId },
    });
  },

  async createLabel(projectId: string, data: CreateLabelInput) {
    return await prisma.issueLabel.create({
      data: {
        projectId,
        name: data.name,
        color: data.color,
      },
    });
  },

  async updateLabel(projectId: string, labelId: string, data: UpdateLabelInput) {
    return await prisma.issueLabel.update({
      where: { id: labelId, projectId },
      data,
    });
  },

  async deleteLabel(projectId: string, labelId: string) {
    const inUse = await prisma.issueLabelMap.count({ where: { labelId } });
    if (inUse > 0) {
      throw new Error("Cannot delete label that is attached to issues");
    }
    return await prisma.issueLabel.delete({
      where: { id: labelId, projectId },
    });
  }
};
