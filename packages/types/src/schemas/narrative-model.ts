import { z } from "zod";

export const NarrativeModelSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  coreNarrative: z.string(),
  keyThemes: z.array(z.string()),
  voiceAttributes: z.array(z.string()),
});

export const CreateNarrativeModelSchema = NarrativeModelSchema.omit({
  id: true,
});

export type NarrativeModel = z.infer<typeof NarrativeModelSchema>;
export type CreateNarrativeModel = z.infer<typeof CreateNarrativeModelSchema>;
