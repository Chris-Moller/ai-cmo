import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="pl-64">
        {children}
      </main>
    </div>
  );
}
