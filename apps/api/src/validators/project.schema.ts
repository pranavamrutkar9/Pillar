import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  isHackathonMode: z.boolean().optional().default(false),
  deadline: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
