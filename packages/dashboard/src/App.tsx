import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/query-client';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LoginPage } from '@/pages/login-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { TemplatesPage } from '@/pages/templates-page';
import { ClientsPage } from '@/pages/clients-page';
import { ProjectsPage } from '@/pages/projects-page';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
