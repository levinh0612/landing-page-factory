import { Link } from 'react-router-dom';
import { curriculum } from '@/data/curriculum';
import { useProgress } from '@/hooks/useProgress';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export const LessonsPage = () => {
  const { getProgress } = useProgress();
  const progress = getProgress();

  // Group lessons by week
  const lessonsByWeek = curriculum.reduce(
    (acc, lesson) => {
      const week = lesson.week;
      if (!acc[week]) acc[week] = [];
      acc[week].push(lesson);
      return acc;
    },
    {} as Record<number, typeof curriculum>,
  );

  const weeks = Object.keys(lessonsByWeek).map(Number).sort((a, b) => a - b);

  const getPhaseInfo = (week: number) => {
    if (week <= 6) return { phase: 1, title: 'Foundations', color: 'from-blue-500/20' };
    if (week <= 12) return { phase: 2, title: 'Workplace English', color: 'from-emerald-500/20' };
    if (week <= 18) return { phase: 3, title: 'Technical Discussion', color: 'from-purple-500/20' };
    return { phase: 4, title: 'Professional Fluency', color: 'from-orange-500/20' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#f1f5f9] mb-2">📚 Lessons</h1>
        <p className="text-[#94a3b8]">Master English for tech through structured lessons</p>
      </div>

      {/* Overall Progress */}
      <Card className="p-6 bg-gradient-to-r from-[#10b981]/10 to-[#34d399]/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#f1f5f9]">Overall Progress</h3>
          <Badge variant="success">{progress.completedLessons.length} / 24</Badge>
        </div>
        <div className="h-3 w-full bg-[#334155] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all duration-300"
            style={{ width: `${(progress.completedLessons.length / 24) * 100}%` }}
          />
        </div>
        <p className="text-sm text-[#94a3b8] mt-3">
          {progress.completedLessons.length === 0
            ? 'Start your first lesson to begin the journey!'
            : progress.completedLessons.length < 6
              ? `${6 - progress.completedLessons.length} lessons left in Phase 1`
              : `${24 - progress.completedLessons.length} lessons remaining`}
        </p>
      </Card>

      {/* Lessons by Phase */}
      {weeks.map((week) => {
        const phaseInfo = getPhaseInfo(week);
        const weekLessons = lessonsByWeek[week];
        const isCurrentWeek = Math.ceil((progress.completedLessons.length + 1) / 6) === week;

        return (
          <div key={week} className="space-y-3">
            {/* Week Header */}
            {week % 6 === 1 && (
              <div className="space-y-2 mb-4">
                <h2 className="text-2xl font-bold text-[#f1f5f9]">
                  Phase {phaseInfo.phase}: {phaseInfo.title}
                </h2>
                <p className="text-[#94a3b8]">
                  {phaseInfo.phase === 1
                    ? 'Basic tech vocabulary, greetings, standup meetings'
                    : phaseInfo.phase === 2
                      ? 'Code review, emails, team communication'
                      : phaseInfo.phase === 3
                        ? 'Architecture talks, presentations, documentation'
                        : 'Interviews, leadership, negotiations'}
                </p>
              </div>
            )}

            {/* Week Card */}
            <Card
              className={clsx(
                'p-4 sm:p-6 transition-all duration-200',
                isCurrentWeek && 'bg-gradient-to-br from-[#10b981]/20 to-transparent border-[#10b981]/30',
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#f1f5f9]">Week {week}</h3>
                  {isCurrentWeek && <Badge variant="primary">Currently Learning</Badge>}
                </div>
                <Badge variant="secondary">{weekLessons.length} Days</Badge>
              </div>

              {/* Lessons Grid */}
              <div className="space-y-2">
                {weekLessons.map((lesson) => {
                  const lessonId = `w${lesson.week}d${lesson.day}`;
                  const isCompleted = progress.completedLessons.includes(lessonId);
                  const isNext =
                    progress.completedLessons.length === 0 && lesson.week === 1 && lesson.day === 1
                      ? true
                      : !isCompleted &&
                          progress.completedLessons.includes(
                            `w${lesson.week}d${lesson.day - 1}` ||
                              `w${lesson.week - 1}d6`,
                          );

                  return (
                    <Link
                      key={lessonId}
                      to={
                        isCompleted || isNext || progress.completedLessons.length === 0
                          ? `/lesson/${lesson.week}/${lesson.day}`
                          : '#'
                      }
                    >
                      <div
                        className={clsx(
                          'p-4 rounded-lg border transition-all duration-200 flex items-start justify-between cursor-pointer',
                          isCompleted
                            ? 'bg-[#10b981]/20 border-[#10b981]/50'
                            : progress.completedLessons.length === 0 || isNext
                              ? 'bg-[#334155] border-[#475569] hover:border-[#10b981]'
                              : 'bg-[#1a1f2e] border-[#334155] opacity-50 cursor-not-allowed',
                        )}
                      >
                        <div className="flex-1">
                          <h4 className={clsx('font-medium', isCompleted ? 'text-[#34d399]' : 'text-[#f1f5f9]')}>
                            Day {lesson.day}: {lesson.title}
                          </h4>
                          <p className="text-xs text-[#94a3b8] mt-1">
                            {lesson.vocabulary.length} vocabulary words
                          </p>
                        </div>

                        <div className="flex-shrink-0 ml-4">
                          {isCompleted ? (
                            <div className="flex items-center gap-2">
                              <Check size={20} className="text-[#10b981]" />
                            </div>
                          ) : progress.completedLessons.length === 0 || isNext ? (
                            <ChevronRight size={20} className="text-[#94a3b8]" />
                          ) : (
                            <Lock size={20} className="text-[#64748b]" />
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
