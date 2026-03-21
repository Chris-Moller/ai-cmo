import type { OpportunityStatus } from '@cmo/types';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusFilters = ['All', 'New', 'Reviewed', 'Actioned'] as const;

const mockOpportunities = [
  {
    title: 'Reddit thread trending: "Best CI/CD tools for startups"',
    agent: 'RedditMogAgent',
    score: 92,
    status: 'new' as const,
    created: '2026-03-21',
  },
  {
    title: 'Competitor RivalCo dropped enterprise pricing by 20%',
    agent: 'CompetitorIntelAgent',
    score: 87,
    status: 'reviewed' as const,
    created: '2026-03-20',
  },
  {
    title: 'Search volume spike: "open source monitoring" +340%',
    agent: 'SearchMogAgent',
    score: 78,
    status: 'new' as const,
    created: '2026-03-20',
  },
  {
    title: 'Emerging market signal: developer hiring surge in Vietnam',
    agent: 'GeoAgent',
    score: 65,
    status: 'actioned' as const,
    created: '2026-03-19',
  },
  {
    title: 'Content gap: no ranking content for "API security best practices"',
    agent: 'ContentFoundryAgent',
    score: 71,
    status: 'new' as const,
    created: '2026-03-19',
  },
];

const statusVariant: Record<OpportunityStatus, 'default' | 'secondary' | 'warning' | 'info'> = {
  new: 'default',
  reviewed: 'info',
  actioned: 'secondary',
  dismissed: 'warning',
};

export function OpportunityList() {
  return (
    <>
      <Header title="Opportunities" description="Intelligence opportunities for this project" />
      <div className="p-8">
        <div className="mb-6 flex gap-2">
          {statusFilters.map((filter) => (
            <Badge
              key={filter}
              variant={filter === 'All' ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              {filter}
            </Badge>
          ))}
        </div>

        <div className="rounded-lg border border-zinc-700/50 bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOpportunities.map((opp, i) => (
                <TableRow key={i}>
                  <TableCell className="max-w-md font-medium text-zinc-200">
                    {opp.title}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-400">
                    {opp.agent}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-400">
                    {opp.score}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[opp.status]}>
                      {opp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-500">
                    {opp.created}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
