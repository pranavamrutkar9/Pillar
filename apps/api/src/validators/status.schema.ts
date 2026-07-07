import { z } from "zod";

export const createStatusSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().nullable().optional(),
  position: z.number().optional(),
  isDefault: z.boolean().optional(),
  isDone: z.boolean().optional(),
});

export const updateStatusSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().nullable().optional(),
  position: z.number().optional(),
  isDefault: z.boolean().optional(),
  isDone: z.boolean().optional(),
});

export const reorderStatusesSchema = z.object({
  statuses: z.array(z.object({
    id: z.string(),
    position: z.number(),
  }))
});

export type CreateStatusInput = z.infer<typeof createStatusSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ReorderStatusesInput = z.infer<typeof reorderStatusesSchema>;
