export interface Project {
  id: string;
  name: string;
  description: string;
  industry: string;
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProject {
  name: string;
  description: string;
  industry: string;
}
