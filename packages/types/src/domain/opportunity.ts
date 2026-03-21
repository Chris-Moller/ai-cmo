export interface Opportunity {
  id: string;
  projectId: string;
  agentId: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
