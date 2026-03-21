import { z } from "zod";

export const AssetSchema = z.object({
  id: z.string().uuid(),
  opportunityId: z.string().uuid(),
  type: z.enum(["article", "social_post", "report", "brief"]),
  content: z.string(),
  status: z.enum(["draft", "review", "published"]),
  createdAt: z.coerce.date(),
});

export const CreateAssetSchema = AssetSchema.omit({
  id: true,
  createdAt: true,
});

export type Asset = z.infer<typeof AssetSchema>;
export type CreateAsset = z.infer<typeof CreateAssetSchema>;
