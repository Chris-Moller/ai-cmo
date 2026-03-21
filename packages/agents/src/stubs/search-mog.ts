import type { IngestResult, AnalysisResult, Opportunity } from '@cmo/types';
import type { AgentInterface } from '../interface.js';
import { createMockOpportunity } from './create-opportunity.js';

export const SearchMogAgent: AgentInterface = {
  name: 'search-mog',
  description: 'Analyzes search trends and SEO opportunities',

  async ingest(_projectId: string): Promise<IngestResult> {
    return {
      sourceCount: 150,
      rawDataSize: 2048,
      metadata: { source: 'google-trends' },
    };
  },

  async analyze(_projectId: string): Promise<AnalysisResult> {
    return {
      insights: [
        'Rising keyword: competitive intelligence tools',
        'Declining interest in manual market research',
        'Content gap: AI-powered marketing automation',
      ],
      confidence: 0.82,
      metadata: {},
    };
  },

  async generateOpportunities(projectId: string): Promise<Opportunity[]> {
    return [
      createMockOpportunity({
        id: 'opp-search-001',
        projectId,
        agentName: 'search-mog',
        type: 'seo',
        title: 'Target rising keyword: competitive intelligence tools',
        description:
          'Search volume for "competitive intelligence tools" has increased 45% in the last quarter. Creating targeted content could capture early traffic.',
        source: 'google-trends',
        priority: 'high',
      }),
      createMockOpportunity({
        id: 'opp-search-002',
        projectId,
        agentName: 'search-mog',
        type: 'seo',
        title: 'Fill content gap: AI marketing automation guides',
        description:
          'There is a significant content gap for comprehensive guides on AI-powered marketing automation. Competitors have not yet addressed this topic in depth.',
        source: 'google-trends',
        priority: 'medium',
      }),
    ];
  },

  async summarize(_projectId: string): Promise<string> {
    return 'Search trend analysis reveals growing interest in competitive intelligence tools (+45% search volume). A significant content gap exists around AI-powered marketing automation, presenting an opportunity to capture organic traffic ahead of competitors.';
  },
};
