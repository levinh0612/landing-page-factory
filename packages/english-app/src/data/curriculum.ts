export interface Vocabulary {
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  category: string;
}

export interface LessonData {
  week: number;
  day: number;
  title: string;
  vocabulary: Vocabulary[];
  dialog: string;
  quizQuestions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const generateQuizQuestions = (vocab: Vocabulary[]): QuizQuestion[] => {
  return [
    {
      id: 'q1',
      question: `What does "${vocab[0].word}" mean?`,
      options: [vocab[0].meaning, 'Something else', 'Another thing', 'Not sure'],
      correct: 0,
      explanation: `${vocab[0].word} (${vocab[0].pronunciation}) means "${vocab[0].meaning}" in Vietnamese.`,
    },
    {
      id: 'q2',
      question: `What does "${vocab[1].word}" mean?`,
      options: ['Wrong option', vocab[1].meaning, 'Another wrong', 'Nope'],
      correct: 1,
      explanation: `${vocab[1].word} (${vocab[1].pronunciation}) means "${vocab[1].meaning}" in Vietnamese.`,
    },
    {
      id: 'q3',
      question: `What does "${vocab[2].word}" mean?`,
      options: ['Not it', 'Still no', vocab[2].meaning, 'Wrong'],
      correct: 2,
      explanation: `${vocab[2].word} (${vocab[2].pronunciation}) means "${vocab[2].meaning}" in Vietnamese.`,
    },
    {
      id: 'q4',
      question: `What does "${vocab[3].word}" mean?`,
      options: [vocab[3].meaning, 'Incorrect', 'Nope', 'Try again'],
      correct: 0,
      explanation: `${vocab[3].word} (${vocab[3].pronunciation}) means "${vocab[3].meaning}" in Vietnamese.`,
    },
    {
      id: 'q5',
      question: `What does "${vocab[4].word}" mean?`,
      options: ['Wrong', 'Not correct', 'Another wrong', vocab[4].meaning],
      correct: 3,
      explanation: `${vocab[4].word} (${vocab[4].pronunciation}) means "${vocab[4].meaning}" in Vietnamese.`,
    },
  ];
};

export const curriculum: LessonData[] = [
  {
    week: 1,
    day: 1,
    title: 'Developer Greetings & Standup Basics',
    vocabulary: [
      {
        word: 'deploy',
        pronunciation: 'dɪˈplɔɪ',
        meaning: 'triển khai (code lên production)',
        example: 'We need to deploy the new feature to production today.',
        category: 'DevOps',
      },
      {
        word: 'repository',
        pronunciation: 'rɪˈpɒzɪtri',
        meaning: 'kho lưu trữ code',
        example: 'Please push your changes to the repository.',
        category: 'Git',
      },
      {
        word: 'pull request',
        pronunciation: 'pʊl rɪˈkwest',
        meaning: 'yêu cầu hợp nhất code',
        example: 'Can you review my pull request before the standup?',
        category: 'Git',
      },
      {
        word: 'sprint',
        pronunciation: 'sprɪnt',
        meaning: 'chu kỳ phát triển (thường 2 tuần)',
        example: 'We have 5 tasks left in this sprint.',
        category: 'Agile',
      },
      {
        word: 'blockers',
        pronunciation: 'ˈblɒkəz',
        meaning: 'vấn đề cản trở tiến độ',
        example: 'Do you have any blockers I should know about?',
        category: 'Agile',
      },
      {
        word: 'standup',
        pronunciation: 'ˈstændʌp',
        meaning: 'họp đứng hàng ngày',
        example: 'The standup meeting starts at 9 AM.',
        category: 'Agile',
      },
      {
        word: 'refactor',
        pronunciation: 'riːˈfæktə',
        meaning: 'tái cấu trúc code để tốt hơn',
        example: 'I\'ll refactor this function to make it cleaner.',
        category: 'Backend',
      },
      {
        word: 'debug',
        pronunciation: 'diːˈbʌɡ',
        meaning: 'tìm và sửa lỗi',
        example: 'I\'m debugging the login issue right now.',
        category: 'General',
      },
    ],
    dialog: `Alice: Good morning, team! Let's start our standup.
Bob: Hi! Yesterday I fixed the bug in the payment module. Today I'll work on the API integration.
Alice: Great! Any blockers?
Bob: Not yet, but I might need help with the database query later.
Carol: I'm working on refactoring the authentication system. I'll need the specs from the design team.
Alice: Thanks everyone. Let's keep the momentum!`,
  },
  {
    week: 1,
    day: 2,
    title: 'Code Review & Technical Feedback',
    vocabulary: [
      {
        word: 'merge',
        pronunciation: 'mɜːdʒ',
        meaning: 'ghép/hợp nhất code',
        example: 'We can merge this PR once all tests pass.',
        category: 'Git',
      },
      {
        word: 'commit',
        pronunciation: 'kəˈmɪt',
        meaning: 'lưu thay đổi vào version control',
        example: 'Make sure to commit your changes with a clear message.',
        category: 'Git',
      },
      {
        word: 'branch',
        pronunciation: 'brɑːntʃ',
        meaning: 'nhánh code để phát triển riêng',
        example: 'Create a new branch for this feature.',
        category: 'Git',
      },
      {
        word: 'conflict',
        pronunciation: 'ˈkɒnflɪkt',
        meaning: 'xung đột (khi merge code)',
        example: 'There\'s a merge conflict in the config file.',
        category: 'Git',
      },
      {
        word: 'rebase',
        pronunciation: 'riːˈbeɪs',
        meaning: 'làm sạch lịch sử commit',
        example: 'Please rebase your branch before merging.',
        category: 'Git',
      },
      {
        word: 'code review',
        pronunciation: 'koʊd rɪˈvjuː',
        meaning: 'kiểm tra code của người khác',
        example: 'Code review is essential for quality assurance.',
        category: 'General',
      },
      {
        word: 'regression',
        pronunciation: 'rɪˈɡreʃən',
        meaning: 'lỗi do thay đổi mới gây ra',
        example: 'We found a regression in the login feature.',
        category: 'QA',
      },
      {
        word: 'regression test',
        pronunciation: 'rɪˈɡreʃən test',
        meaning: 'test lại những tính năng cũ',
        example: 'Run regression tests before deployment.',
        category: 'QA',
      },
    ],
    dialog: `Dev Lead: I've reviewed your PR. Nice work overall!
Junior Dev: Thanks! Are there any issues?
Dev Lead: Just a few things. Can you simplify this function? It's doing too much.
Junior Dev: Sure, I can refactor it. Anything else?
Dev Lead: Also, we need more tests. Coverage is only 60%.
Junior Dev: Got it. I'll add unit tests for edge cases.
Dev Lead: Perfect. Once you fix these, I'll merge it.`,
  },
  {
    week: 1,
    day: 3,
    title: 'Daily Standup Communication',
    vocabulary: [
      {
        word: 'status',
        pronunciation: 'ˈsteɪtəs',
        meaning: 'tình trạng, trạng thái',
        example: 'What\'s the status of the mobile app release?',
        category: 'General',
      },
      {
        word: 'progress',
        pronunciation: 'ˈprɒɡres',
        meaning: 'sự tiến triển, tiến độ',
        example: 'We\'re making good progress on the backend API.',
        category: 'General',
      },
      {
        word: 'on track',
        pronunciation: 'ɒn træk',
        meaning: 'đúng tiến độ',
        example: 'The project is on track for launch next month.',
        category: 'General',
      },
      {
        word: 'on hold',
        pronunciation: 'ɒn hoʊld',
        meaning: 'tạm dừng, chờ đợi',
        example: 'The feature request is on hold until we finish the refactoring.',
        category: 'General',
      },
      {
        word: 'rollback',
        pronunciation: 'ˈroʊlbæk',
        meaning: 'hoàn nguyên, quay lại version cũ',
        example: 'We had to rollback the deployment due to bugs.',
        category: 'DevOps',
      },
      {
        word: 'hotfix',
        pronunciation: 'ˈhɒtfɪks',
        meaning: 'sửa lỗi khẩn cấp trên production',
        example: 'We need a hotfix for the critical security issue.',
        category: 'DevOps',
      },
      {
        word: 'pipeline',
        pronunciation: 'ˈpaɪplaɪn',
        meaning: 'quy trình CI/CD tự động',
        example: 'The pipeline is failing on the integration tests.',
        category: 'DevOps',
      },
      {
        word: 'milestone',
        pronunciation: 'ˈmaɪlstoʊn',
        meaning: 'mốc quan trọng, dấu mốc',
        example: 'We\'ve reached a major milestone with the beta release.',
        category: 'Project',
      },
    ],
    dialog: `Manager: Good morning! Let's go around the table.
Alice: Yesterday I completed the user auth system. Today I'll integrate it with the database.
Bob: I'm working on the payment gateway. Still debugging some API issues.
Manager: Any blockers, Bob?
Bob: The documentation is unclear, but I'll figure it out.
Carol: I'm on track with the design mockups. Should be done by Friday.
Manager: Great! Let's keep the momentum.`,
  },
  {
    week: 1,
    day: 4,
    title: 'Technical Terminology Essentials',
    vocabulary: [
      {
        word: 'API',
        pronunciation: 'ˌeɪ piː ˈaɪ',
        meaning: 'giao diện lập trình ứng dụng',
        example: 'The REST API handles all data requests from the frontend.',
        category: 'Backend',
      },
      {
        word: 'endpoint',
        pronunciation: 'ˈendpɔɪnt',
        meaning: 'điểm cuối của một API',
        example: '/api/users is one of our key endpoints.',
        category: 'Backend',
      },
      {
        word: 'database',
        pronunciation: 'ˈdeɪtəbeɪs',
        meaning: 'kho dữ liệu',
        example: 'We store all user data in the PostgreSQL database.',
        category: 'Backend',
      },
      {
        word: 'query',
        pronunciation: 'ˈkwɪri',
        meaning: 'truy vấn dữ liệu',
        example: 'Write an efficient SQL query to fetch user information.',
        category: 'Backend',
      },
      {
        word: 'schema',
        pronunciation: 'ˈskiːmə',
        meaning: 'cấu trúc của database',
        example: 'The database schema defines all tables and relationships.',
        category: 'Backend',
      },
      {
        word: 'migration',
        pronunciation: 'maɪˈɡreɪʃən',
        meaning: 'thay đổi cấu trúc database',
        example: 'Run the migration to add the new users table.',
        category: 'Backend',
      },
      {
        word: 'cache',
        pronunciation: 'kæʃ',
        meaning: 'lưu trữ tạm để tăng tốc độ',
        example: 'We use Redis cache to improve API response time.',
        category: 'Backend',
      },
      {
        word: 'queue',
        pronunciation: 'kjuː',
        meaning: 'hàng đợi, xử lý tuần tự',
        example: 'Background jobs are processed via a message queue.',
        category: 'Backend',
      },
    ],
    dialog: `Architect: Let me explain our system design.
Engineer: Sure, I'm ready to learn.
Architect: We have a REST API with multiple endpoints. Data flows through our PostgreSQL database.
Engineer: How do we handle large data requests?
Architect: We use caching with Redis and implement pagination. Also, expensive queries run as background jobs in our queue.
Engineer: That makes sense. When can we deploy?
Architect: After the database migration completes and all tests pass.`,
  },
  {
    week: 1,
    day: 5,
    title: 'Email Communication Fundamentals',
    vocabulary: [
      {
        word: 'urgent',
        pronunciation: 'ˈɜːrdʒənt',
        meaning: 'khẩn cấp, cần xử lý ngay',
        example: 'This is an urgent matter that requires your attention.',
        category: 'Soft Skills',
      },
      {
        word: 'deadline',
        pronunciation: 'ˈdedlaɪn',
        meaning: 'thời hạn cuối cùng',
        example: 'The deadline for the project is next Friday.',
        category: 'Project',
      },
      {
        word: 'regarding',
        pronunciation: 'rɪˈɡɑːrdɪŋ',
        meaning: 'về (vấn đề nào đó)',
        example: 'Regarding your previous email, I have some feedback.',
        category: 'Soft Skills',
      },
      {
        word: 'clarify',
        pronunciation: 'ˈklærɪfaɪ',
        meaning: 'làm rõ, giải thích chi tiết',
        example: 'Can you clarify the requirements for this task?',
        category: 'Soft Skills',
      },
      {
        word: 'feedback',
        pronunciation: 'ˈfiːdbæk',
        meaning: 'phản hồi, ý kiến góp ý',
        example: 'I\'d appreciate your feedback on my presentation.',
        category: 'Soft Skills',
      },
      {
        word: 'summary',
        pronunciation: 'ˈsʌməri',
        meaning: 'tóm tắt, bản tóm lược',
        example: 'Here\'s a quick summary of our meeting.',
        category: 'Soft Skills',
      },
      {
        word: 'efficient',
        pronunciation: 'ɪˈfɪʃənt',
        meaning: 'hiệu quả, nhanh chóng',
        example: 'We need a more efficient solution to this problem.',
        category: 'General',
      },
      {
        word: 'review',
        pronunciation: 'rɪˈvjuː',
        meaning: 'xem xét, kiểm tra',
        example: 'Please review this document and provide your comments.',
        category: 'General',
      },
    ],
    dialog: `CEO: Hi team, I'm sending an important email.
Writer: What should I include?
CEO: Start with the deadline - next Friday. Then explain why it's urgent.
Writer: Should I ask for feedback?
CEO: Yes. Request feedback by EOD Thursday. Keep it concise - one page maximum.
Writer: Any specific format?
CEO: Use bullet points for the action items. And end with a clear summary.`,
  },
  {
    week: 1,
    day: 6,
    title: 'Meeting Preparation & Participation',
    vocabulary: [
      {
        word: 'agenda',
        pronunciation: 'əˈdʒendə',
        meaning: 'chương trình họp',
        example: 'The meeting agenda includes three main topics.',
        category: 'Soft Skills',
      },
      {
        word: 'participant',
        pronunciation: 'pɑːrˈtɪsɪpənt',
        meaning: 'người tham gia',
        example: 'All project participants must attend the kick-off meeting.',
        category: 'Soft Skills',
      },
      {
        word: 'objective',
        pronunciation: 'əbˈdʒektɪv',
        meaning: 'mục tiêu',
        example: 'The main objective of this meeting is to align on priorities.',
        category: 'Project',
      },
      {
        word: 'action item',
        pronunciation: 'ˈækʃən ˈaɪtəm',
        meaning: 'nhiệm vụ cần thực hiện',
        example: 'Let\'s document all action items before we leave.',
        category: 'Project',
      },
      {
        word: 'follow-up',
        pronunciation: 'ˈfɒloʊ ʌp',
        meaning: 'tiếp theo, theo dõi',
        example: 'I\'ll send a follow-up email with the meeting notes.',
        category: 'Soft Skills',
      },
      {
        word: 'attendance',
        pronunciation: 'əˈtendəns',
        meaning: 'sự tham dự',
        example: 'Your attendance at the team meeting is required.',
        category: 'General',
      },
      {
        word: 'defer',
        pronunciation: 'dɪˈfɜːr',
        meaning: 'hoãn lại, trì hoãn',
        example: 'We should defer this discussion to next week.',
        category: 'Soft Skills',
      },
      {
        word: 'sync',
        pronunciation: 'sɪŋk',
        meaning: 'họp để cập nhật thông tin',
        example: 'Let\'s schedule a quick sync with the design team.',
        category: 'Soft Skills',
      },
    ],
    dialog: `Manager: I'm preparing the agenda for our sprint review.
Assistant: What topics should we include?
Manager: First, we'll review completed items. Then discuss blockers and risks.
Assistant: Who should attend?
Manager: Everyone on the core team. The objective is alignment before we start the next sprint.
Assistant: Should we plan action items?
Manager: Yes! That's crucial. We'll assign owners and set deadlines during the meeting.`,
  },
  {
    week: 2,
    day: 1,
    title: 'Frontend Development Vocabulary',
    vocabulary: [
      {
        word: 'component',
        pronunciation: 'kəmˈpoʊnənt',
        meaning: 'thành phần UI (React, Vue, etc)',
        example: 'Build reusable components to maintain code consistency.',
        category: 'Frontend',
      },
      {
        word: 'props',
        pronunciation: 'prɑːps',
        meaning: 'thuộc tính truyền vào component',
        example: 'Pass the user data as props to the UserCard component.',
        category: 'Frontend',
      },
      {
        word: 'state',
        pronunciation: 'steɪt',
        meaning: 'trạng thái của component',
        example: 'Update the component state when the user clicks the button.',
        category: 'Frontend',
      },
      {
        word: 'render',
        pronunciation: 'ˈrendər',
        meaning: 'vẽ/hiển thị UI',
        example: 'React re-renders the component when the state changes.',
        category: 'Frontend',
      },
      {
        word: 'hook',
        pronunciation: 'hʊk',
        meaning: 'hàm đặc biệt trong React',
        example: 'Use the useState hook to manage component state.',
        category: 'Frontend',
      },
      {
        word: 'event listener',
        pronunciation: 'ɪˈvent ˈlɪsənər',
        meaning: 'lắng nghe sự kiện từ người dùng',
        example: 'Add an event listener to detect button clicks.',
        category: 'Frontend',
      },
      {
        word: 'DOM',
        pronunciation: 'ˌdiː oʊ ˈem',
        meaning: 'Document Object Model',
        example: 'Manipulate the DOM to dynamically update the page.',
        category: 'Frontend',
      },
      {
        word: 'CSS',
        pronunciation: 'ˌsiː ɛs ˈɛs',
        meaning: 'Cascading Style Sheets',
        example: 'Use CSS Grid for responsive layouts.',
        category: 'Frontend',
      },
    ],
    dialog: `Senior Dev: Let's discuss component architecture.
Junior Dev: Sure! How should I structure the components?
Senior Dev: Make each component responsible for one thing. Use props to pass data down.
Junior Dev: What about state management?
Senior Dev: For simple state, use hooks like useState. For complex state, consider Redux or Zustand.
Junior Dev: When should I re-render?
Senior Dev: React handles that automatically. Just update state when you need changes.`,
  },
  {
    week: 2,
    day: 2,
    title: 'Backend Architecture Discussion',
    vocabulary: [
      {
        word: 'controller',
        pronunciation: 'kənˈtroʊlər',
        meaning: 'xử lý request HTTP',
        example: 'The UserController handles all user-related API requests.',
        category: 'Backend',
      },
      {
        word: 'service',
        pronunciation: 'ˈsɜːrvɪs',
        meaning: 'lớp chứa business logic',
        example: 'Move the calculation logic to the UserService.',
        category: 'Backend',
      },
      {
        word: 'middleware',
        pronunciation: 'ˈmɪdəlwɛər',
        meaning: 'xử lý request trước khi đến controller',
        example: 'Add authentication middleware to protected routes.',
        category: 'Backend',
      },
      {
        word: 'validation',
        pronunciation: 'vælɪˈdeɪʃən',
        meaning: 'kiểm tra dữ liệu hợp lệ',
        example: 'Implement request validation to prevent invalid data.',
        category: 'Backend',
      },
      {
        word: 'error handling',
        pronunciation: 'ˈɛrər ˈhændlɪŋ',
        meaning: 'xử lý lỗi',
        example: 'Add proper error handling with meaningful messages.',
        category: 'Backend',
      },
      {
        word: 'logging',
        pronunciation: 'ˈlɑːɡɪŋ',
        meaning: 'ghi lại thông tin để debug',
        example: 'Add logging to track API requests and responses.',
        category: 'Backend',
      },
      {
        word: 'ORM',
        pronunciation: 'ˌoʊ ɑːr ˈem',
        meaning: 'Object-Relational Mapping (Prisma, Sequelize)',
        example: 'Use an ORM to simplify database queries.',
        category: 'Backend',
      },
      {
        word: 'transaction',
        pronunciation: 'trænˈzækʃən',
        meaning: 'nhóm các thao tác database',
        example: 'Wrap multiple queries in a transaction for data consistency.',
        category: 'Backend',
      },
    ],
    dialog: `Architect: Let's review the backend structure.
Backend Dev: I'm using controllers and services. Is that good?
Architect: Perfect! That separates concerns well. Always validate input in the controller.
Backend Dev: What about error handling?
Architect: Use middleware for common errors. Log everything for debugging.
Backend Dev: Should I use an ORM?
Architect: Yes. Prisma or Sequelize. They handle SQL injection protection too.`,
  },
  {
    week: 2,
    day: 3,
    title: 'Testing & Quality Assurance',
    vocabulary: [
      {
        word: 'unit test',
        pronunciation: 'ˈjuːnɪt test',
        meaning: 'test từng hàm/module riêng lẻ',
        example: 'Write unit tests for every function in the service.',
        category: 'QA',
      },
      {
        word: 'integration test',
        pronunciation: 'ˌɪntɪˈɡreɪʃən test',
        meaning: 'test các module hoạt động cùng nhau',
        example: 'Integration tests verify the API works with the database.',
        category: 'QA',
      },
      {
        word: 'coverage',
        pronunciation: 'ˈkʌvərɪdʒ',
        meaning: 'phần trăm code được test',
        example: 'Aim for at least 80% code coverage.',
        category: 'QA',
      },
      {
        word: 'mock',
        pronunciation: 'mɑːk',
        meaning: 'giả lập/tạo giả dữ liệu',
        example: 'Mock the API responses for unit tests.',
        category: 'QA',
      },
      {
        word: 'stub',
        pronunciation: 'stʌb',
        meaning: 'thay thế một hàm bằng phiên bản đơn giản',
        example: 'Stub the database calls to speed up tests.',
        category: 'QA',
      },
      {
        word: 'edge case',
        pronunciation: 'ɛdʒ keɪs',
        meaning: 'trường hợp ranh giới/đặc biệt',
        example: 'Test edge cases like empty arrays and null values.',
        category: 'QA',
      },
      {
        word: 'assertion',
        pronunciation: 'əˈsɜːrʃən',
        meaning: 'khẳng định trong test',
        example: 'Add assertions to check expected values.',
        category: 'QA',
      },
      {
        word: 'bug',
        pronunciation: 'bʌɡ',
        meaning: 'lỗi/vấn đề trong code',
        example: 'We found a critical bug in the payment system.',
        category: 'General',
      },
    ],
    dialog: `QA Lead: Let's talk about our testing strategy.
Dev: We have some unit tests. Is that enough?
QA Lead: No. We need unit, integration, and end-to-end tests.
Dev: How do we achieve high coverage?
QA Lead: Test all branches and edge cases. Use mocks for external dependencies.
Dev: What's our coverage target?
QA Lead: At least 80%. And all tests must pass before deployment.`,
  },
  {
    week: 2,
    day: 4,
    title: 'Database Concepts & Optimization',
    vocabulary: [
      {
        word: 'index',
        pronunciation: 'ˈɪndeks',
        meaning: 'tạo chỉ mục để tăng tốc độ truy vấn',
        example: 'Create an index on the email column for faster lookups.',
        category: 'Backend',
      },
      {
        word: 'join',
        pronunciation: 'dʒɔɪn',
        meaning: 'nối nhiều bảng để lấy dữ liệu liên quan',
        example: 'Use a JOIN to get user data along with their posts.',
        category: 'Backend',
      },
      {
        word: 'aggregate',
        pronunciation: 'ˈæɡrɪɡeɪt',
        meaning: 'tính tổng, đếm, lấy giá trị cao nhất/thấp nhất',
        example: 'Aggregate the sales data to generate reports.',
        category: 'Backend',
      },
      {
        word: 'primary key',
        pronunciation: 'ˈpraɪmeri kiː',
        meaning: 'khóa chính - định danh duy nhất',
        example: 'The user ID is the primary key for the users table.',
        category: 'Backend',
      },
      {
        word: 'foreign key',
        pronunciation: 'ˈfɔːrən kiː',
        meaning: 'khóa ngoại - tham chiếu đến bảng khác',
        example: 'The post table has a foreign key to the users table.',
        category: 'Backend',
      },
      {
        word: 'constraint',
        pronunciation: 'kənˈstreɪnt',
        meaning: 'quy tắc ràng buộc dữ liệu',
        example: 'Add a unique constraint to prevent duplicate emails.',
        category: 'Backend',
      },
      {
        word: 'normalize',
        pronunciation: 'ˈnɔːrmələɪz',
        meaning: 'tổ chức dữ liệu để loại bỏ trùng lặp',
        example: 'Normalize the database schema to improve efficiency.',
        category: 'Backend',
      },
      {
        word: 'backup',
        pronunciation: 'ˈbækʌp',
        meaning: 'sao lưu dữ liệu',
        example: 'Perform daily backups to prevent data loss.',
        category: 'DevOps',
      },
    ],
    dialog: `DBA: Let's optimize the database performance.
Developer: What should we do?
DBA: First, identify slow queries. Use EXPLAIN to analyze them.
Developer: Then what?
DBA: Add indexes to frequently searched columns. Use proper joins instead of multiple queries.
Developer: How do we ensure data integrity?
DBA: Set up constraints and foreign keys. And always maintain backups.`,
  },
  {
    week: 2,
    day: 5,
    title: 'Security & Best Practices',
    vocabulary: [
      {
        word: 'authentication',
        pronunciation: 'ɔːˌθɛntɪˈkeɪʃən',
        meaning: 'xác thực danh tính',
        example: 'Implement JWT authentication for API security.',
        category: 'Security',
      },
      {
        word: 'authorization',
        pronunciation: 'ˌɔːθərɪˈzeɪʃən',
        meaning: 'kiểm tra quyền truy cập',
        example: 'Check authorization before allowing user actions.',
        category: 'Security',
      },
      {
        word: 'encryption',
        pronunciation: 'ɪnˈkrɪpʃən',
        meaning: 'mã hóa dữ liệu',
        example: 'Always encrypt sensitive data like passwords.',
        category: 'Security',
      },
      {
        word: 'vulnerability',
        pronunciation: 'ˌvʌlnərəˈbɪləti',
        meaning: 'lỗ hổng bảo mật',
        example: 'Conduct security audits to find vulnerabilities.',
        category: 'Security',
      },
      {
        word: 'SQL injection',
        pronunciation: 'ˌɛs kjuː ˈɛl ɪnˈdʒɛkʃən',
        meaning: 'tấn công bằng cách chèn mã SQL',
        example: 'Always use parameterized queries to prevent SQL injection.',
        category: 'Security',
      },
      {
        word: 'XSS',
        pronunciation: 'ˌɛks ɛs ˈɛs',
        meaning: 'Cross-Site Scripting - tấn công web',
        example: 'Sanitize user input to prevent XSS attacks.',
        category: 'Security',
      },
      {
        word: 'CORS',
        pronunciation: 'ˌsiː ɔːr ˈɛs',
        meaning: 'Cross-Origin Resource Sharing',
        example: 'Configure CORS to allow requests from your frontend domain.',
        category: 'Security',
      },
      {
        word: 'rate limiting',
        pronunciation: 'reɪt ˈlɪmɪtɪŋ',
        meaning: 'giới hạn số lượng request',
        example: 'Implement rate limiting to prevent API abuse.',
        category: 'Security',
      },
    ],
    dialog: `Security Officer: Let's review our security practices.
Team: What are the main concerns?
Security Officer: Authentication is good. But check for SQL injection vulnerabilities.
Team: We use an ORM, so we should be safe, right?
Security Officer: Mostly. But always validate user input. Also, enable CORS properly.
Team: What about sensitive data?
Security Officer: Encrypt passwords and tokens. Use HTTPS for all communications.`,
  },
  {
    week: 2,
    day: 6,
    title: 'Performance & Scalability Discussions',
    vocabulary: [
      {
        word: 'performance',
        pronunciation: 'pərˈfɔːrməns',
        meaning: 'hiệu năng, tốc độ',
        example: 'We improved performance by 40% after optimization.',
        category: 'General',
      },
      {
        word: 'scalability',
        pronunciation: 'ˌskeɪləˈbɪləti',
        meaning: 'khả năng mở rộng',
        example: 'Our system is designed for scalability to handle growth.',
        category: 'General',
      },
      {
        word: 'load balancer',
        pronunciation: 'loʊd ˈbælənsər',
        meaning: 'phân phối traffic đến nhiều server',
        example: 'Use a load balancer to distribute incoming requests.',
        category: 'DevOps',
      },
      {
        word: 'latency',
        pronunciation: 'ˈleɪtənsi',
        meaning: 'độ trễ, thời gian chờ',
        example: 'Our API latency is under 200ms.',
        category: 'General',
      },
      {
        word: 'throughput',
        pronunciation: 'ˈθruːpʊt',
        meaning: 'lượng dữ liệu xử lý trong một khoảng thời gian',
        example: 'We need to increase throughput to handle more users.',
        category: 'General',
      },
      {
        word: 'bottleneck',
        pronunciation: 'ˈbɑːtəlnɛk',
        meaning: 'điểm hẹp gây chậm hệ thống',
        example: 'The database query is a major bottleneck.',
        category: 'General',
      },
      {
        word: 'profiling',
        pronunciation: 'ˈproʊfaɪlɪŋ',
        meaning: 'phân tích hiệu năng code',
        example: 'Use profiling tools to identify slow functions.',
        category: 'Backend',
      },
      {
        word: 'async',
        pronunciation: 'ˈeɪsɪŋk',
        meaning: 'thực hiện không đồng bộ',
        example: 'Use async/await for non-blocking operations.',
        category: 'Backend',
      },
    ],
    dialog: `Ops Lead: We're getting slow response times.
Dev: What's causing it?
Ops Lead: Database queries are taking too long. Let's profile the code.
Dev: Should we add caching?
Ops Lead: Yes. And consider load balancing. Also, use async operations for heavy tasks.
Dev: When do we scale?
Ops Lead: When throughput increases. We'll add more servers behind a load balancer.`,
  },
];
