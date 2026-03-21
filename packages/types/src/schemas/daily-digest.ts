import { z } from "zod";

export const DailyDigestSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  date: z.coerce.date(),
  summary: z.string(),
  highlights: z.array(z.string()),
  agentRunIds: z.array(z.string().uuid()),
});

export const CreateDailyDigestSchema = DailyDigestSchema.omit({
  id: true,
});

export type DailyDigest = z.infer<typeof DailyDigestSchema>;
export type CreateDailyDigest = z.infer<typeof CreateDailyDigestSchema>;
