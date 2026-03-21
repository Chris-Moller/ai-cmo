import type { Opportunity } from '@chief-mog-officer/types';

export interface AgentContext {
  projectId: string;
  runId: string;
}

export interface IngestResult {
  dataPoints: number;
  sources: string[];
}

export interface AnalysisResult {
  insights: string[];
  confidence: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  ingest(context: AgentContext): Promise<IngestResult>;
  analyze(context: AgentContext): Promise<AnalysisResult>;
  generateOpportunities(context: AgentContext): Promise<Opportunity[]>;
  summarize(context: AgentContext): Promise<string>;
}
