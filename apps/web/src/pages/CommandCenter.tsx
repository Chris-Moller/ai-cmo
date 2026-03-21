import { Card, StatusDot } from '@chief-mog-officer/ui';

export function CommandCenter() {
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-text-primary uppercase tracking-wider mb-6">
        Command Center
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card title="Active Projects">
          <p className="font-display text-3xl font-bold text-accent-cyan">3</p>
          <p className="text-xs text-text-secondary mt-1">across 2 industries</p>
        </Card>

        <Card title="Pending Opportunities">
          <p className="font-display text-3xl font-bold text-accent-amber">12</p>
          <p className="text-xs text-text-secondary mt-1">awaiting review</p>
        </Card>

        <Card title="Agents Status">
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center gap-2 text-sm">
              <StatusDot color="green" />
              <span className="text-text-primary">SearchMog</span>
              <span className="text-text-secondary ml-auto font-display text-xs">ACTIVE</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <StatusDot color="green" />
              <span className="text-text-primary">GeoAgent</span>
              <span className="text-text-secondary ml-auto font-display text-xs">ACTIVE</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <StatusDot color="amber" />
              <span className="text-text-primary">RedditMog</span>
              <span className="text-text-secondary ml-auto font-display text-xs">IDLE</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <StatusDot color="green" />
              <span className="text-text-primary">CompetitorIntel</span>
              <span className="text-text-secondary ml-auto font-display text-xs">ACTIVE</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <StatusDot color="red" />
              <span className="text-text-primary">ContentFoundry</span>
              <span className="text-text-secondary ml-auto font-display text-xs">ERROR</span>
            </div>
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="flex flex-col gap-2 mt-1">
            <div className="text-sm">
              <p className="text-text-primary">SearchMog completed analysis</p>
              <p className="text-xs text-text-secondary font-display">2 min ago</p>
            </div>
            <div className="text-sm">
              <p className="text-text-primary">New opportunity detected</p>
              <p className="text-xs text-text-secondary font-display">15 min ago</p>
            </div>
            <div className="text-sm">
              <p className="text-text-primary">Project "Acme Corp" created</p>
              <p className="text-xs text-text-secondary font-display">1 hr ago</p>
            </div>
            <div className="text-sm">
              <p className="text-text-primary">Daily digest generated</p>
              <p className="text-xs text-text-secondary font-display">6 hrs ago</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
