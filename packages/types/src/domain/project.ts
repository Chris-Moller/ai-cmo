export interface Project {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  companyProfileId: string | null;
  status: 'active' | 'paused' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
