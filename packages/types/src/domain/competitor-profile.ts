export interface CompetitorProfile {
  id: string;
  projectId: string;
  name: string;
  website: string | null;
  description: string | null;
  strengths: string[];
  weaknesses: string[];
  createdAt: Date;
  updatedAt: Date;
}
