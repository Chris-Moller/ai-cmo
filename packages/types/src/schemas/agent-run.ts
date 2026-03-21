import { z } from "zod";

export const AgentRunSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  agentName: z.string(),
  status: z.enum(["pending", "running", "completed", "failed"]),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
  result: z.record(z.string(), z.unknown()).nullable(),
  error: z.string().nullable(),
});

export const CreateAgentRunSchema = AgentRunSchema.omit({
  id: true,
});

export type AgentRun = z.infer<typeof AgentRunSchema>;
export type CreateAgentRun = z.infer<typeof CreateAgentRunSchema>;
