import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/home-page';
import { LearnPage } from '@/pages/learn-page';
import { LessonPage } from '@/pages/lesson-page';
import { ReviewPage } from '@/pages/review-page';
import { ChatPage } from '@/pages/chat-page';
import { ProfilePage } from '@/pages/profile-page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/lesson/:topicId/:subtopicId" element={<LessonPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
