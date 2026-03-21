import { z } from "zod";

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  agentId: z.string(),
  type: z.enum(["content", "seo", "social", "competitive", "geographic"]),
  title: z.string().min(1),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["new", "reviewed", "actioned", "dismissed"]),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.coerce.date(),
});

export const CreateOpportunitySchema = OpportunitySchema.omit({
  id: true,
  createdAt: true,
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
export type CreateOpportunity = z.infer<typeof CreateOpportunitySchema>;
