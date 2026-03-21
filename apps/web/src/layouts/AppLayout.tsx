import { NavLink, Outlet } from 'react-router';

const navItems = [
  { to: '/', label: 'Command Center' },
  { to: '/projects/new', label: 'New Project' },
];

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <aside className="w-60 flex-shrink-0 bg-bg-secondary border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="font-display text-sm font-bold text-accent-cyan tracking-widest uppercase">
            Chief MOG Officer
          </h1>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-body transition-colors border-l-2 ${
                  isActive
                    ? 'bg-bg-tertiary border-accent-cyan text-text-primary'
                    : 'border-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-secondary font-display">v0.1.0</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
