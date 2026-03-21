export type AssetType = 'blog_post' | 'social_post' | 'email' | 'ad_copy' | 'landing_page';
export type AssetStatus = 'draft' | 'review' | 'approved' | 'published';

export interface Asset {
  id: string;
  projectId: string;
  opportunityId: string | null;
  type: AssetType;
  title: string;
  content: string | null;
  status: AssetStatus;
  createdAt: Date;
  updatedAt: Date;
}
