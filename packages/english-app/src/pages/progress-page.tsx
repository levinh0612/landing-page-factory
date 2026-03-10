import { useProgress } from '@/hooks/useProgress';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { BarChart3, Zap, BookOpen, Users } from 'lucide-react';

export const ProgressPage = () => {
  const { getProgress, getLevelName, getStudyStats, getAllBadges, getBadgeInfo } = useProgress();
  const progress = getProgress();
  const stats = getStudyStats();
  const allBadges = getAllBadges();

  // Skills breakdown (simulated based on lessons)
  const skillBreakdown = {
    vocabulary: Math.min(100, (progress.completedLessons.length / 24) * 100),
    listening: Math.min(100, (progress.completedLessons.length / 24) * 80),
    speaking: Math.min(100, (progress.completedLessons.length / 24) * 60),
    grammar: Math.min(100, (progress.completedLessons.length / 24) * 70),
  };

  // Weekly XP data (simulated)
  const weeklyXP = [
    { week: 'Mon', xp: Math.floor(Math.random() * 200) + 50 },
    { week: 'Tue', xp: Math.floor(Math.random() * 200) + 50 },
    { week: 'Wed', xp: Math.floor(Math.random() * 200) + 50 },
    { week: 'Thu', xp: Math.floor(Math.random() * 200) + 50 },
    { week: 'Fri', xp: Math.floor(Math.random() * 200) + 50 },
    { week: 'Sat', xp: Math.floor(Math.random() * 200) + 50 },
    { week: 'Sun', xp: Math.floor(Math.random() * 200) + 50 },
  ];

  const maxWeeklyXP = Math.max(...weeklyXP.map((d) => d.xp));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#f1f5f9] mb-2">Your Progress</h1>
        <p className="text-[#94a3b8]">Track your learning journey</p>
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <Zap className="text-[#fbbf24] mb-2" size={20} />
          <p className="text-[#94a3b8] text-sm font-medium">Total XP</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#f1f5f9]">{progress.xp}</p>
        </Card>

        <Card className="p-4">
          <BarChart3 className="text-[#60a5fa] mb-2" size={20} />
          <p className="text-[#94a3b8] text-sm font-medium">Level</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#f1f5f9]">{progress.level}</p>
        </Card>

        <Card className="p-4">
          <BookOpen className="text-[#34d399] mb-2" size={20} />
          <p className="text-[#94a3b8] text-sm font-medium">Lessons</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#f1f5f9]">{stats.totalLessons}</p>
        </Card>

        <Card className="p-4">
          <Users className="text-[#a78bfa] mb-2" size={20} />
          <p className="text-[#94a3b8] text-sm font-medium">Badges</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#f1f5f9]">{stats.totalBadges}</p>
        </Card>
      </div>

      {/* Study Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#f1f5f9] mb-4">Study Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#334155] rounded-lg p-4">
            <p className="text-[#94a3b8] text-sm mb-1">Words Learned</p>
            <p className="text-3xl font-bold text-[#34d399]">{stats.totalWords}</p>
          </div>
          <div className="bg-[#334155] rounded-lg p-4">
            <p className="text-[#94a3b8] text-sm mb-1">Estimated Hours</p>
            <p className="text-3xl font-bold text-[#f59e0b]">{stats.estimatedHours}h</p>
          </div>
          <div className="bg-[#334155] rounded-lg p-4">
            <p className="text-[#94a3b8] text-sm mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-[#f1f5f9]">{progress.streak} days 🔥</p>
          </div>
          <div className="bg-[#334155] rounded-lg p-4">
            <p className="text-[#94a3b8] text-sm mb-1">Total Badges</p>
            <p className="text-3xl font-bold text-[#a78bfa]">{stats.totalBadges}</p>
          </div>
        </div>
      </Card>

      {/* Weekly XP Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#f1f5f9] mb-4">This Week's XP</h3>
        <div className="space-y-4">
          {weeklyXP.map((day) => (
            <div key={day.week}>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-[#94a3b8]">{day.week}</span>
                <span className="text-sm font-semibold text-[#f1f5f9]">{day.xp} XP</span>
              </div>
              <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] transition-all duration-300"
                  style={{ width: `${(day.xp / maxWeeklyXP) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Skills Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#f1f5f9] mb-6">Skills Breakdown</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-[#cbd5e1]">Vocabulary</span>
              <span className="text-sm font-semibold text-[#f1f5f9]">{Math.round(skillBreakdown.vocabulary)}%</span>
            </div>
            <Progress value={skillBreakdown.vocabulary} max={100} showLabel={false} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-[#cbd5e1]">Listening</span>
              <span className="text-sm font-semibold text-[#f1f5f9]">{Math.round(skillBreakdown.listening)}%</span>
            </div>
            <Progress value={skillBreakdown.listening} max={100} showLabel={false} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-[#cbd5e1]">Speaking</span>
              <span className="text-sm font-semibold text-[#f1f5f9]">{Math.round(skillBreakdown.speaking)}%</span>
            </div>
            <Progress value={skillBreakdown.speaking} max={100} showLabel={false} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-[#cbd5e1]">Grammar</span>
              <span className="text-sm font-semibold text-[#f1f5f9]">{Math.round(skillBreakdown.grammar)}%</span>
            </div>
            <Progress value={skillBreakdown.grammar} max={100} showLabel={false} />
          </div>
        </div>
      </Card>

      {/* Badges Collection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#f1f5f9] mb-6">Badge Collection</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {allBadges.map((badge) => {
            const isUnlocked = progress.badges.includes(badge.id);
            const badgeInfo = getBadgeInfo(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                  isUnlocked
                    ? 'bg-[#334155]/50 border-[#475569]'
                    : 'bg-[#1a1f2e]/50 border-[#334155] opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h4 className="text-sm font-semibold text-[#f1f5f9] mb-1 line-clamp-2">
                  {badge.name}
                </h4>
                <p className="text-xs text-[#94a3b8]">{badge.description}</p>
                {isUnlocked && (
                  <Badge variant="success" className="mt-3 mx-auto">
                    Unlocked
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Milestones */}
      <Card className="p-6 bg-gradient-to-br from-[#1e3a8a]/30 to-[#10b981]/10 border-[#1e3a8a]/50">
        <h3 className="text-lg font-semibold text-[#60a5fa] mb-4">Milestones</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎓</div>
            <div className="flex-1">
              <p className="font-medium text-[#f1f5f9]">First Lesson</p>
              <p className="text-xs text-[#94a3b8]">Completed {progress.completedLessons.length > 0 ? '✓' : '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-2xl">🏆</div>
            <div className="flex-1">
              <p className="font-medium text-[#f1f5f9]">Phase 1 Complete</p>
              <p className="text-xs text-[#94a3b8]">{progress.completedLessons.length >= 6 ? '✓' : `${6 - progress.completedLessons.length} lessons left`}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-2xl">🌟</div>
            <div className="flex-1">
              <p className="font-medium text-[#f1f5f9]">English Fluent</p>
              <p className="text-xs text-[#94a3b8]">{progress.completedLessons.length === 24 ? '✓' : `${24 - progress.completedLessons.length} lessons left`}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
