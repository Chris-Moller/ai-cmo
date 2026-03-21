import { z } from "zod";

export const CompanyProfileSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  industry: z.string(),
  website: z.string().url(),
  positioning: z.string(),
});

export const CreateCompanyProfileSchema = CompanyProfileSchema.omit({
  id: true,
});

export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
export type CreateCompanyProfile = z.infer<typeof CreateCompanyProfileSchema>;
