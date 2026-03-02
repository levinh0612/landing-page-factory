import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/query-client';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LoginPage } from '@/pages/login-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { TemplatesPage } from '@/pages/templates-page';
import { ClientsPage } from '@/pages/clients-page';
import { ProjectsPage } from '@/pages/projects-page';
import { ProjectDetailPage } from '@/pages/project-detail-page';
import { UsersPage } from '@/pages/users-page';
import { ActivityLogsPage } from '@/pages/activity-logs-page';
import { PublicPreviewPage } from '@/pages/public-preview-page';
import { MediaPage } from '@/pages/media-page';
import { PostsPage } from '@/pages/posts-page';
import { PostEditorPage } from '@/pages/post-editor-page';
import { PagesPage } from '@/pages/pages-page';
import { CommentsPage } from '@/pages/comments-page';
import { ComponentsPage } from '@/pages/components-page';
import { AppearancePage } from '@/pages/appearance-page';
import { MonitorPage } from '@/pages/monitor-page';
import { ToolsPage } from '@/pages/tools-page';
import { SettingsPage } from '@/pages/settings-page';
import { PluginsPage } from '@/pages/plugins-page';
import { EditorPage } from '@/pages/editor-page';
import { GeneratorPage } from '@/pages/generator-page';
import { ECardsPage } from '@/pages/e-cards-page';
import { DomainsPage } from '@/pages/domains-page';
import { MarketplacePage } from '@/pages/marketplace-page';
import { JiraPage } from '@/pages/jira-page';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/preview/:token" element={<PublicPreviewPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/activity-logs" element={<ActivityLogsPage />} />

                {/* CMS Routes */}
                <Route path="/media" element={<MediaPage />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route path="/posts/new" element={<PostEditorPage />} />
                <Route path="/posts/:id" element={<PostEditorPage />} />
                <Route path="/pages" element={<PagesPage />} />
                <Route path="/pages/new" element={<PagesPage />} />
                <Route path="/pages/:id" element={<PagesPage />} />
                <Route path="/comments" element={<CommentsPage />} />

                {/* Design Routes */}
                <Route path="/components" element={<ComponentsPage />} />
                <Route path="/appearance" element={<AppearancePage />} />

                {/* System Routes */}
                <Route path="/monitor" element={<MonitorPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/plugins" element={<PluginsPage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/generator" element={<GeneratorPage />} />
                <Route path="/e-cards" element={<ECardsPage />} />
                <Route path="/domains" element={<DomainsPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/jira" element={<JiraPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
