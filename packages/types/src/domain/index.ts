export type AgentRunStatus = 'pending' | 'running' | 'completed' | 'failed';
export type OpportunityStatus = 'new' | 'reviewed' | 'accepted' | 'dismissed';
export type OpportunityType = 'search' | 'geo' | 'reddit' | 'competitor' | 'content';
export type ProjectStatus = 'active' | 'paused' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  companyProfileId: string | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRun {
  id: string;
  projectId: string;
  agentId: string;
  status: AgentRunStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  result: unknown;
  error: string | null;
}

export interface Opportunity {
  id: string;
  projectId: string;
  agentId: string;
  type: OpportunityType;
  title: string;
  description: string;
  confidence: number;
  status: OpportunityStatus;
  metadata: unknown;
  createdAt: Date;
}

export interface AgentContext {
  projectId: string;
  project: Project;
}

export interface IngestResult {
  dataPoints: number;
  sources: string[];
}

export interface AnalysisResult {
  insights: string[];
  confidence: number;
}
