import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { curriculum } from '@/data/curriculum';
import { useProgress } from '@/hooks/useProgress';
import { useSpeech } from '@/hooks/useSpeech';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Volume2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { clsx } from 'clsx';

export const LessonPage = () => {
  const { week, day } = useParams<{ week: string; day: string }>();
  const navigate = useNavigate();
  const { completeLesson, getProgress } = useProgress();
  const { speak, startListening, isListening } = useSpeech();

  const lesson = curriculum.find((l) => l.week === parseInt(week!) && l.day === parseInt(day!));
  const [activeTab, setActiveTab] = useState<'vocab' | 'dialog' | 'quiz'>('vocab');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showQuizResult, setShowQuizResult] = useState(false);

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-[#94a3b8] mb-4">Lesson not found</p>
          <Button onClick={() => navigate('/lessons')}>Back to Lessons</Button>
        </Card>
      </div>
    );
  }

  const handleComplete = () => {
    completeLesson(lesson.week, lesson.day);
    const progress = getProgress();
    const nextDay = lesson.day + 1;

    if (nextDay <= 6) {
      navigate(`/lesson/${lesson.week}/${nextDay}`);
    } else if (lesson.week < 4) {
      navigate(`/lesson/${lesson.week + 1}/1`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    setShowQuizResult(true);
  };

  const quizQuestions = lesson.quizQuestions || [];
  const correctAnswers =
    quizSubmitted && quizQuestions
      ? quizQuestions.filter((q) => quizAnswers[q.id] === q.correct).length
      : 0;
  const quizScore = Math.round((correctAnswers / quizQuestions.length) * 100);

  const tabs = [
    { id: 'vocab', label: '📚 Vocabulary', icon: null },
    { id: 'dialog', label: '💬 Dialog', icon: null },
    { id: 'quiz', label: '🧠 Quiz', icon: null },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Badge variant="secondary" className="mb-2">
            Week {lesson.week}, Day {lesson.day}
          </Badge>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">{lesson.title}</h1>
        </div>
        <div className="text-4xl">🎓</div>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#cbd5e1]">Lesson Progress</span>
          <span className="text-sm text-[#94a3b8]">{activeTab === 'vocab' ? '1' : activeTab === 'dialog' ? '2' : '3'} / 3</span>
        </div>
        <Progress value={activeTab === 'vocab' ? 1 : activeTab === 'dialog' ? 2 : 3} max={3} showLabel={false} />
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#475569]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id !== 'quiz') {
                setShowQuizResult(false);
              }
            }}
            className={clsx(
              'px-4 py-3 font-medium transition-all border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-[#10b981] text-[#34d399]'
                : 'border-transparent text-[#94a3b8] hover:text-[#cbd5e1]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {/* Vocabulary Tab */}
        {activeTab === 'vocab' && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {lesson.vocabulary.map((word) => (
                <Card key={word.word} className="p-4 sm:p-6 card-hover">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-[#f1f5f9] mb-1">{word.word}</h3>
                      <p className="text-sm text-[#94a3b8] font-mono">{word.pronunciation}</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => speak(word.word)}
                      className="flex-shrink-0"
                    >
                      <Volume2 size={18} />
                    </Button>
                  </div>

                  <Badge variant="secondary" className="mb-3">
                    {word.category}
                  </Badge>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-[#cbd5e1] mb-1">Vietnamese</p>
                      <p className="text-[#f1f5f9]">{word.meaning}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#cbd5e1] mb-1">Example</p>
                      <p className="text-[#cbd5e1] italic">"{word.example}"</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="primary" onClick={() => setActiveTab('dialog')} className="w-full">
              Next: Dialog <ChevronRight size={18} />
            </Button>
          </div>
        )}

        {/* Dialog Tab */}
        {activeTab === 'dialog' && (
          <div className="space-y-4">
            <Card className="p-6 bg-[#1e3a8a]/20 border-[#1e3a8a]/30">
              <h3 className="text-lg font-semibold text-[#60a5fa] mb-4">Dialogue</h3>
              <div className="space-y-3">
                {lesson.dialog.split('\n').map((line, idx) => {
                  const [speaker, text] = line.split(':');
                  const isEven = idx % 2 === 0;

                  return (
                    <div key={idx} className={clsx('flex', isEven && 'justify-start', !isEven && 'justify-end')}>
                      <div
                        className={clsx(
                          'max-w-xs px-4 py-2 rounded-lg',
                          isEven
                            ? 'bg-[#334155] text-[#f1f5f9]'
                            : 'bg-[#10b981]/30 text-[#34d399] border border-[#10b981]/50',
                        )}
                      >
                        <p className="text-xs font-bold mb-1">{speaker?.trim()}</p>
                        <p className="text-sm">{text?.trim()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                variant="secondary"
                onClick={() => speak(lesson.dialog.replace(/\w+:\s*/g, ''))}
                className="mt-6 w-full"
              >
                <Volume2 size={18} /> Listen to Dialog
              </Button>
            </Card>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setActiveTab('vocab')} className="flex-1">
                <ChevronLeft size={18} /> Back
              </Button>
              <Button variant="primary" onClick={() => setActiveTab('quiz')} className="flex-1">
                Quiz <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            {!showQuizResult ? (
              <>
                {quizQuestions.map((question) => (
                  <Card key={question.id} className="p-6">
                    <h4 className="text-lg font-semibold text-[#f1f5f9] mb-4">{question.question}</h4>
                    <div className="space-y-2">
                      {question.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            setQuizAnswers((prev) => ({ ...prev, [question.id]: idx }))
                          }
                          disabled={quizSubmitted}
                          className={clsx(
                            'w-full p-3 rounded-lg text-left transition-all border',
                            quizSubmitted
                              ? idx === question.correct
                                ? 'bg-[#10b981]/20 border-[#10b981]/50'
                                : quizAnswers[question.id] === idx
                                  ? 'bg-[#dc2626]/20 border-[#dc2626]/50'
                                  : 'bg-[#334155] border-[#475569]'
                              : quizAnswers[question.id] === idx
                                ? 'bg-[#10b981]/30 border-[#10b981]'
                                : 'bg-[#334155] border-[#475569] hover:border-[#64748b]',
                            quizSubmitted && 'cursor-default',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={clsx(
                                'w-5 h-5 rounded border flex items-center justify-center',
                                quizAnswers[question.id] === idx
                                  ? 'bg-[#10b981] border-[#10b981]'
                                  : 'border-[#64748b]',
                              )}
                            >
                              {quizAnswers[question.id] === idx && <Check size={16} />}
                            </div>
                            <span className="text-[#f1f5f9]">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                ))}

                <Button
                  variant="primary"
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="w-full"
                >
                  Check Answers
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <Card className="p-8 text-center bg-gradient-to-br from-[#10b981]/20 to-[#34d399]/10 border-[#10b981]/30">
                  <div className="text-6xl mb-4">
                    {quizScore === 100 ? '🎉' : quizScore >= 80 ? '⭐' : '💪'}
                  </div>
                  <h3 className="text-3xl font-bold text-[#f1f5f9] mb-2">{quizScore}%</h3>
                  <p className="text-[#94a3b8] mb-4">
                    {quizScore === 100
                      ? 'Perfect! You mastered this lesson!'
                      : quizScore >= 80
                        ? 'Great job! You got most answers right!'
                        : 'Good effort! Review the vocabulary and try again.'}
                  </p>
                  <Badge variant="success">
                    {correctAnswers} / {quizQuestions.length} Correct
                  </Badge>
                </Card>

                {quizQuestions.map((question) => (
                  <Card
                    key={question.id}
                    className={clsx(
                      'p-4',
                      quizAnswers[question.id] === question.correct
                        ? 'bg-[#10b981]/10 border-[#10b981]/30'
                        : 'bg-[#dc2626]/10 border-[#dc2626]/30',
                    )}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {quizAnswers[question.id] === question.correct ? (
                        <Check size={20} className="text-[#10b981] flex-shrink-0 mt-0.5" />
                      ) : (
                        <span className="text-[#dc2626] flex-shrink-0 text-lg">✕</span>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-[#f1f5f9] mb-1">{question.question}</p>
                        <p className="text-sm text-[#cbd5e1] mb-2">{question.explanation}</p>
                      </div>
                    </div>
                  </Card>
                ))}

                <Button variant="primary" onClick={handleComplete} className="w-full">
                  Complete Lesson & Earn 50 XP
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
