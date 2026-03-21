export interface DailyDigest {
  id: string;
  projectId: string;
  date: Date;
  summary: string;
  opportunityIds: string[];
  createdAt: Date;
}
