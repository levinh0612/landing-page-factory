import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { BottomNav } from '@/components/BottomNav';
import { Lock } from 'lucide-react';

const ALL_BADGES = [
  {
    id: 'day-one',
    name: 'Ngày đầu tiên',
    icon: '🌱',
    description: 'Hoàn thành bài học đầu tiên',
    earned: true,
  },
  {
    id: 'five-words',
    name: '5 từ mới',
    icon: '📖',
    description: 'Học 5 từ vựng',
    earned: true,
  },
  {
    id: 'streak-3',
    name: 'Streak 3 ngày',
    icon: '🔥',
    description: 'Học 3 ngày liên tiếp',
    earned: true,
  },
  {
    id: '50-words',
    name: '50 từ học',
    icon: '📚',
    description: 'Học 50 từ vựng',
    earned: false,
  },
  {
    id: 'quiz-master',
    name: 'Quiz master',
    icon: '🎯',
    description: 'Làm đúng 5 bài quiz',
    earned: false,
  },
  {
    id: 'fluent-speaker',
    name: 'Fluent speaker',
    icon: '🗣️',
    description: 'Chat 10 lần',
    earned: false,
  },
  {
    id: 'streak-7',
    name: 'Streak 7 ngày',
    icon: '🔥🔥',
    description: 'Học 7 ngày liên tiếp',
    earned: false,
  },
  {
    id: 'master',
    name: 'Master',
    icon: '👑',
    description: 'Đạt level 7',
    earned: false,
  },
];

export function ProfilePage() {
  const { getProgress, getLevelName, getXPProgressToNextLevel, getStudyStats } =
    useProgress();
  const progress = getProgress();
  const stats = getStudyStats();
  const xpProgress = getXPProgressToNextLevel();

  const getLevelColor = (level: number) => {
    const colors = [
      'text-blue-400',
      'text-green-400',
      'text-yellow-400',
      'text-orange-400',
      'text-red-400',
      'text-purple-400',
      'text-pink-400',
    ];
    return colors[level - 1] || colors[0];
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pb-20">
      {/* Header */}
      <div className="border-b border-[#1f2d40] bg-gradient-to-br from-[#1e293b] to-[#111827] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {/* Avatar and name */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10b981] text-3xl font-bold text-white">
              LV
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#f1f5f9]">
                {progress.userName}
              </h1>
              <p className={`text-lg font-semibold ${getLevelColor(progress.level)}`}>
                {getLevelName(progress.level)} ⭐
              </p>
            </div>
          </div>

          {/* Level progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#cbd5e1]">
                Level {progress.level}
              </span>
              <span className="text-sm text-[#94a3b8]">
                {xpProgress.current} / {xpProgress.total} XP
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#0f172a]">
              <div
                className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all"
                style={{
                  width: `${(xpProgress.current / xpProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-4 text-center">
            <div className="mb-2 text-3xl">🔥</div>
            <div className="mb-1 text-2xl font-bold text-[#f59e0b]">
              {progress.streak}
            </div>
            <p className="text-xs text-[#94a3b8]">Streak</p>
          </div>

          <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-4 text-center">
            <div className="mb-2 text-3xl">📚</div>
            <div className="mb-1 text-2xl font-bold text-[#10b981]">
              {stats.totalWords}
            </div>
            <p className="text-xs text-[#94a3b8]">Từ học</p>
          </div>

          <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-4 text-center">
            <div className="mb-2 text-3xl">⏱️</div>
            <div className="mb-1 text-2xl font-bold text-[#6366f1]">
              {stats.estimatedHours}h
            </div>
            <p className="text-xs text-[#94a3b8]">Giờ học</p>
          </div>

          <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-4 text-center">
            <div className="mb-2 text-3xl">✅</div>
            <div className="mb-1 text-2xl font-bold text-[#f97316]">
              {stats.totalBadges}
            </div>
            <p className="text-xs text-[#94a3b8]">Badges</p>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-[#f1f5f9]">
            Thành Tích ({stats.totalBadges}/8)
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ALL_BADGES.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-lg border p-4 text-center transition-opacity ${
                  badge.earned
                    ? 'border-[#1f2d40] bg-[#1e293b]'
                    : 'border-[#1f2d40] bg-[#111827] opacity-50'
                }`}
              >
                <div className="mb-2 text-3xl">{badge.icon}</div>
                <h3 className="text-sm font-semibold text-[#f1f5f9]">
                  {badge.name}
                </h3>
                <p className="mt-1 text-xs text-[#94a3b8]">
                  {badge.description}
                </p>
                {!badge.earned && (
                  <Lock size={16} className="mx-auto mt-2 text-[#94a3b8]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-6">
          <h2 className="mb-4 text-lg font-bold text-[#f1f5f9]">Cài Đặt</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[#cbd5e1]">
                Nhắc nhở học hàng ngày
              </label>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-[#1f2d40] bg-[#0f172a] text-[#10b981]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[#cbd5e1]">Chế độ tối</label>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-[#1f2d40] bg-[#0f172a] text-[#10b981]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[#cbd5e1]">Phát âm tự động</label>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-[#1f2d40] bg-[#0f172a] text-[#10b981]"
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-6 text-center">
          <p className="text-sm text-[#94a3b8]">
            English Learning App v1.0
          </p>
          <p className="mt-2 text-xs text-[#64748b]">
            Made with 💚 for Fullstack Developers
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
