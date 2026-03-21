import { z } from "zod";

export const CompetitorProfileSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  website: z.string().url(),
  description: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

export const CreateCompetitorProfileSchema = CompetitorProfileSchema.omit({
  id: true,
});

export type CompetitorProfile = z.infer<typeof CompetitorProfileSchema>;
export type CreateCompetitorProfile = z.infer<typeof CreateCompetitorProfileSchema>;
