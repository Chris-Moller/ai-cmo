import type { AgentContext, AnalysisResult, IngestResult, Opportunity } from '@chief-mog-officer/types';

export interface Agent {
  id: string;
  name: string;
  description: string;
  ingest(context: AgentContext): Promise<IngestResult>;
  analyze(context: AgentContext): Promise<AnalysisResult>;
  generateOpportunities(context: AgentContext): Promise<Opportunity[]>;
  summarize(context: AgentContext): Promise<string>;
}
