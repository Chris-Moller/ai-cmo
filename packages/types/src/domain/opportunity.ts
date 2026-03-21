export type OpportunityType = 'search' | 'geo' | 'social' | 'competitive' | 'content';
export type OpportunityStatus = 'new' | 'reviewed' | 'accepted' | 'dismissed';

export interface Opportunity {
  id: string;
  projectId: string;
  agentId: string;
  type: OpportunityType;
  title: string;
  description: string;
  confidence: number;
  status: OpportunityStatus;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
