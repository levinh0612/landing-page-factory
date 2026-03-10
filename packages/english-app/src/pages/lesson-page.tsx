import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubtopic } from '@/data/topics';
import { VocabCard } from '@/components/VocabCard';
import { useProgress } from '@/hooks/useProgress';
import { BottomNav } from '@/components/BottomNav';

type LessonStep = 'vocab' | 'quiz';

export function LessonPage() {
  const { topicId, subtopicId } = useParams<{
    topicId: string;
    subtopicId: string;
  }>();
  const navigate = useNavigate();
  const { addXP, completeLesson } = useProgress();

  const [currentStep, setCurrentStep] = useState<LessonStep>('vocab');
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const subtopic = topicId && subtopicId ? getSubtopic(topicId, subtopicId) : null;
  const vocabulary = subtopic?.vocabulary || [];

  if (!subtopic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <p className="text-[#94a3b8]">Không tìm thấy bài học</p>
      </div>
    );
  }

  const handleNextVocab = () => {
    if (currentVocabIndex < vocabulary.length - 1) {
      setCurrentVocabIndex(currentVocabIndex + 1);
    } else {
      setCurrentStep('quiz');
    }
  };

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: answer,
    });
  };

  const handleSubmitQuiz = () => {
    if (!topicId || !subtopicId) return;

    // Simple scoring: check if answers match vocab index
    let score = 0;
    const quizQuestions = generateQuizQuestions();

    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) {
        score++;
      }
    });

    setQuizScore(score);
    const xpEarned = score * 10;
    addXP(xpEarned);
    completeLesson();
  };

  const generateQuizQuestions = () => {
    const questions = [];

    // Question 1: Match meaning
    questions.push({
      type: 'multiple_choice',
      question: `"${vocabulary[0].word}" có nghĩa là gì?`,
      options: [
        vocabulary[0].meaning,
        vocabulary[1]?.meaning || 'không biết',
        vocabulary[2]?.meaning || 'không biết',
      ],
      correct: vocabulary[0].meaning,
    });

    // Question 2: Fill in blank
    questions.push({
      type: 'multiple_choice',
      question: `Hoàn thành: "${vocabulary[1]?.example || ''}"`,
      options: [vocabulary[1]?.word, vocabulary[0].word, vocabulary[2]?.word],
      correct: vocabulary[1]?.word,
    });

    // Question 3: Match meaning
    questions.push({
      type: 'multiple_choice',
      question: `"${vocabulary[2]?.word}" là từ gì?`,
      options: [
        vocabulary[2]?.meaning,
        vocabulary[0].meaning,
        vocabulary[1]?.meaning,
      ],
      correct: vocabulary[2]?.meaning,
    });

    // Question 4: Definition
    questions.push({
      type: 'multiple_choice',
      question: `Từ nào có nghĩa là "${vocabulary[3]?.meaning || 'phức tạp'}"?`,
      options: [vocabulary[3]?.word, vocabulary[0].word, vocabulary[1]?.word],
      correct: vocabulary[3]?.word,
    });

    // Question 5: Example
    questions.push({
      type: 'multiple_choice',
      question: `Đây là ví dụ của từ nào: "${vocabulary[4]?.example || ''}"?`,
      options: [vocabulary[4]?.word, vocabulary[1]?.word, vocabulary[2]?.word],
      correct: vocabulary[4]?.word,
    });

    return questions;
  };

  const quizQuestions = generateQuizQuestions();

  if (currentStep === 'vocab') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] px-4 py-6">
        <div className="mb-6 w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold text-[#f1f5f9]">
            {subtopic.name}
          </h2>
          <p className="mt-2 text-[#94a3b8]">
            Học các từ mới
          </p>
        </div>

        <div className="mb-12 w-full max-w-sm">
          <VocabCard
            vocab={vocabulary[currentVocabIndex]}
            index={currentVocabIndex}
            total={vocabulary.length}
            onSwipeRight={handleNextVocab}
            onSwipeLeft={handleNextVocab}
          />
        </div>

        <div className="flex w-full max-w-sm gap-3">
          <button
            onClick={() => setCurrentVocabIndex(Math.max(0, currentVocabIndex - 1))}
            disabled={currentVocabIndex === 0}
            className="flex-1 rounded-lg bg-[#334155] px-4 py-3 font-semibold text-[#f1f5f9] disabled:opacity-50 hover:bg-[#475569] transition-colors"
          >
            ← Trước
          </button>
          <button
            onClick={handleNextVocab}
            className="flex-1 rounded-lg bg-[#10b981] px-4 py-3 font-semibold text-white hover:bg-[#059669] transition-colors"
          >
            {currentVocabIndex === vocabulary.length - 1
              ? 'Làm Quiz →'
              : 'Tiếp →'}
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  if (quizScore !== null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] px-4 py-6 pb-24">
        <div className="w-full max-w-sm rounded-2xl border border-[#1f2d40] bg-[#1e293b] p-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#f1f5f9]">
            Kết quả 🎉
          </h2>
          <div className="mb-6 inline-block text-6xl font-bold text-[#10b981]">
            {quizScore}/{quizQuestions.length}
          </div>
          <p className="mb-6 text-[#94a3b8]">
            Bạn đã kiếm {quizScore * 10} XP!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/learn')}
              className="btn-primary w-full"
            >
              Tiếp tục học →
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary w-full"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 py-6 pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#f1f5f9]">
            Quiz: {subtopic.name}
          </h2>
          <p className="mt-2 text-[#94a3b8]">
            {Object.keys(quizAnswers).length} / {quizQuestions.length} trả lời
          </p>
        </div>

        <div className="space-y-6">
          {quizQuestions.map((question, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#1f2d40] bg-[#1e293b] p-6"
            >
              <h3 className="mb-4 font-semibold text-[#f1f5f9]">
                {idx + 1}. {question.question}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleQuizAnswer(idx, option)}
                    className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors ${
                      quizAnswers[idx] === option
                        ? 'border border-[#10b981] bg-[#10b981]/20 text-[#10b981]'
                        : 'border border-[#1f2d40] bg-[#0f172a] text-[#cbd5e1] hover:border-[#10b981]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmitQuiz}
          disabled={Object.keys(quizAnswers).length < quizQuestions.length}
          className="btn-primary mt-6 w-full disabled:opacity-50"
        >
          Nộp bài
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
