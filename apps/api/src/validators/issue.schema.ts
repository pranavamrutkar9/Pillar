import { z } from "zod";

export const PrioritySchema = z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.record(z.string(), z.any()).optional().nullable(), // Tiptap JSON
  statusId: z.string().min(1, "Status is required"),
  priority: PrioritySchema.optional().default("NONE"),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  estimate: z.number().int().min(0).nullable().optional(),
  labelIds: z.array(z.string()).optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.record(z.string(), z.any()).optional().nullable(),
  statusId: z.string().min(1).optional(),
  priority: PrioritySchema.optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  estimate: z.number().int().min(0).nullable().optional(),
  labelIds: z.array(z.string()).optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
