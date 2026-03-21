import { Header } from '@/components/layout/Header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const metrics = [
  { label: 'Active Projects', value: '7', change: '+2 this week' },
  { label: 'Open Opportunities', value: '143', change: '+18 today' },
  { label: 'Agents Running', value: '3', change: '2 queued' },
  { label: 'Last Digest', value: '2h ago', change: 'Mar 21, 2026' },
];

const recentActivity = [
  { text: 'SearchMogAgent completed analysis for "Acme Corp Q1 Strategy"', time: '2 min ago' },
  { text: 'New opportunity: Reddit thread trending in r/SaaS — "Best CI tools 2026"', time: '14 min ago' },
  { text: 'CompetitorIntelAgent detected pricing change at RivalCo', time: '1h ago' },
  { text: 'ContentFoundryAgent generated 3 draft articles for "DevTools Launch"', time: '2h ago' },
  { text: 'Daily digest delivered for "FinTech Expansion" project', time: '3h ago' },
  { text: 'GeoAgent flagged emerging market signal in Southeast Asia', time: '5h ago' },
];

export function CommandCenter() {
  return (
    <>
      <Header title="Command Center" description="Overview of all intelligence operations" />
      <div className="p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label} className="hover:border-zinc-600 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {m.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl font-bold text-zinc-100">
                  {m.value}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{m.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold text-zinc-100 mb-4">
            Recent Activity
          </h2>
          <Card>
            <CardContent className="divide-y divide-zinc-700/50 p-0">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3">
                  <p className="text-sm text-zinc-300">{item.text}</p>
                  <span className="ml-4 shrink-0 font-mono text-xs text-zinc-500">
                    {item.time}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
