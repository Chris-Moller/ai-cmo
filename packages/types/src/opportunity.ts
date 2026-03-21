export type OpportunityStatus = 'new' | 'reviewed' | 'actioned' | 'dismissed';

export interface Opportunity {
  id: string;
  projectId: string;
  agentId: string;
  type: string;
  title: string;
  description: string;
  score: number;
  status: OpportunityStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
}
