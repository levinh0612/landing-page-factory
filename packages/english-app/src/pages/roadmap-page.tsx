import { useProgress } from '@/hooks/useProgress';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check } from 'lucide-react';

const phases = [
  {
    phase: 1,
    title: 'Foundations',
    weeks: '1-6',
    description: 'Basic tech vocabulary, greetings, standup meetings',
    lessons: [
      'Developer Greetings & Standup',
      'Code Review & Feedback',
      'Daily Standup Communication',
      'Technical Terminology',
      'Email Communication',
      'Meeting Participation',
    ],
    color: 'from-blue-500/20 to-blue-500/5',
    borderColor: 'border-blue-500/30',
  },
  {
    phase: 2,
    title: 'Workplace English',
    weeks: '7-12',
    description: 'Code review, emails, team communication',
    lessons: [
      'Frontend Development Vocabulary',
      'Backend Architecture',
      'Testing & QA',
      'Database Concepts',
      'Security & Best Practices',
      'Performance & Scalability',
    ],
    color: 'from-emerald-500/20 to-emerald-500/5',
    borderColor: 'border-emerald-500/30',
  },
  {
    phase: 3,
    title: 'Technical Discussion',
    weeks: '13-18',
    description: 'Architecture talks, presentations, documentation',
    lessons: [
      'System Design Fundamentals',
      'Presentation Skills',
      'Technical Documentation',
      'Research & Innovation',
      'Problem Solving Communication',
      'Cross-team Collaboration',
    ],
    color: 'from-purple-500/20 to-purple-500/5',
    borderColor: 'border-purple-500/30',
  },
  {
    phase: 4,
    title: 'Professional Fluency',
    weeks: '19-24',
    description: 'Interviews, leadership, negotiations',
    lessons: [
      'Interview Excellence',
      'Leadership Communication',
      'Negotiation Skills',
      'Mentoring & Teaching',
      'Strategic Thinking',
      'Executive Communication',
    ],
    color: 'from-orange-500/20 to-orange-500/5',
    borderColor: 'border-orange-500/30',
  },
];

export const RoadmapPage = () => {
  const { getProgress } = useProgress();
  const progress = getProgress();
  const completedLessons = progress.completedLessons.length;
  const currentWeek = Math.ceil((completedLessons + 1) / 6);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-[#f1f5f9] mb-2">24-Week Roadmap</h1>
        <p className="text-[#94a3b8]">Your journey to English mastery in tech</p>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 bg-gradient-to-r from-[#10b981]/10 to-[#34d399]/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#f1f5f9]">Overall Progress</h3>
          <Badge variant="success">{completedLessons} / 24 Complete</Badge>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#334155]">
          <div
            className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all duration-500"
            style={{ width: `${(completedLessons / 24) * 100}%` }}
          />
        </div>
        <p className="text-sm text-[#94a3b8] mt-3">
          {completedLessons === 0
            ? 'Ready to start your journey?'
            : completedLessons < 6
              ? 'Keep going! You\'re building strong foundations.'
              : completedLessons < 12
                ? 'Great progress! Moving into workplace communication.'
                : completedLessons < 18
                  ? 'Excellent! Now mastering technical discussions.'
                  : 'Almost there! Final sprint to professional fluency.'}
        </p>
      </Card>

      {/* Phases Timeline */}
      <div className="space-y-6">
        {phases.map((phaseData) => {
          const phaseStart = (phaseData.phase - 1) * 6 + 1;
          const phaseEnd = phaseData.phase * 6;
          const isCurrentPhase = currentWeek >= phaseStart && currentWeek <= phaseEnd;
          const isCompletedPhase = completedLessons >= phaseEnd;

          return (
            <Card
              key={phaseData.phase}
              className={`p-6 transition-all duration-300 ${
                isCurrentPhase
                  ? `bg-gradient-to-br ${phaseData.color} border-2 ${phaseData.borderColor}`
                  : ''
              } ${isCompletedPhase ? 'opacity-75' : ''}`}
            >
              {/* Phase Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-[#f1f5f9]">
                      Phase {phaseData.phase}: {phaseData.title}
                    </h2>
                    {isCompletedPhase && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Check size={14} /> Completed
                      </Badge>
                    )}
                    {isCurrentPhase && (
                      <Badge variant="primary" className="animate-pulse">
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <p className="text-[#94a3b8] text-sm mb-2">{phaseData.description}</p>
                  <p className="text-[#94a3b8] text-xs">Weeks {phaseData.weeks}</p>
                </div>
              </div>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {phaseData.lessons.map((lesson, idx) => {
                  const lessonNumber = (phaseData.phase - 1) * 6 + idx + 1;
                  const isCompleted = completedLessons >= lessonNumber;

                  return (
                    <div
                      key={lesson}
                      className={clsx(
                        'p-4 rounded-lg border transition-all duration-200',
                        isCompleted
                          ? 'bg-[#10b981]/20 border-[#10b981]/50'
                          : 'bg-[#334155]/40 border-[#475569]',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={clsx(
                            'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm',
                            isCompleted
                              ? 'bg-[#10b981] text-white'
                              : 'bg-[#475569] text-[#94a3b8]',
                          )}
                        >
                          {isCompleted ? '✓' : lessonNumber}
                        </div>
                        <p className={clsx('text-sm', isCompleted ? 'text-[#34d399]' : 'text-[#cbd5e1]')}>
                          {lesson}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Phase Stats */}
              <div className="mt-6 grid grid-cols-3 gap-3 pt-6 border-t border-[#475569]">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#34d399]">{phaseData.lessons.length}</p>
                  <p className="text-xs text-[#94a3b8] mt-1">Lessons</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#fbbf24]">
                    {phaseData.lessons.length * 8}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-1">Vocabulary</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#60a5fa]">
                    +{phaseData.lessons.length * 50}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-1">XP</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Milestone Info */}
      <Card className="p-6 bg-[#1e3a8a]/20 border-[#1e3a8a]/30">
        <h3 className="text-lg font-semibold text-[#60a5fa] mb-3">Unlock Certificate</h3>
        <p className="text-[#cbd5e1] mb-4">
          Complete all 24 weeks to earn your "English Fluent" certificate and unlock exclusive
          interview preparation materials.
        </p>
        <div className="flex items-center gap-4">
          <div className="text-4xl">🎓</div>
          <div className="text-sm text-[#94a3b8]">
            {completedLessons === 24
              ? '✓ You are eligible for your certificate!'
              : `${24 - completedLessons} lessons remaining`}
          </div>
        </div>
      </Card>
    </div>
  );
};

import { clsx } from 'clsx';
