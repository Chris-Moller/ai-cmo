import { BrowserRouter, Routes, Route } from 'react-router';
import { AppLayout } from './layouts/AppLayout';
import { CommandCenter } from './pages/CommandCenter';
import { ProjectCreate } from './pages/ProjectCreate';
import { OpportunityList } from './pages/OpportunityList';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<CommandCenter />} />
            <Route path="projects/new" element={<ProjectCreate />} />
            <Route path="projects/:id/opportunities" element={<OpportunityList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
