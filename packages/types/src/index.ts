export type OpportunityType = 'content' | 'seo' | 'social' | 'competitive' | 'local';
export type OpportunityPriority = 'high' | 'medium' | 'low';
export type OpportunityStatus = 'new' | 'reviewed' | 'actioned' | 'dismissed';

export interface Opportunity {
  id: string;
  projectId: string;
  agentName: string;
  type: OpportunityType;
  title: string;
  description: string;
  source: string;
  priority: OpportunityPriority;
  status: OpportunityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IngestResult {
  sourceCount: number;
  rawDataSize: number;
  metadata: Record<string, unknown>;
}

export interface AnalysisResult {
  insights: string[];
  confidence: number;
  metadata: Record<string, unknown>;
}

export type ProjectStatus = 'active' | 'paused' | 'archived';

export interface Project {
  id: string;
  userId: string;
  name: string;
  domain: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyProfile {
  id: string;
  projectId: string;
  industry: string;
  size: string;
  positioning: string;
  narrative: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NarrativeModel {
  id: string;
  projectId: string;
  valueProps: string[];
  differentiators: string[];
  tone: string;
  targetAudience: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorProfile {
  id: string;
  projectId: string;
  name: string;
  domain: string;
  strengths: string[];
  weaknesses: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type AssetType = 'blog' | 'social' | 'email' | 'ad' | 'other';
export type AssetStatus = 'draft' | 'review' | 'published';

export interface Asset {
  id: string;
  opportunityId: string;
  type: AssetType;
  title: string;
  content: string;
  status: AssetStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignStatus = 'planned' | 'active' | 'completed';

export interface Campaign {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentRunStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentRun {
  id: string;
  projectId: string;
  agentName: string;
  status: AgentRunStatus;
  startedAt: Date | null;
  finishedAt: Date | null;
  resultSummary: string | null;
  error: string | null;
  createdAt: Date;
}

export interface DailyDigest {
  id: string;
  projectId: string;
  date: Date;
  summary: string;
  opportunityCount: number;
  createdAt: Date;
}
