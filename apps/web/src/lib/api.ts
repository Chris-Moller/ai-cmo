import type { Project, CreateProject, Opportunity } from '@cmo/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async getProjects(): Promise<Project[]> {
    return fetchJSON<Project[]>('/api/projects');
  },

  async createProject(data: CreateProject): Promise<Project> {
    return fetchJSON<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProject(id: string): Promise<Project> {
    return fetchJSON<Project>(`/api/projects/${id}`);
  },

  async triggerAnalysis(projectId: string): Promise<{ jobId: string }> {
    return fetchJSON<{ jobId: string }>(`/api/projects/${projectId}/analyze`, {
      method: 'POST',
    });
  },

  async getOpportunities(projectId: string): Promise<Opportunity[]> {
    return fetchJSON<Opportunity[]>(`/api/projects/${projectId}/opportunities`);
  },
};
