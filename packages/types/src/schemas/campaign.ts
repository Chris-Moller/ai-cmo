import { z } from "zod";

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  status: z.enum(["draft", "active", "completed"]),
  opportunityIds: z.array(z.string().uuid()),
  createdAt: z.coerce.date(),
});

export const CreateCampaignSchema = CampaignSchema.omit({
  id: true,
  createdAt: true,
});

export type Campaign = z.infer<typeof CampaignSchema>;
export type CreateCampaign = z.infer<typeof CreateCampaignSchema>;
