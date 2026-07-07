import { z } from "zod";

export const createLabelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().nullable().optional(),
});

export const updateLabelSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().nullable().optional(),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
