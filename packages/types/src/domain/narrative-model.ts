export interface NarrativeModel {
  id: string;
  projectId: string;
  coreNarrative: string;
  themes: string[];
  audience: string | null;
  tone: string | null;
  createdAt: Date;
  updatedAt: Date;
}
