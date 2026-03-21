import type { Database } from "@chief-mog/db";
import type { Logger } from "@chief-mog/lib";
import type { Opportunity } from "@chief-mog/types";

export interface AgentContext {
	projectId: string;
	db: Database;
	logger: Logger;
}

export interface IngestResult {
	agentName: string;
	data: Record<string, unknown>;
	timestamp: Date;
}

export interface AnalysisResult {
	agentName: string;
	insights: string[];
	confidence: number;
	metadata: Record<string, unknown>;
}

export interface Agent {
	name: string;
	description: string;
	ingest(context: AgentContext): Promise<IngestResult>;
	analyze(context: AgentContext, data: IngestResult): Promise<AnalysisResult>;
	generateOpportunities(context: AgentContext, analysis: AnalysisResult): Promise<Opportunity[]>;
	summarize(context: AgentContext, opportunities: Opportunity[]): Promise<string>;
}
