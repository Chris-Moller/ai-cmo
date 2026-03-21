export type AgentRunStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentRun {
  id: string;
  projectId: string;
  agentId: string;
  status: AgentRunStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  result: Record<string, unknown> | null;
  error: string | null;
  createdAt: Date;
}
