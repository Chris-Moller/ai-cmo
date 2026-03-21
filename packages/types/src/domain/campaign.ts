export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface Campaign {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  assetIds: string[];
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
