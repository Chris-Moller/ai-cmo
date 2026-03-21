export interface CompanyProfile {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  industry: string | null;
  website: string | null;
  positioning: string | null;
  createdAt: Date;
  updatedAt: Date;
}
