import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Command Center', icon: '⌘' },
  { to: '/projects/new', label: 'New Project', icon: '+' },
  { to: '/projects/demo/opportunities', label: 'Opportunities', icon: '◎' },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-700/50 bg-zinc-900">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-700/50 px-6">
        <span className="font-display text-xl font-bold tracking-tight text-emerald-400">
          CMO
        </span>
        <span className="text-xs font-medium text-zinc-500">
          Chief MOG Officer
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-400/10 text-emerald-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
              )
            }
          >
            <span className="font-mono text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-zinc-700/50 p-4">
        <p className="text-xs text-zinc-600">v0.1.0 — scaffold</p>
      </div>
    </aside>
  );
}
