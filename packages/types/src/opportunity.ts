import { z } from 'zod';

export const opportunitySchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  agentId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['content', 'seo', 'social', 'competitive', 'geographic']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['new', 'reviewed', 'actioned', 'dismissed']),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Opportunity = z.infer<typeof opportunitySchema>;
