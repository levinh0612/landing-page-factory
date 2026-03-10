import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { XPBar } from '@/components/ui/XPBar';
import { useProgress } from '@/hooks/useProgress';
import { curriculum } from '@/data/curriculum';
import { Link } from 'react-router-dom';
import { Flame, BookOpen, Zap, TrendingUp, ChevronRight } from 'lucide-react';

export const DashboardPage = () => {
  const { getProgress, getLevelName, getXPProgressToNextLevel, getStudyStats } = useProgress();
  const [progress, setProgress] = useState(getProgress());
  const stats = getStudyStats();
  const xpProgress = getXPProgressToNextLevel();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(getProgress());
    }, 500);
    return () => clearInterval(timer);
  }, [getProgress]);

  const today = new Date().toISOString().split('T')[0];
  const todayLessonsCount = progress.completedLessons.length;
  const todayGoal = 3;
  const goalProgress = Math.min(todayLessonsCount, todayGoal);

  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    const dateStr = date.toISOString().split('T')[0];
    weekDays.push({
      date: dateStr,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: dateStr === today,
      isDone: false, // Simplified - in real app would track per day
    });
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#f1f5f9] mb-2">
            English Fluent 🇬🇧
          </h1>
          <p className="text-[#94a3b8]">Master English for Tech Workplace</p>
        </div>
        <Badge variant="accent" className="w-fit">
          Level {progress.level} - {getLevelName(progress.level)}
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm font-medium">Streak</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mt-1">
                {progress.streak}
              </p>
            </div>
            <Flame className="text-[#f59e0b]" size={24} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm font-medium">XP Points</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mt-1">
                {progress.xp}
              </p>
            </div>
            <Zap className="text-[#fbbf24]" size={24} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm font-medium">Level</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mt-1">
                {progress.level}
              </p>
            </div>
            <TrendingUp className="text-[#34d399]" size={24} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm font-medium">Lessons</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mt-1">
                {stats.totalLessons}
              </p>
            </div>
            <BookOpen className="text-[#60a5fa]" size={24} />
          </div>
        </Card>
      </div>

      {/* XP Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#f1f5f9] mb-4">Level Progress</h3>
        <XPBar
          current={xpProgress.current}
          total={xpProgress.total}
          level={progress.level}
        />
      </Card>

      {/* Today's Goal */}
      <Card className="p-6 bg-gradient-to-br from-[#1e3a8a]/30 to-[#10b981]/10 border-[#1e3a8a]/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#f1f5f9]">Today's Goal</h3>
          <Badge variant="primary">{goalProgress}/{todayGoal}</Badge>
        </div>
        <Progress value={goalProgress} max={todayGoal} label="Activities completed" />
        <div className="mt-4 flex gap-2 flex-wrap">
          {['Study Lesson', 'Play Game', 'AI Chat'].map((activity) => (
            <Badge key={activity} variant="secondary" className="text-xs">
              {activity}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/lessons">
          <Card className="p-6 card-hover h-full">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-[#f1f5f9] mb-2">Today's Lesson</h4>
                <p className="text-[#94a3b8] text-sm mb-4">
                  Week {Math.ceil((progress.completedLessons.length + 1) / 6)}, Day{' '}
                  {((progress.completedLessons.length % 6) + 1)}
                </p>
                <Button variant="primary" size="sm">
                  Start Lesson <ChevronRight size={16} />
                </Button>
              </div>
              <span className="text-4xl">📚</span>
            </div>
          </Card>
        </Link>

        <Link to="/games">
          <Card className="p-6 card-hover h-full">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-[#f1f5f9] mb-2">Practice Games</h4>
                <p className="text-[#94a3b8] text-sm mb-4">Flashcard, Matching, Quiz</p>
                <Button variant="primary" size="sm">
                  Play Now <ChevronRight size={16} />
                </Button>
              </div>
              <span className="text-4xl">🎮</span>
            </div>
          </Card>
        </Link>

        <Link to="/chat">
          <Card className="p-6 card-hover h-full">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-[#f1f5f9] mb-2">AI Coach Chat</h4>
                <p className="text-[#94a3b8] text-sm mb-4">Practice with Alex</p>
                <Button variant="primary" size="sm">
                  Chat Now <ChevronRight size={16} />
                </Button>
              </div>
              <span className="text-4xl">💬</span>
            </div>
          </Card>
        </Link>

        <Link to="/progress">
          <Card className="p-6 card-hover h-full">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-[#f1f5f9] mb-2">Review Progress</h4>
                <p className="text-[#94a3b8] text-sm mb-4">Stats & Achievements</p>
                <Button variant="primary" size="sm">
                  View <ChevronRight size={16} />
                </Button>
              </div>
              <span className="text-4xl">📊</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Weekly Calendar */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#f1f5f9] mb-4">Your Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day.date} className="text-center">
              <p className="text-xs text-[#94a3b8] mb-2 font-medium">{day.day}</p>
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center font-semibold transition-all ${
                  day.isToday
                    ? 'bg-[#10b981] text-white'
                    : day.isDone
                      ? 'bg-[#10b981]/30 text-[#34d399]'
                      : 'bg-[#334155] text-[#94a3b8]'
                }`}
              >
                {day.isDone ? '✓' : day.isToday ? '🎯' : day.date.slice(-2)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Badges */}
      {progress.badges.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#f1f5f9] mb-4">Recent Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {progress.badges.slice(-4).map((badge) => (
              <div key={badge} className="bg-[#334155] rounded-lg p-4 text-center">
                <p className="text-3xl mb-2">🏆</p>
                <p className="text-xs text-[#94a3b8] font-medium">{badge}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
