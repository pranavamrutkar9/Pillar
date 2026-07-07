import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.any(), // Tiptap JSON
  parentId: z.string().nullable().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
