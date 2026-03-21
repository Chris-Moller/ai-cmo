import type { Opportunity } from '@cmo/types';

type OpportunityFields = Omit<Opportunity, 'status' | 'createdAt' | 'updatedAt'>;

export function createMockOpportunity(fields: OpportunityFields): Opportunity {
  const now = new Date();
  return {
    ...fields,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };
}
