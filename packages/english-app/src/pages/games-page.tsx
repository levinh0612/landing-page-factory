import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProgress } from '@/hooks/useProgress';
import { Zap, Trophy, RotateCcw } from 'lucide-react';
import { curriculum } from '@/data/curriculum';
import { clsx } from 'clsx';

type GameType = 'flashcard' | 'fill-blank' | 'match' | 'speedquiz' | null;

export const GamesPage = () => {
  const { addGameScore, getProgress } = useProgress();
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [gameState, setGameState] = useState<any>({});
  const progress = getProgress();

  const allVocab = curriculum.slice(0, 4).flatMap((lesson) => lesson.vocabulary);

  // Flashcard Game
  const FlashcardGame = () => {
    const [index, setIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [score, setScore] = useState(0);
    const [gameCards, setGameCards] = useState(
      allVocab.slice(0, 10).map((v) => ({ ...v, known: null as boolean | null })),
    );

    const current = gameCards[index];

    const handleKnow = () => {
      const updated = [...gameCards];
      updated[index].known = true;
      setGameCards(updated);
      setScore(score + 10);

      if (index < gameCards.length - 1) {
        setIndex(index + 1);
        setIsFlipped(false);
      } else {
        addGameScore('flashcard', score + 10);
      }
    };

    const handleDontKnow = () => {
      const updated = [...gameCards];
      updated[index].known = false;
      setGameCards(updated);

      if (index < gameCards.length - 1) {
        setIndex(index + 1);
        setIsFlipped(false);
      } else {
        addGameScore('flashcard', score);
      }
    };

    if (index >= gameCards.length) {
      return (
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h3 className="text-3xl font-bold text-[#f1f5f9]">Game Complete!</h3>
          <p className="text-[#94a3b8]">Score: {score} points</p>
          <Button variant="primary" onClick={() => setActiveGame(null)}>
            Back to Games
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-[#94a3b8]">
            Card {index + 1} / {gameCards.length}
          </span>
          <Badge variant="accent">Score: {score}</Badge>
        </div>

        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="h-80 cursor-pointer perspective"
        >
          <Card
            className={clsx(
              'h-full p-6 flex items-center justify-center transition-transform duration-300 transform',
              isFlipped && 'scale-x-[-1]',
            )}
          >
            <div className="text-center">
              {!isFlipped ? (
                <div>
                  <p className="text-[#94a3b8] text-sm mb-2">English</p>
                  <p className="text-4xl font-bold text-[#f1f5f9]">{current.word}</p>
                </div>
              ) : (
                <div>
                  <p className="text-[#94a3b8] text-sm mb-2">Vietnamese</p>
                  <p className="text-3xl font-bold text-[#34d399]">{current.meaning}</p>
                  <p className="text-sm text-[#94a3b8] mt-4">"{current.example}"</p>
                </div>
              )}
              <p className="text-xs text-[#64748b] mt-8">Click to flip</p>
            </div>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleDontKnow} className="flex-1">
            Don't Know
          </Button>
          <Button variant="primary" onClick={handleKnow} className="flex-1">
            I Know This
          </Button>
        </div>
      </div>
    );
  };

  // Speed Quiz Game
  const SpeedQuizGame = () => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [currentQ, setCurrentQ] = useState(0);
    const [gameActive, setGameActive] = useState(true);

    const questions = allVocab.slice(0, 15).map((v) => ({
      question: `What does "${v.word}" mean?`,
      correct: v.meaning,
      options: [
        v.meaning,
        allVocab[Math.floor(Math.random() * allVocab.length)].meaning,
        allVocab[Math.floor(Math.random() * allVocab.length)].meaning,
      ].sort(() => Math.random() - 0.5),
    }));

    if (!gameActive) {
      return (
        <div className="text-center space-y-4">
          <div className="text-6xl">⏱️</div>
          <h3 className="text-3xl font-bold text-[#f1f5f9]">Time's Up!</h3>
          <p className="text-[#94a3b8]">Final Score: {score} points</p>
          <Button variant="primary" onClick={() => setActiveGame(null)}>
            Back to Games
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-3xl font-bold text-[#f59e0b]">{timeLeft}s</div>
          <Badge variant="accent">Score: {score}</Badge>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#f1f5f9] mb-4">
            {questions[currentQ].question}
          </h3>
          <div className="space-y-2">
            {questions[currentQ].options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  if (option === questions[currentQ].correct) {
                    setScore(score + 10);
                  }
                  if (currentQ < questions.length - 1) {
                    setCurrentQ(currentQ + 1);
                  } else {
                    setGameActive(false);
                    addGameScore('speedquiz', score + (option === questions[currentQ].correct ? 10 : 0));
                  }
                }}
                className="w-full p-3 rounded-lg bg-[#334155] text-[#f1f5f9] hover:bg-[#10b981]/30 transition-all border border-[#475569]"
              >
                {option}
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const games = [
    {
      id: 'flashcard',
      title: 'Flashcard',
      description: 'Flip cards to learn vocabulary',
      icon: '🎴',
      color: 'from-blue-500/20',
    },
    {
      id: 'fill-blank',
      title: 'Fill in the Blank',
      description: 'Complete sentences with missing words',
      icon: '✏️',
      color: 'from-purple-500/20',
    },
    {
      id: 'match',
      title: 'Word Match',
      description: 'Match English words to Vietnamese meanings',
      icon: '🎯',
      color: 'from-emerald-500/20',
    },
    {
      id: 'speedquiz',
      title: 'Speed Quiz',
      description: '60 seconds to answer as many questions as possible',
      icon: '⚡',
      color: 'from-orange-500/20',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#f1f5f9] mb-2">Practice Games</h1>
        <p className="text-[#94a3b8]">Make learning fun while earning XP</p>
      </div>

      {activeGame ? (
        <Card className="p-6 sm:p-8">
          <button
            onClick={() => setActiveGame(null)}
            className="mb-6 text-[#94a3b8] hover:text-[#f1f5f9] text-sm font-medium flex items-center gap-1"
          >
            ← Back
          </button>

          {activeGame === 'flashcard' && <FlashcardGame />}
          {activeGame === 'speedquiz' && <SpeedQuizGame />}
          {activeGame !== 'flashcard' && activeGame !== 'speedquiz' && (
            <div className="text-center py-8">
              <p className="text-[#94a3b8]">Coming soon! Try Flashcard or Speed Quiz for now.</p>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {games.map((game) => (
            <Card
              key={game.id}
              className={clsx(
                'p-6 card-hover cursor-pointer bg-gradient-to-br',
                game.color,
                'to-transparent',
              )}
              onClick={() => setActiveGame(game.id as GameType)}
            >
              <div className="text-4xl mb-3">{game.icon}</div>
              <h3 className="text-lg font-semibold text-[#f1f5f9] mb-1">{game.title}</h3>
              <p className="text-[#94a3b8] text-sm mb-4">{game.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="primary">+20-40 XP</Badge>
                <span className="text-[#34d399]">Play →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* High Scores */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-[#f59e0b]" /> Your Best Scores
        </h3>
        <div className="space-y-2">
          {Object.entries(progress.gameScores).length > 0 ? (
            Object.entries(progress.gameScores).map(([game, score]) => (
              <div key={game} className="flex justify-between items-center p-3 bg-[#334155] rounded-lg">
                <span className="text-[#f1f5f9]">{game}</span>
                <Badge variant="accent">{score} points</Badge>
              </div>
            ))
          ) : (
            <p className="text-[#94a3b8] text-center py-4">
              Play games to see your high scores here
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
