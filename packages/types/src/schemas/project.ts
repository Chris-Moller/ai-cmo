import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  userId: z.string().uuid(),
  companyProfileId: z.string().uuid().nullable(),
  status: z.enum(["active", "paused", "archived"]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
