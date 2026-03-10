export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string;
  completedLessons: string[];
  badges: string[];
  chatHistory: ChatMessage[];
  gameScores: Record<string, number>;
  userName: string;
}

const STORAGE_KEY = 'ef_progress';
const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  badges: [],
  chatHistory: [],
  gameScores: {},
  userName: 'Fullstack Developer',
};

const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3000,
  5: 6000,
  6: 10000,
  7: 15000,
};

const BADGES = {
  'first-lesson': { name: 'First Step', description: 'Complete your first lesson', icon: '👶' },
  '7-day-streak': { name: '🔥 7-Day Streak', description: 'Study for 7 consecutive days', icon: '🔥' },
  '14-day-streak': { name: '🔥 14-Day Streak', description: 'Study for 14 consecutive days', icon: '🔥' },
  '100-words': { name: '📚 100 Words', description: 'Learn 100 vocabulary words', icon: '📚' },
  '250-words': { name: '📚 250 Words', description: 'Learn 250 vocabulary words', icon: '📚' },
  'level-5': { name: '⭐ Level 5', description: 'Reach level 5', icon: '⭐' },
  'level-7': { name: '🏆 Fluent', description: 'Reach level 7 - Fluent', icon: '🏆' },
  'quiz-master': { name: '🧠 Quiz Master', description: 'Score 100% on 5 quizzes', icon: '🧠' },
  'game-champion': { name: '🎮 Game Champion', description: 'Score 1000+ in any game', icon: '🎮' },
  'chatbot-friend': { name: '💬 Chatbot Friend', description: 'Have 50+ messages in chat', icon: '💬' },
  'phase-1': { name: '🎓 Phase 1 Complete', description: 'Complete Foundations phase', icon: '🎓' },
  'phase-2': { name: '💼 Phase 2 Complete', description: 'Complete Workplace English phase', icon: '💼' },
  'phase-3': { name: '🎤 Phase 3 Complete', description: 'Complete Technical Discussion phase', icon: '🎤' },
  'phase-4': { name: '🌟 English Fluent', description: 'Complete Professional Fluency phase', icon: '🌟' },
};

export const useProgress = () => {
  const getProgress = (): UserProgress => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PROGRESS;
    }
    return JSON.parse(stored);
  };

  const saveProgress = (progress: UserProgress): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  };

  const addXP = (amount: number): UserProgress => {
    const progress = getProgress();
    progress.xp += amount;

    // Check for level up
    for (let level = 7; level >= 1; level--) {
      if (progress.xp >= LEVEL_THRESHOLDS[level]) {
        progress.level = level;
        break;
      }
    }

    saveProgress(progress);
    return progress;
  };

  const completeLesson = (week: number, day: number): UserProgress => {
    const progress = getProgress();
    const lessonId = `w${week}d${day}`;

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      addXP(50);

      // Check first lesson badge
      if (progress.completedLessons.length === 1) {
        earnBadge('first-lesson');
      }

      // Check phase completion badges
      if (progress.completedLessons.length === 6) {
        earnBadge('phase-1');
      }
      if (progress.completedLessons.length === 12) {
        earnBadge('phase-2');
      }
      if (progress.completedLessons.length === 18) {
        earnBadge('phase-3');
      }
      if (progress.completedLessons.length === 24) {
        earnBadge('phase-4');
      }
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (progress.lastStudyDate === today) {
      // Already studied today
    } else if (progress.lastStudyDate === yesterday) {
      // Streak continues
      progress.streak += 1;
      if (progress.streak === 7) {
        earnBadge('7-day-streak');
      }
      if (progress.streak === 14) {
        earnBadge('14-day-streak');
      }
    } else {
      // Streak broken
      progress.streak = 1;
    }

    progress.lastStudyDate = today;
    saveProgress(progress);
    return progress;
  };

  const earnBadge = (badgeId: string): UserProgress => {
    const progress = getProgress();
    if (!progress.badges.includes(badgeId)) {
      progress.badges.push(badgeId);
      saveProgress(progress);
    }
    return progress;
  };

  const getLevelFromXP = (xp: number): number => {
    for (let level = 7; level >= 1; level--) {
      if (xp >= LEVEL_THRESHOLDS[level]) {
        return level;
      }
    }
    return 1;
  };

  const getLevelName = (level: number): string => {
    const names = [
      'Beginner',
      'Elementary',
      'Pre-Intermediate',
      'Intermediate',
      'Upper-Intermediate',
      'Advanced',
      'Fluent',
    ];
    return names[level - 1] || 'Beginner';
  };

  const getXPForNextLevel = (): number => {
    const progress = getProgress();
    const nextLevel = progress.level + 1;
    if (nextLevel > 7) return LEVEL_THRESHOLDS[7];
    return LEVEL_THRESHOLDS[nextLevel];
  };

  const getXPProgressToNextLevel = (): { current: number; total: number } => {
    const progress = getProgress();
    const currentLevelXP = LEVEL_THRESHOLDS[progress.level];
    const nextLevelXP = getXPForNextLevel();
    return {
      current: progress.xp - currentLevelXP,
      total: nextLevelXP - currentLevelXP,
    };
  };

  const addGameScore = (gameName: string, score: number): UserProgress => {
    const progress = getProgress();
    const currentBest = progress.gameScores[gameName] || 0;
    if (score > currentBest) {
      progress.gameScores[gameName] = score;
      if (score >= 1000) {
        earnBadge('game-champion');
      }
      saveProgress(progress);
    }
    return progress;
  };

  const addChatMessage = (message: ChatMessage): UserProgress => {
    const progress = getProgress();
    progress.chatHistory.push(message);
    // Keep only last 50 messages
    if (progress.chatHistory.length > 50) {
      progress.chatHistory = progress.chatHistory.slice(-50);
    }
    if (progress.chatHistory.length === 50) {
      earnBadge('chatbot-friend');
    }
    saveProgress(progress);
    return progress;
  };

  const getBadgeInfo = (badgeId: string) => {
    return (BADGES as Record<string, any>)[badgeId] || null;
  };

  const getAllBadges = () => {
    return Object.entries(BADGES).map(([id, badge]) => ({ id, ...badge }));
  };

  const getStudyStats = () => {
    const progress = getProgress();
    const totalWords = progress.completedLessons.length * 8; // 8 words per lesson
    const estimatedHours = progress.xp / 50; // Rough estimate

    return {
      totalLessons: progress.completedLessons.length,
      totalWords,
      estimatedHours: Math.round(estimatedHours * 10) / 10,
      totalBadges: progress.badges.length,
    };
  };

  return {
    getProgress,
    saveProgress,
    addXP,
    completeLesson,
    earnBadge,
    getLevelFromXP,
    getLevelName,
    getXPForNextLevel,
    getXPProgressToNextLevel,
    addGameScore,
    addChatMessage,
    getBadgeInfo,
    getAllBadges,
    getStudyStats,
  };
};
