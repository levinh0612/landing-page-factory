import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/dashboard-page';
import { RoadmapPage } from '@/pages/roadmap-page';
import { LessonsPage } from '@/pages/lessons-page';
import { LessonPage } from '@/pages/lesson-page';
import { GamesPage } from '@/pages/games-page';
import { ChatPage } from '@/pages/chat-page';
import { ProgressPage } from '@/pages/progress-page';
import { CertificatePage } from '@/pages/certificate-page';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lesson/:week/:day" element={<LessonPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/certificate" element={<CertificatePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
