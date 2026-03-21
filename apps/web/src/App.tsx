import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { CommandCenter } from '@/routes/CommandCenter';
import { ProjectCreate } from '@/routes/ProjectCreate';
import { OpportunityList } from '@/routes/OpportunityList';

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/projects/new" element={<ProjectCreate />} />
          <Route path="/projects/:id/opportunities" element={<OpportunityList />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
