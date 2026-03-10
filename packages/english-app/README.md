# English Fluent - English Learning Web App

A comprehensive English learning application designed specifically for Vietnamese fullstack developers to master workplace English. The app provides structured lessons, interactive games, AI-powered coaching, and progress tracking across 24 weeks of learning.

## Features

### 📚 Core Learning Pages

#### 1. **Dashboard** (`/`)
- Quick overview of learning stats (Streak, XP, Level, Lessons)
- Today's goal tracking with progress bar
- Quick action cards to start lessons, games, chat, or review progress
- Weekly calendar showing study activity
- Recent badges earned

#### 2. **Roadmap** (`/roadmap`)
- 24-week learning journey divided into 4 phases:
  - **Phase 1 (Weeks 1-6)**: Foundations - Basic tech vocabulary, greetings, standup
  - **Phase 2 (Weeks 7-12)**: Workplace English - Code review, emails, team communication
  - **Phase 3 (Weeks 13-18)**: Technical Discussion - Architecture, presentations, documentation
  - **Phase 4 (Weeks 19-24)**: Professional Fluency - Interviews, leadership, negotiations
- Visual timeline showing completed/current/upcoming weeks
- XP rewards per phase

#### 3. **Lessons** (`/lessons`)
- Browse all 24 lessons organized by week and phase
- Lock/unlock system (must complete previous lesson first)
- Progress indicator showing completion status
- Each lesson shows word count and current phase

#### 4. **Lesson Detail** (`/lesson/:week/:day`)
3-part interactive lesson structure:
- **Vocabulary**: 8-10 words with pronunciation, meaning, category, and example sentences
  - Text-to-speech button for pronunciation practice (Web Speech API)
  - Category badges (Frontend, Backend, DevOps, Agile, Git, etc.)
- **Dialog**: Realistic conversation samples with native speakers
  - Click to listen to full dialog
  - Shows speaker roles and natural English dialogue
- **Quiz**: 5 multiple-choice questions on learned vocabulary
  - Instant feedback on answers
  - Detailed explanations for corrections
  - 50 XP reward on completion

#### 5. **Games** (`/games`)
Interactive games to reinforce learning:
- **Flashcard Game** 🎴
  - Flip cards to reveal meanings
  - Mark words as known/unknown
  - Earns XP based on performance
- **Speed Quiz** ⚡
  - 60-second rapid-fire quiz format
  - Multiple choice questions
  - High score tracking
- **Fill in the Blank** (Coming soon)
  - Complete sentences with missing tech words
- **Word Match** (Coming soon)
  - Match English words to Vietnamese meanings

#### 6. **AI Chat** (`/chat`)
- Chat with "Alex" - an AI English coach powered by Claude
- Real-time conversation for practice
- Quick prompt suggestions:
  - "Correct my grammar"
  - "Explain this word"
  - "Practice standup meeting"
  - "Help with email"
  - "Mock interview question"
  - "Code review tips"
- Voice input support (Web Speech Recognition API)
- Chat history saved locally (last 50 messages)

#### 7. **Progress** (`/progress`)
Comprehensive analytics dashboard:
- Total stats: XP, Level, Lessons completed, Badges earned
- Weekly XP bar chart showing study activity
- Skills breakdown with progress bars:
  - Vocabulary
  - Listening
  - Speaking
  - Grammar
- Badge collection gallery (locked/unlocked)
- Learning milestones tracker

#### 8. **Certificate** (`/certificate`)
- Digital certificate of achievement
- Unlocked after completing Phase 1 (6 lessons)
- Shows phase completion and XP earned
- Customizable student name
- Print/PDF export functionality
- Share to LinkedIn, Twitter, or email

### 🎮 Game Features
- Flashcard game with flip animation
- Speed quiz with 60-second timer
- High score tracking per game
- XP rewards for game completion (20-40 XP per game)

### 📊 Progress Tracking
- **XP System**: Earn points for lessons, games, and chat practice
- **7 Levels**: Beginner → Elementary → Pre-Intermediate → Intermediate → Upper-Intermediate → Advanced → Fluent
- **Streaks**: Maintain daily study streak (🔥 badge at 7 & 14 days)
- **Badges**: 14+ achievement badges including:
  - First Lesson
  - 7-Day & 14-Day Streaks
  - 100 & 250 Words Learned
  - Level 5 & 7 Achievements
  - Quiz Master, Game Champion
  - Phase Completions (1-4)

### 💾 Data Persistence
- All progress saved to browser localStorage
- Chat history persisted (last 50 messages)
- Game high scores tracked
- User preferences and settings

### 🎨 Design Features
- **Dark/Light Theme Ready**: Default dark theme (navy/emerald/gold color scheme)
- **Fully Responsive**: Mobile-first design, works perfectly on all screens
- **Smooth Animations**: Transitions for cards, progress bars, and UI elements
- **Accessibility**: WCAG compliant color contrasts and keyboard navigation

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with @tailwindcss/vite plugin
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Speech APIs**: Web Speech API (recognition & synthesis)
- **Backend**: Express.js (Chat only)
- **AI**: Anthropic Claude API

## Project Structure

