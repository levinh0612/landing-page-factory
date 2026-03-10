import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, BookOpen, MessageCircle } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { BottomNav } from '@/components/BottomNav';

export function HomePage() {
  const { getProgress, getStudyStats } = useProgress();
  const [progress, setProgress] = useState(getProgress());
  const stats = getStudyStats();

  useEffect(() => {
    setProgress(getProgress());
  }, [getProgress]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 17) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24">
      {/* Header */}
      <div className="border-b border-[#1f2d40] bg-[#111827] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-[#f1f5f9]">
            {getGreeting()}, Vinh! 👋
          </h1>
          <p className="mt-2 text-[#94a3b8]">
            Hãy tiếp tục học hôm nay
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
        {/* Streak badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#f59e0b]/20 px-4 py-2 text-[#f59e0b]">
          <span className="text-2xl">🔥</span>
          <span className="font-semibold">{progress.streak} ngày liên tiếp</span>
        </div>

        {/* Daily goal */}
        <div className="rounded-xl border border-[#1f2d40] bg-[#1e293b] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#f1f5f9]">
              Mục tiêu hôm nay
            </h2>
            <span className="text-sm text-[#94a3b8]">5 hoạt động</span>
          </div>
          <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-[#0f172a]">
            <div
              className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all"
              style={{ width: `${(progress.todayActivities / 5) * 100}%` }}
            />
          </div>
          <p className="text-sm text-[#cbd5e1]">
            {progress.todayActivities} / 5 hoạt động hoàn thành
          </p>
        </div>

        {/* Quick practice cards */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase text-[#94a3b8]">
            Luyện tập nhanh hôm nay
          </h3>
          <div className="space-y-3">
            <Link
              to="/learn"
              className="flex items-center gap-4 rounded-xl border border-[#1f2d40] bg-[#1e293b] p-4 hover:border-[#10b981] hover:bg-[#1e293b]/80 transition-colors"
            >
              <div className="text-3xl">⚡</div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#f1f5f9]">
                  Luyện nhanh 5 từ
                </h4>
                <p className="text-sm text-[#94a3b8]">
                  Chọn chủ đề và bắt đầu học
                </p>
              </div>
              <span className="text-[#10b981]">→</span>
            </Link>

            <Link
              to="/chat"
              className="flex items-center gap-4 rounded-xl border border-[#1f2d40] bg-[#1e293b] p-4 hover:border-[#10b981] hover:bg-[#1e293b]/80 transition-colors"
            >
              <div className="text-3xl">💬</div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#f1f5f9]">
                  Chat với AI
                </h4>
                <p className="text-sm text-[#94a3b8]">
                  Thực hành nói chuyện tiếng Anh
                </p>
              </div>
              <span className="text-[#10b981]">→</span>
            </Link>

            <Link
              to="/review"
              className="flex items-center gap-4 rounded-xl border border-[#1f2d40] bg-[#1e293b] p-4 hover:border-[#10b981] hover:bg-[#1e293b]/80 transition-colors"
            >
              <div className="text-3xl">🔄</div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#f1f5f9]">
                  Ôn tập từ vựng
                </h4>
                <p className="text-sm text-[#94a3b8]">
                  Flashcard review mode
                </p>
              </div>
              <span className="text-[#10b981]">→</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-4 text-center">
            <div className="mb-1 text-2xl font-bold text-[#f59e0b]">
              {progress.xp}
            </div>
            <p className="text-xs text-[#94a3b8]">XP hôm nay</p>
          </div>
          <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-4 text-center">
            <div className="mb-1 text-2xl font-bold text-[#10b981]">
              {progress.streak}
            </div>
            <p className="text-xs text-[#94a3b8]">Streak</p>
          </div>
          <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-4 text-center">
            <div className="mb-1 text-2xl font-bold text-[#6366f1]">
              {stats.totalWords}
            </div>
            <p className="text-xs text-[#94a3b8]">Tổng từ</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
