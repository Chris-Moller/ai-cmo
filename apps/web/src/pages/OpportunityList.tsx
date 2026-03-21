import { Badge } from '@chief-mog-officer/ui';

const mockOpportunities = [
  {
    id: '1',
    type: 'search',
    title: 'Rising keyword: "AI compliance tools"',
    confidence: 0.92,
    status: 'new' as const,
    date: '2026-03-20',
  },
  {
    id: '2',
    type: 'competitive',
    title: 'Competitor launched pricing page redesign',
    confidence: 0.87,
    status: 'reviewed' as const,
    date: '2026-03-19',
  },
  {
    id: '3',
    type: 'social',
    title: 'Reddit thread gaining traction in r/SaaS',
    confidence: 0.74,
    status: 'new' as const,
    date: '2026-03-19',
  },
  {
    id: '4',
    type: 'content',
    title: 'Blog post opportunity: "State of AI in 2026"',
    confidence: 0.81,
    status: 'accepted' as const,
    date: '2026-03-18',
  },
  {
    id: '5',
    type: 'geo',
    title: 'Emerging market signal in APAC region',
    confidence: 0.68,
    status: 'dismissed' as const,
    date: '2026-03-17',
  },
];

const statusVariant: Record<string, 'cyan' | 'amber' | 'green' | 'red' | 'neutral'> = {
  new: 'cyan',
  reviewed: 'amber',
  accepted: 'green',
  dismissed: 'neutral',
};

const typeLabels: Record<string, string> = {
  search: 'SEARCH',
  competitive: 'COMPETITIVE',
  social: 'SOCIAL',
  content: 'CONTENT',
  geo: 'GEO',
};

export function OpportunityList() {
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-text-primary uppercase tracking-wider mb-6">
        Opportunities
      </h2>
      <div className="bg-bg-secondary border border-border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                Confidence
              </th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {mockOpportunities.map((opp) => (
              <tr
                key={opp.id}
                className="border-b border-border last:border-b-0 hover:bg-bg-tertiary transition-colors"
              >
                <td className="px-4 py-3">
                  <Badge variant="neutral">{typeLabels[opp.type]}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-text-primary">{opp.title}</td>
                <td className="px-4 py-3 font-display text-sm text-text-primary">
                  {(opp.confidence * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[opp.status]}>{opp.status.toUpperCase()}</Badge>
                </td>
                <td className="px-4 py-3 font-display text-sm text-text-secondary">
                  {opp.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