```
packages/english-app/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Main layout wrapper
│   │   │   └── Sidebar.tsx         # Navigation sidebar
│   │   └── ui/
│   │       ├── Card.tsx            # Reusable card component
│   │       ├── Badge.tsx           # Badge component
│   │       ├── Button.tsx          # Button component
│   │       ├── Progress.tsx        # Progress bar component
│   │       └── XPBar.tsx           # XP progress bar
│   ├── pages/
│   │   ├── dashboard-page.tsx      # Home dashboard
│   │   ├── roadmap-page.tsx        # 24-week roadmap
│   │   ├── lessons-page.tsx        # Lesson browser
│   │   ├── lesson-page.tsx         # Individual lesson (vocab/dialog/quiz)
│   │   ├── games-page.tsx          # Game selection & play
│   │   ├── chat-page.tsx           # AI coach chat
│   │   ├── progress-page.tsx       # Analytics & stats
│   │   └── certificate-page.tsx    # Achievement certificate
│   ├── hooks/
│   │   ├── useProgress.ts          # Progress state management
│   │   └── useSpeech.ts            # Web Speech API wrapper
│   ├── data/
│   │   └── curriculum.ts           # 24-week curriculum data
│   ├── App.tsx                     # Router setup
│   ├── main.tsx                    # React entry point
│   └── index.css                   # Global styles
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install -w packages/english-app
```

### 2. Start Development Server
```bash
npm run dev:english
# Or start all services with:
npm run dev
```

The English app will run on **http://localhost:5174**

### 3. API Configuration
The app proxies API requests to `http://localhost:5001` (main API).

Ensure the API is running with English chat support:
```bash
npm run dev:api
```

## Features in Detail

### Curriculum Data
- **12 weeks of full data** (240+ vocabulary words)
- **Structured lessons** with:
  - 8-10 vocabulary words per lesson
  - Realistic workplace dialogs
  - 5 quiz questions per lesson
  - Category tags (Frontend, Backend, DevOps, Agile, etc.)

### Progress Tracking
```typescript
UserProgress {
  xp: number;                    // Total experience points
  level: number;                 // Current level (1-7)
  streak: number;                // Daily study streak
  lastStudyDate: string;         // Last study date (YYYY-MM-DD)
  completedLessons: string[];    // "w1d1", "w1d2", etc.
  badges: string[];              // Achievement IDs
  chatHistory: ChatMessage[];    // Last 50 messages
  gameScores: Record<...>;       // Best game scores
  userName: string;              // User's display name
}
```

### Storage Keys
All data prefixed with `ef_`:
- `ef_progress` - Main progress object

### Backend Routes
```
POST /api/english/chat
Body: { messages: [{role, content}], systemContext?: string }
Response: { success: true, message: string }
```

## Customization

### Colors
Edit `src/index.css` CSS variables:
```css
:root {
  --primary: #10b981;          /* Emerald green for success */
  --accent: #f59e0b;           /* Amber for XP/streaks */
  --secondary: #1e3a8a;        /* Deep blue */
  --background: #0f172a;       /* Dark navy */
  --surface: #1e293b;          /* Surface color */
  /* ... more variables ... */
}
```

### Curriculum
Add more lessons to `src/data/curriculum.ts`:
```typescript
{
  week: 3,
  day: 1,
  title: "Your Lesson Title",
  vocabulary: [/* ... 8-10 words ... */],
  dialog: "Speaker1: ...\nSpeaker2: ...",
  quizQuestions: [/* ... 5 questions ... */]
}
```

### AI Coach Prompt
Customize Alex's personality in `packages/api/src/routes/english/english.controller.ts`:
```typescript
const DEFAULT_SYSTEM_PROMPT = `You are Alex, ...`;
```

## Known Limitations & Future Features

### Coming Soon
- Fill in the Blank game (backend processing)
- Word Match game (pair matching animation)
- Spaced repetition system
- Advanced analytics with charts
- Downloadable study materials
- Offline mode support
- Mobile app version

### Limitations
- Games save high scores only (not per-attempt stats)
- Chat uses token-limited Claude model
- No user authentication (localStorage only)
- Limited to 50 chat messages in history

## Performance Optimizations

- Code splitting via React Router
- Lazy loading for pages
- Memoized progress updates
- Efficient localStorage caching
- Optimized CSS with Tailwind
- No external CSS libraries except Tailwind

## Browser Compatibility

- **Chrome/Edge**: Full support ✓
- **Firefox**: Full support ✓
- **Safari**: Full support ✓
- **Mobile Browsers**: Full support ✓

Speech Recognition may not be available in all browsers - the app gracefully degrades.

## Development Notes

### Type Safety
- Full TypeScript with strict mode enabled
- No `any` types (uses proper interfaces)
- Type-safe component props
- Proper typing for React hooks

### Code Style
- Follows project conventions
- Uses Tailwind CSS utility classes
- Clsx for conditional classes
- React functional components with hooks

## Learning Path

### Beginner (Weeks 1-6)
Focus on foundational workplace English:
- Daily standup communication
- Basic technical vocabulary
- Email writing
- Code review participation

### Intermediate (Weeks 7-12)
Build professional communication skills:
- Frontend/backend terminology
- Testing & QA communication
- Database concepts
- Security discussion

### Advanced (Weeks 13-18)
Master technical discussions:
- System design conversations
- Architecture presentations
- Technical documentation
- Problem-solving communication

### Expert (Weeks 19-24)
Achieve professional fluency:
- Job interview excellence
- Leadership communication
- Negotiation skills
- Mentoring & teaching
- Executive communication

## Getting Help

- Check the dashboard for quick tips
- Use the AI coach (Chat page) for grammar help
- Review past lessons for reference
- Check progress page for skill analysis

## License

Part of the Landing Page Factory monorepo - Internal use only.
