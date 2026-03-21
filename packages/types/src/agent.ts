export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentRun {
  id: string;
  projectId: string;
  agentId: string;
  status: AgentStatus;
  startedAt: string;
  completedAt: string | null;
  result: Record<string, unknown> | null;
  error: string | null;
}
