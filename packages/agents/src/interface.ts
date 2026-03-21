import type { IngestResult, AnalysisResult, Opportunity } from '@cmo/types';

export interface AgentInterface {
  /** Unique identifier for this agent */
  name: string;
  /** Human-readable description */
  description: string;
  /** Collect raw data from external sources */
  ingest(projectId: string): Promise<IngestResult>;
  /** Analyze ingested data and produce insights */
  analyze(projectId: string): Promise<AnalysisResult>;
  /** Generate actionable opportunities from analysis */
  generateOpportunities(projectId: string): Promise<Opportunity[]>;
  /** Produce a text summary of findings */
  summarize(projectId: string): Promise<string>;
}
