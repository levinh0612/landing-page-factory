export interface Vocabulary {
  word: string;
  phonetics: string;
  meaning: string;
  example: string;
  category: string;
  type?: 'word' | 'phrase';
}

export interface Phrase {
  english: string;
  vietnamese: string;
  context: string;
  phonetics?: string;
}

export interface SubTopic {
  id: string;
  name: string;
  vocabulary: Vocabulary[];
  phrases: Phrase[];
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  color: string;
  subtopics: SubTopic[];
}

export const TOPICS: Record<string, Topic> = {
  tech: {
    id: 'tech',
    name: 'Lập Trình Viên',
    icon: '💻',
    color: '#6366f1',
    subtopics: [
      {
        id: 'standup',
        name: 'Daily Standup',
        vocabulary: [
          {
            word: 'blocker',
            phonetics: '/ˈblɒkər/',
            meaning: 'vấn đề cản trở',
            example: 'I have a blocker on the login API — need help from the backend team.',
            category: 'agile',
          },
          {
            word: 'deploy',
            phonetics: '/dɪˈplɔɪ/',
            meaning: 'triển khai',
            example: "We'll deploy the hotfix to production tonight.",
            category: 'devops',
          },
          {
            word: 'sprint',
            phonetics: '/sprɪnt/',
            meaning: 'chu kỳ phát triển (2 tuần)',
            example: 'This sprint ends on Friday — let\'s review our velocity.',
            category: 'agile',
          },
          {
            word: 'pull request',
            phonetics: '/pʊl rɪˈkwest/',
            meaning: 'yêu cầu merge code',
            example: 'Please review my pull request before the standup.',
            category: 'git',
          },
          {
            word: 'merge',
            phonetics: '/mɜːdʒ/',
            meaning: 'gộp code',
            example: 'I\'ll merge the feature branch after CI passes.',
            category: 'git',
          },
          {
            word: 'refactor',
            phonetics: '/riːˈfæktər/',
            meaning: 'tái cấu trúc code',
            example: 'I refactored the authentication module to reduce complexity.',
            category: 'coding',
          },
          {
            word: 'regression',
            phonetics: '/rɪˈɡreʃən/',
            meaning: 'lỗi phát sinh từ thay đổi mới',
            example: "QA found a regression in the checkout flow after yesterday's update.",
            category: 'testing',
          },
          {
            word: 'velocity',
            phonetics: '/vəˈlɒsɪti/',
            meaning: 'tốc độ hoàn thành công việc',
            example: 'Our team velocity dropped this sprint due to unexpected bugs.',
            category: 'agile',
          },
          {
            word: 'ticket',
            phonetics: '/ˈtɪkɪt/',
            meaning: 'task đơn vị (Jira/Trello)',
            example: 'I finished 3 tickets yesterday.',
            category: 'agile',
          },
          {
            word: 'dependency',
            phonetics: '/dɪˈpendənsi/',
            meaning: 'sự phụ thuộc',
            example: "There's a dependency on the backend team's API.",
            category: 'architecture',
          },
          {
            word: 'pipeline',
            phonetics: '/ˈpaɪplaɪn/',
            meaning: 'CI/CD pipeline',
            example: 'The pipeline failed on the build step.',
            category: 'devops',
          },
          {
            word: 'hotfix',
            phonetics: '/ˈhɒtfɪks/',
            meaning: 'bản vá khẩn cấp',
            example: 'We pushed a hotfix last night for the payment bug.',
            category: 'devops',
          },
          {
            word: 'rollback',
            phonetics: '/ˈroʊlbæk/',
            meaning: 'hoàn tác deployment',
            example: 'We had to rollback after users reported issues.',
            category: 'devops',
          },
          {
            word: 'staging',
            phonetics: '/ˈsteɪdʒɪŋ/',
            meaning: 'môi trường test trước production',
            example: "It's working on staging, deploying to prod tonight.",
            category: 'devops',
          },
          {
            word: 'estimate',
            phonetics: '/ˈestɪmɪt/',
            meaning: 'ước tính thời gian',
            example: 'My estimate for this task is 2 days.',
            category: 'agile',
          },
        ],
        phrases: [
          {
            english: 'Yesterday I worked on the login feature and fixed two bugs.',
            vietnamese: 'Hôm qua tôi làm tính năng đăng nhập và sửa 2 lỗi.',
            context: 'When reporting yesterday\'s work',
          },
          {
            english: 'Today I\'m going to focus on the API integration.',
            vietnamese: 'Hôm nay tôi sẽ tập trung vào tích hợp API.',
            context: 'When stating today\'s plan',
          },
          {
            english: 'I\'m blocked by a dependency — waiting for the backend team.',
            vietnamese: 'Tôi đang bị chặn bởi dependency — đang chờ team backend.',
            context: 'When reporting blockers',
          },
          {
            english: 'No blockers on my end.',
            vietnamese: 'Phía tôi không có vấn đề gì.',
            context: 'When no blockers',
          },
          {
            english: 'I need to sync with [name] about the database schema.',
            vietnamese: 'Tôi cần sync với [name] về schema database.',
            context: 'When needing coordination',
          },
          {
            english: 'I\'m about 70% done with this ticket.',
            vietnamese: 'Tôi đã làm được khoảng 70% task này rồi.',
            context: 'When reporting progress',
          },
          {
            english: 'Can we discuss this offline after the standup?',
            vietnamese: 'Chúng ta có thể thảo luận sau standup được không?',
            context: 'When something needs more discussion',
          },
          {
            english: 'I\'ll have a PR ready for review by end of day.',
            vietnamese: 'Tôi sẽ có PR sẵn để review trước cuối ngày.',
            context: 'Committing to a deliverable',
          },
        ],
      },
      {
        id: 'code-review',
        name: 'Code Review',
        vocabulary: [
          {
            word: 'readability',
            phonetics: '/ˌriːdəˈbɪlɪti/',
            meaning: 'khả năng đọc hiểu code',
            example: 'This function is too long — readability is poor.',
            category: 'coding',
          },
          {
            word: 'edge case',
            phonetics: '/edʒ keɪs/',
            meaning: 'trường hợp đặc biệt/biên',
            example: 'Did you handle the edge case where the user has no profile picture?',
            category: 'coding',
          },
          {
            word: 'hardcoded',
            phonetics: '/ˈhɑːrdkoʊdɪd/',
            meaning: 'giá trị cố định trong code',
            example: 'Don\'t hardcode the API URL — use environment variables.',
            category: 'coding',
          },
          {
            word: 'abstraction',
            phonetics: '/æbˈstrækʃən/',
            meaning: 'trừu tượng hóa',
            example: 'We need a better abstraction for the payment processing logic.',
            category: 'architecture',
          },
          {
            word: 'overhead',
            phonetics: '/ˈoʊvərhed/',
            meaning: 'chi phí xử lý thêm',
            example: 'Adding a new middleware layer introduces some overhead.',
            category: 'performance',
          },
          {
            word: 'scalable',
            phonetics: '/ˈskeɪləbl/',
            meaning: 'có thể mở rộng',
            example: 'Is this architecture scalable to 100,000 concurrent users?',
            category: 'architecture',
          },
          {
            word: 'codebase',
            phonetics: '/ˈkoʊdbeɪs/',
            meaning: 'toàn bộ code của dự án',
            example: 'The codebase has grown too large — we need better documentation.',
            category: 'coding',
          },
          {
            word: 'bottleneck',
            phonetics: '/ˈbɒtlnek/',
            meaning: 'điểm tắc nghẽn hiệu năng',
            example: 'Profiling showed the database query is the bottleneck.',
            category: 'performance',
          },
          {
            word: 'lint',
            phonetics: '/lɪnt/',
            meaning: 'kiểm tra lỗi code style',
            example: 'Run the linter before submitting your PR.',
            category: 'tools',
          },
          {
            word: 'unit test',
            phonetics: '/ˈjuːnɪt test/',
            meaning: 'kiểm thử đơn vị',
            example: 'Please add unit tests for this new function.',
            category: 'testing',
          },
          {
            word: 'coverage',
            phonetics: '/ˈkʌvərɪdʒ/',
            meaning: 'tỷ lệ code được test',
            example: 'Test coverage is below 80% — we need more tests.',
            category: 'testing',
          },
          {
            word: 'revert',
            phonetics: '/rɪˈvɜːrt/',
            meaning: 'hoàn tác thay đổi',
            example: 'We should revert this commit — it broke staging.',
            category: 'git',
          },
          {
            word: 'nit',
            phonetics: '/nɪt/',
            meaning: 'nhận xét nhỏ (không bắt buộc sửa)',
            example: 'Nit: variable name could be more descriptive.',
            category: 'communication',
          },
          {
            word: 'LGTM',
            phonetics: '/el dʒiː tiː em/',
            meaning: 'Looks Good To Me (approve PR)',
            example: 'LGTM! Approving this PR.',
            category: 'communication',
          },
          {
            word: 'WIP',
            phonetics: '/wɪp/',
            meaning: 'Work In Progress',
            example: 'This is a WIP PR — not ready for full review.',
            category: 'git',
          },
        ],
        phrases: [
          {
            english: 'Left some comments — nothing blocking, just suggestions.',
            vietnamese: 'Đã comment một số điểm — không blocking, chỉ là gợi ý.',
            context: 'After reviewing a PR',
          },
          {
            english: 'This looks good overall. Can you add a comment explaining why?',
            vietnamese: 'Nhìn chung ổn. Bạn có thể thêm comment giải thích tại sao không?',
            context: 'Requesting clarity',
          },
          {
            english: 'I think we can extract this into a separate helper function.',
            vietnamese: 'Tôi nghĩ có thể tách phần này thành một helper function riêng.',
            context: 'Suggesting refactoring',
          },
          {
            english: 'What\'s the expected behavior when the input is null?',
            vietnamese: 'Hành vi mong đợi khi input là null là gì?',
            context: 'Questioning edge cases',
          },
          {
            english: 'Nice implementation! The logic is clean and easy to follow.',
            vietnamese: 'Implement hay đấy! Logic rõ ràng, dễ đọc hiểu.',
            context: 'Giving positive feedback',
          },
          {
            english: 'This might cause a performance issue at scale.',
            vietnamese: 'Cái này có thể gây vấn đề hiệu năng khi scale lớn.',
            context: 'Flagging performance concern',
          },
          {
            english: 'Can you resolve the merge conflicts before I review?',
            vietnamese: 'Bạn có thể resolve conflict trước khi tôi review không?',
            context: 'Before reviewing',
          },
          {
            english: 'Approved! Feel free to merge when CI passes.',
            vietnamese: 'Approved! Merge khi CI pass nhé.',
            context: 'Approving a PR',
          },
        ],
      },
      {
        id: 'tech-interview',
        name: 'Tech Interview',
        vocabulary: [
          {
            word: 'trade-off',
            phonetics: '/ˈtreɪdɒf/',
            meaning: 'sự đánh đổi',
            example: 'What are the trade-offs between REST and GraphQL?',
            category: 'architecture',
          },
          {
            word: 'implement',
            phonetics: '/ˈɪmplɪment/',
            meaning: 'thực hiện/lập trình',
            example: 'Can you implement a binary search algorithm?',
            category: 'coding',
          },
          {
            word: 'optimize',
            phonetics: '/ˈɒptɪmaɪz/',
            meaning: 'tối ưu hóa',
            example: 'How would you optimize this SQL query?',
            category: 'performance',
          },
          {
            word: 'walk me through',
            phonetics: '/wɔːk miː θruː/',
            meaning: 'giải thích từng bước cho tôi',
            example: 'Walk me through your approach to solving this problem.',
            category: 'communication',
          },
          {
            word: 'clarify',
            phonetics: '/ˈklærɪfaɪ/',
            meaning: 'làm rõ',
            example: 'Before I start coding, let me clarify the requirements.',
            category: 'communication',
          },
          {
            word: 'approach',
            phonetics: '/əˈproʊtʃ/',
            meaning: 'cách tiếp cận',
            example: 'My approach would be to use dynamic programming here.',
            category: 'coding',
          },
          {
            word: 'complexity',
            phonetics: '/kəmˈpleksɪti/',
            meaning: 'độ phức tạp (O notation)',
            example: 'The time complexity of this solution is O(n log n).',
            category: 'algorithms',
          },
          {
            word: 'assumption',
            phonetics: '/əˈsʌmpʃən/',
            meaning: 'giả định',
            example: 'I\'m making the assumption that the input is always sorted.',
            category: 'communication',
          },
          {
            word: 'design pattern',
            phonetics: '/dɪˈzaɪn ˈpætərn/',
            meaning: 'mẫu thiết kế',
            example: 'Which design patterns have you used in this project?',
            category: 'architecture',
          },
          {
            word: 'microservice',
            phonetics: '/ˈmaɪkrəʊˌsɜːrvɪs/',
            meaning: 'kiến trúc vi dịch vụ',
            example: 'We\'re migrating from monolith to microservices.',
            category: 'architecture',
          },
          {
            word: 'throughput',
            phonetics: '/ˈθruːpʊt/',
            meaning: 'thông lượng xử lý',
            example: 'The system handles 10,000 requests per second throughput.',
            category: 'performance',
          },
          {
            word: 'load balancer',
            phonetics: '/loʊd ˈbælənsr/',
            meaning: 'cân bằng tải',
            example: 'We use a load balancer to distribute traffic.',
            category: 'infrastructure',
          },
          {
            word: 'caching',
            phonetics: '/ˈkæʃɪŋ/',
            meaning: 'lưu cache để tăng tốc',
            example: 'Redis caching reduced our response time by 80%.',
            category: 'performance',
          },
          {
            word: 'concurrency',
            phonetics: '/kənˈkɜːrənsi/',
            meaning: 'xử lý đồng thời',
            example: 'How do you handle concurrency in your application?',
            category: 'architecture',
          },
          {
            word: 'REST',
            phonetics: '/rest/',
            meaning: 'kiến trúc API phổ biến',
            example: 'Our backend exposes a RESTful API.',
            category: 'architecture',
          },
        ],
        phrases: [
          {
            english: 'That\'s a great question. Let me think through this.',
            vietnamese: 'Câu hỏi hay đấy. Cho tôi suy nghĩ một chút.',
            context: 'Buying time to think',
          },
          {
            english: 'I\'d approach this problem by first breaking it down into smaller parts.',
            vietnamese: 'Tôi sẽ tiếp cận bài toán này bằng cách chia nhỏ thành các phần.',
            context: 'Starting problem-solving',
          },
          {
            english: 'In my previous role, I worked on a similar challenge.',
            vietnamese: 'Ở vị trí trước, tôi đã xử lý vấn đề tương tự.',
            context: 'Relating to experience',
          },
          {
            english: 'The time complexity would be O(n²), but we can optimize it to O(n log n) by...',
            vietnamese: 'Độ phức tạp là O(n²), nhưng có thể tối ưu thành O(n log n) bằng cách...',
            context: 'Analyzing algorithm',
          },
          {
            english: 'Could you clarify what you mean by that?',
            vietnamese: 'Bạn có thể làm rõ ý đó không?',
            context: 'Asking for clarification',
          },
          {
            english: 'I\'m not 100% sure about this, but my understanding is...',
            vietnamese: 'Tôi không chắc 100%, nhưng theo hiểu biết của tôi...',
            context: 'Being honest about uncertainty',
          },
          {
            english: 'One trade-off of this approach is that it uses more memory but is faster.',
            vietnamese: 'Một sự đánh đổi của cách này là dùng nhiều bộ nhớ hơn nhưng nhanh hơn.',
            context: 'Discussing trade-offs',
          },
          {
            english: 'Is there anything specific about my background you\'d like me to expand on?',
            vietnamese: 'Có điều gì về background của tôi bạn muốn tôi nói thêm không?',
            context: 'Engaging the interviewer',
          },
        ],
      },
      {
        id: 'email',
        name: 'Email & Slack',
        vocabulary: [
          {
            word: 'heads up',
            phonetics: '/hedz ʌp/',
            meaning: 'thông báo trước/cảnh báo',
            example: 'Just a heads up — the deployment might take 30 minutes tonight.',
            category: 'communication',
          },
          {
            word: 'loop in',
            phonetics: '/luːp ɪn/',
            meaning: 'thêm ai đó vào cuộc trò chuyện',
            example: 'Can you loop in the QA team on this thread?',
            category: 'communication',
          },
          {
            word: 'circle back',
            phonetics: '/ˈsɜːrkl bæk/',
            meaning: 'quay lại vấn đề sau',
            example: 'Let\'s circle back on this after the sprint review.',
            category: 'communication',
          },
          {
            word: 'ASAP',
            phonetics: '/ˌeɪ es eɪ ˈpiː/',
            meaning: 'càng sớm càng tốt',
            example: 'We need this fix deployed ASAP — clients are affected.',
            category: 'communication',
          },
          {
            word: 'ETA',
            phonetics: '/ˌiː tiː ˈeɪ/',
            meaning: 'thời gian dự kiến hoàn thành',
            example: 'What\'s your ETA on the API documentation?',
            category: 'communication',
          },
          {
            word: 'sync up',
            phonetics: '/sɪŋk ʌp/',
            meaning: 'họp/đồng bộ thông tin',
            example: 'Can we sync up for 15 minutes this afternoon?',
            category: 'communication',
          },
          {
            word: 'raise a concern',
            phonetics: '/reɪz ə kənˈsɜːrn/',
            meaning: 'nêu vấn đề/lo ngại',
            example: 'I want to raise a concern about the timeline — it\'s too tight.',
            category: 'communication',
          },
          {
            word: 'sign off',
            phonetics: '/saɪn ɒf/',
            meaning: 'phê duyệt/đồng ý',
            example: 'We need the PM to sign off before we push to production.',
            category: 'communication',
          },
          {
            word: 'FYI',
            phonetics: '/ef waɪ aɪ/',
            meaning: 'For Your Information',
            example: 'FYI — the server will be down for maintenance at midnight.',
            category: 'communication',
          },
          {
            word: 'action item',
            phonetics: '/ˈækʃən ˈaɪtəm/',
            meaning: 'việc cần làm sau meeting',
            example: 'Action item: John will update the docs by Friday.',
            category: 'communication',
          },
          {
            word: 'follow up',
            phonetics: '/ˈfɒloʊ ʌp/',
            meaning: 'theo dõi/nhắc lại',
            example: 'Just following up on my previous email.',
            category: 'communication',
          },
          {
            word: 'bandwidth',
            phonetics: '/ˈbændwɪdθ/',
            meaning: 'khả năng/thời gian rảnh (slang)',
            example: 'Do you have the bandwidth to take on this task?',
            category: 'communication',
          },
          {
            word: 'stakeholder',
            phonetics: '/ˈsteɪkhoʊldər/',
            meaning: 'bên liên quan',
            example: 'Let\'s get buy-in from all stakeholders first.',
            category: 'communication',
          },
          {
            word: 'alignment',
            phonetics: '/əˈlaɪnmənt/',
            meaning: 'sự đồng thuận',
            example: 'We need alignment on the requirements before starting.',
            category: 'communication',
          },
          {
            word: 'bottleneck',
            phonetics: '/ˈbɒtlnek/',
            meaning: 'điểm tắc nghẽn (process)',
            example: 'The approval process is the bottleneck here.',
            category: 'communication',
          },
        ],
        phrases: [
          {
            english: 'Hope this message finds you well.',
            vietnamese: 'Mong bạn nhận được tin này trong trạng thái tốt.',
            context: 'Email greeting',
          },
          {
            english: 'I wanted to follow up on my previous message from Monday.',
            vietnamese: 'Tôi muốn theo dõi tin nhắn trước của tôi hôm thứ Hai.',
            context: 'Following up',
          },
          {
            english: 'Please let me know if you have any questions or concerns.',
            vietnamese: 'Vui lòng cho tôi biết nếu bạn có câu hỏi hay lo ngại gì.',
            context: 'Closing an email',
          },
          {
            english: 'I\'ll keep you posted on any updates.',
            vietnamese: 'Tôi sẽ cập nhật cho bạn nếu có tin mới.',
            context: 'Promising to update',
          },
          {
            english: 'Can you share your screen so we can look at this together?',
            vietnamese: 'Bạn có thể share màn hình để chúng ta cùng xem không?',
            context: 'During a video call',
          },
          {
            english: 'Sorry for the late reply — just catching up on messages.',
            vietnamese: 'Xin lỗi vì trả lời muộn — tôi vừa xem lại tin nhắn.',
            context: 'Apologizing for late reply',
          },
          {
            english: 'This is outside my area of expertise — let me connect you with the right person.',
            vietnamese: 'Đây ngoài chuyên môn của tôi — để tôi kết nối bạn với người phù hợp.',
            context: 'Redirecting',
          },
          {
            english: 'Can we schedule a quick 15-minute call to discuss this?',
            vietnamese: 'Chúng ta có thể lên lịch call nhanh 15 phút để thảo luận không?',
            context: 'Requesting a meeting',
          },
        ],
      },
    ],
  },
  travel: {
    id: 'travel',
    name: 'Du Lịch',
    icon: '✈️',
    color: '#f97316',
    subtopics: [
      {
        id: 'airport',
        name: 'Sân Bay',
        vocabulary: [
          {
            word: 'boarding pass',
            phonetics: '/ˈbɔːrdɪŋ pɑːs/',
            meaning: 'thẻ lên máy bay',
            example: 'Please have your boarding pass ready at the gate.',
            category: 'airport',
          },
          {
            word: 'check in',
            phonetics: '/tʃek ɪn/',
            meaning: 'làm thủ tục lên máy bay',
            example: 'Online check-in opens 24 hours before departure.',
            category: 'airport',
          },
          {
            word: 'carry-on',
            phonetics: '/ˈkæri ɒn/',
            meaning: 'hành lý xách tay',
            example: 'Your carry-on bag must fit in the overhead bin.',
            category: 'airport',
          },
          {
            word: 'layover',
            phonetics: '/ˈleɪoʊvər/',
            meaning: 'quá cảnh',
            example: 'We have a 3-hour layover in Singapore.',
            category: 'airport',
          },
          {
            word: 'terminal',
            phonetics: '/ˈtɜːrmɪnl/',
            meaning: 'nhà ga sân bay',
            example: 'Your gate is in Terminal 2 — take the shuttle bus.',
            category: 'airport',
          },
          {
            word: 'customs',
            phonetics: '/ˈkʌstəmz/',
            meaning: 'hải quan',
            example: 'Do you have anything to declare at customs?',
            category: 'airport',
          },
          {
            word: 'departure',
            phonetics: '/dɪˈpɑːrtʃər/',
            meaning: 'khởi hành',
            example: 'The departure board shows the flight is on time.',
            category: 'airport',
          },
          {
            word: 'itinerary',
            phonetics: '/aɪˈtɪnəreri/',
            meaning: 'lịch trình chuyến đi',
            example: 'Please share your travel itinerary with the hotel.',
            category: 'travel',
          },
          {
            word: 'gate',
            phonetics: '/ɡeɪt/',
            meaning: 'cổng lên máy bay',
            example: 'Your flight departs from Gate 23B.',
            category: 'airport',
          },
          {
            word: 'overhead bin',
            phonetics: '/ˈoʊvərhed bɪn/',
            meaning: 'ngăn để hành lý trên đầu',
            example: 'Please stow your bag in the overhead bin.',
            category: 'airport',
          },
          {
            word: 'aisle',
            phonetics: '/aɪl/',
            meaning: 'lối đi giữa các hàng ghế',
            example: 'I prefer an aisle seat on long flights.',
            category: 'airport',
          },
          {
            word: 'delayed',
            phonetics: '/dɪˈleɪd/',
            meaning: 'trễ chuyến',
            example: 'The flight to London is delayed by 2 hours.',
            category: 'airport',
          },
          {
            word: 'transit',
            phonetics: '/ˈtrænsɪt/',
            meaning: 'quá cảnh',
            example: 'Do I need a visa for transit in Dubai?',
            category: 'airport',
          },
          {
            word: 'luggage claim',
            phonetics: '/ˈlʌɡɪdʒ kleɪm/',
            meaning: 'băng chuyền hành lý',
            example: 'Meet me at luggage claim belt number 4.',
            category: 'airport',
          },
          {
            word: 'security check',
            phonetics: '/sɪˈkjʊərɪti tʃek/',
            meaning: 'kiểm tra an ninh',
            example: 'Remove your laptop before going through security check.',
            category: 'airport',
          },
        ],
        phrases: [
          {
            english: 'Excuse me, where is the check-in counter for Vietnam Airlines?',
            vietnamese: 'Xin lỗi, quầy check-in của Vietnam Airlines ở đâu?',
            context: 'Finding check-in',
          },
          {
            english: 'I\'d like a window seat, please.',
            vietnamese: 'Cho tôi ngồi ghế cạnh cửa sổ.',
            context: 'Seat preference',
          },
          {
            english: 'Is this flight on time?',
            vietnamese: 'Chuyến bay này có đúng giờ không?',
            context: 'Asking about delays',
          },
          {
            english: 'My luggage hasn\'t arrived — can you help me file a report?',
            vietnamese: 'Hành lý của tôi chưa đến — bạn có thể giúp tôi báo cáo không?',
            context: 'Lost luggage',
          },
          {
            english: 'What time does boarding start?',
            vietnamese: 'Mấy giờ bắt đầu lên máy bay?',
            context: 'Boarding time',
          },
          {
            english: 'Do I need to go through immigration again for my connecting flight?',
            vietnamese: 'Tôi có cần qua cửa nhập cảnh lại cho chuyến bay nối không?',
            context: 'Connecting flight',
          },
          {
            english: 'Could you upgrade me to business class if there\'s availability?',
            vietnamese: 'Bạn có thể nâng hạng tôi lên business class nếu còn chỗ không?',
            context: 'Requesting upgrade',
          },
          {
            english: 'I have a 90-minute layover — is that enough time to make my connection?',
            vietnamese: 'Tôi có 90 phút quá cảnh — có đủ thời gian bắt chuyến tiếp không?',
            context: 'Checking connection time',
          },
        ],
      },
      {
        id: 'hotel',
        name: 'Khách Sạn',
        vocabulary: [
          {
            word: 'reservation',
            phonetics: '/ˌrezərˈveɪʃən/',
            meaning: 'đặt phòng trước',
            example: 'I have a reservation under the name Le Vinh.',
            category: 'hotel',
          },
          {
            word: 'check out',
            phonetics: '/tʃek aʊt/',
            meaning: 'trả phòng',
            example: 'What time is check-out tomorrow morning?',
            category: 'hotel',
          },
          {
            word: 'amenities',
            phonetics: '/əˈmiːnɪtiz/',
            meaning: 'tiện nghi khách sạn',
            example: 'The hotel amenities include a gym, pool, and free breakfast.',
            category: 'hotel',
          },
          {
            word: 'concierge',
            phonetics: '/ˌkɒnsiˈɛərʒ/',
            meaning: 'nhân viên hỗ trợ khách sạn',
            example: 'Ask the concierge for restaurant recommendations.',
            category: 'hotel',
          },
          {
            word: 'suite',
            phonetics: '/swiːt/',
            meaning: 'phòng cao cấp gồm nhiều phòng',
            example: 'We upgraded you to a suite with ocean view.',
            category: 'hotel',
          },
          {
            word: 'housekeeping',
            phonetics: '/ˈhaʊskiːpɪŋ/',
            meaning: 'dọn phòng khách sạn',
            example: 'Please put the Do Not Disturb sign if you don\'t want housekeeping.',
            category: 'hotel',
          },
          {
            word: 'complimentary',
            phonetics: '/ˌkɒmplɪˈmentri/',
            meaning: 'miễn phí/tặng kèm',
            example: 'Breakfast is complimentary for all guests.',
            category: 'hotel',
          },
          {
            word: 'vacancy',
            phonetics: '/ˈveɪkənsi/',
            meaning: 'phòng trống',
            example: 'Do you have any vacancy for tonight?',
            category: 'hotel',
          },
          {
            word: 'room service',
            phonetics: '/ruːm ˈsɜːrvɪs/',
            meaning: 'dịch vụ phòng',
            example: 'I\'d like to order room service for breakfast.',
            category: 'hotel',
          },
          {
            word: 'adjoining room',
            phonetics: '/əˈdʒɔɪnɪŋ ruːm/',
            meaning: 'phòng liên thông',
            example: 'Can we book two adjoining rooms?',
            category: 'hotel',
          },
          {
            word: 'early check-in',
            phonetics: '/ˈɜːrli tʃek ɪn/',
            meaning: 'nhận phòng sớm',
            example: 'My flight arrives at 6 AM — is early check-in possible?',
            category: 'hotel',
          },
          {
            word: 'late check-out',
            phonetics: '/leɪt tʃek aʊt/',
            meaning: 'trả phòng muộn',
            example: 'Can I arrange a late check-out until 2 PM?',
            category: 'hotel',
          },
          {
            word: 'deposit',
            phonetics: '/dɪˈpɒzɪt/',
            meaning: 'tiền đặt cọc',
            example: 'We require a $100 deposit for incidentals.',
            category: 'hotel',
          },
          {
            word: 'loyalty points',
            phonetics: '/ˈlɔɪəlti pɔɪnts/',
            meaning: 'điểm thành viên',
            example: 'Can I use my loyalty points for this stay?',
            category: 'hotel',
          },
          {
            word: 'valet parking',
            phonetics: '/ˈvæleɪ ˈpɑːrkɪŋ/',
            meaning: 'dịch vụ đỗ xe',
            example: 'Is valet parking available?',
            category: 'hotel',
          },
        ],
        phrases: [
          {
            english: 'I have a reservation under the name Le Vinh, checking in for 3 nights.',
            vietnamese: 'Tôi có đặt phòng tên Lê Vinh, nhận phòng 3 đêm.',
            context: 'Check-in',
          },
          {
            english: 'The air conditioning in my room isn\'t working properly.',
            vietnamese: 'Máy lạnh trong phòng tôi không hoạt động bình thường.',
            context: 'Reporting an issue',
          },
          {
            english: 'Could I get extra towels and toiletries?',
            vietnamese: 'Cho tôi thêm khăn tắm và đồ vệ sinh cá nhân được không?',
            context: 'Requesting amenities',
          },
          {
            english: 'What time is breakfast served, and where?',
            vietnamese: 'Bữa sáng phục vụ lúc mấy giờ và ở đâu?',
            context: 'Breakfast info',
          },
          {
            english: 'Is there a gym or swimming pool available for guests?',
            vietnamese: 'Khách sạn có phòng gym hoặc hồ bơi dành cho khách không?',
            context: 'Facilities',
          },
          {
            english: 'I\'d like to extend my stay by one more night.',
            vietnamese: 'Tôi muốn ở thêm một đêm nữa.',
            context: 'Extending stay',
          },
          {
            english: 'Can you arrange a taxi to the airport for 6 AM tomorrow?',
            vietnamese: 'Bạn có thể sắp xếp taxi ra sân bay lúc 6 giờ sáng mai không?',
            context: 'Transport',
          },
          {
            english: 'I seem to have been charged incorrectly on my bill.',
            vietnamese: 'Hóa đơn của tôi có vẻ bị tính sai.',
            context: 'Disputing a charge',
          },
        ],
      },
      {
        id: 'restaurant',
        name: 'Nhà Hàng',
        vocabulary: [
          {
            word: 'appetizer',
            phonetics: '/ˈæpɪtaɪzər/',
            meaning: 'món khai vị',
            example: 'We\'ll start with the calamari as an appetizer.',
            category: 'food',
          },
          {
            word: 'entrée',
            phonetics: '/ˈɒntreɪ/',
            meaning: 'món chính',
            example: 'For the entrée, I\'ll have the grilled salmon.',
            category: 'food',
          },
          {
            word: 'dietary restriction',
            phonetics: '/ˈdaɪəteri rɪˈstrɪkʃən/',
            meaning: 'hạn chế ăn uống',
            example: 'I have a dietary restriction — I\'m allergic to nuts.',
            category: 'food',
          },
          {
            word: 'to go',
            phonetics: '/tə ɡoʊ/',
            meaning: 'mang về',
            example: 'Can I get the rest of this to go?',
            category: 'food',
          },
          {
            word: 'split the bill',
            phonetics: '/splɪt ðə bɪl/',
            meaning: 'chia tiền thanh toán',
            example: 'Can we split the bill between three people?',
            category: 'payment',
          },
          {
            word: 'medium rare',
            phonetics: '/ˈmiːdiəm reər/',
            meaning: 'tái vừa (thịt bò)',
            example: 'I\'d like my steak medium rare, please.',
            category: 'food',
          },
          {
            word: 'gluten-free',
            phonetics: '/ˈɡluːtən friː/',
            meaning: 'không chứa gluten',
            example: 'Do you have any gluten-free options on the menu?',
            category: 'food',
          },
          {
            word: 'gratuity',
            phonetics: '/ɡrəˈtjuːɪti/',
            meaning: 'tiền tip',
            example: 'An 18% gratuity is included for parties of 6 or more.',
            category: 'payment',
          },
          {
            word: 'reservation',
            phonetics: '/ˌrezərˈveɪʃən/',
            meaning: 'đặt bàn trước',
            example: 'I\'d like to make a reservation for 4 people at 7 PM.',
            category: 'restaurant',
          },
          {
            word: 'specials',
            phonetics: '/ˈspeʃəlz/',
            meaning: 'món đặc biệt hôm nay',
            example: 'What are the specials today?',
            category: 'restaurant',
          },
          {
            word: 'allergy',
            phonetics: '/ˈælərʤi/',
            meaning: 'dị ứng',
            example: 'I\'m allergic to shellfish — is this dish safe?',
            category: 'food',
          },
          {
            word: 'rare/well-done',
            phonetics: '/reər / wel dʌn/',
            meaning: 'tái/chín hẳn',
            example: 'I\'d like my steak well-done please.',
            category: 'food',
          },
          {
            word: 'on the side',
            phonetics: '/ɒn ðə saɪd/',
            meaning: 'phục vụ riêng',
            example: 'Can I have the sauce on the side?',
            category: 'food',
          },
          {
            word: 'half portion',
            phonetics: '/hɑːf ˈpɔːrʃən/',
            meaning: 'nửa khẩu phần',
            example: 'Do you offer half portions?',
            category: 'food',
          },
          {
            word: 'refill',
            phonetics: '/ˈriːfɪl/',
            meaning: 'rót thêm nước/đồ uống',
            example: 'Could I get a refill on my water, please?',
            category: 'restaurant',
          },
        ],
        phrases: [
          {
            english: 'Excuse me, could we see the menu, please?',
            vietnamese: 'Xin lỗi, cho chúng tôi xem thực đơn được không?',
            context: 'Asking for menu',
          },
          {
            english: 'We\'re ready to order.',
            vietnamese: 'Chúng tôi đã sẵn sàng gọi món.',
            context: 'When ready to order',
          },
          {
            english: 'What do you recommend? We\'re not sure what to get.',
            vietnamese: 'Bạn có thể gợi ý gì không? Chúng tôi chưa biết gọi gì.',
            context: 'Asking for recommendation',
          },
          {
            english: 'I\'m sorry, but this isn\'t what I ordered.',
            vietnamese: 'Xin lỗi, nhưng đây không phải món tôi đặt.',
            context: 'Wrong order',
          },
          {
            english: 'Could we get the bill, please? We\'d like to pay separately.',
            vietnamese: 'Cho chúng tôi tính tiền, chúng tôi muốn trả riêng.',
            context: 'Asking for bill',
          },
          {
            english: 'This is delicious! Could I get the recipe?',
            vietnamese: 'Món này ngon quá! Tôi có thể xin công thức không?',
            context: 'Complimenting food',
          },
          {
            english: 'We have a food allergy in our group — can the chef accommodate us?',
            vietnamese: 'Trong nhóm chúng tôi có người dị ứng thức ăn — đầu bếp có thể điều chỉnh không?',
            context: 'Food allergy',
          },
          {
            english: 'Is this dish spicy? I can\'t eat very spicy food.',
            vietnamese: 'Món này có cay không? Tôi không ăn được đồ cay nhiều.',
            context: 'Asking about spice level',
          },
        ],
      },
      {
        id: 'directions',
        name: 'Chỉ Đường',
        vocabulary: [
          {
            word: 'block',
            phonetics: '/blɒk/',
            meaning: 'một dãy nhà (khoảng cách)',
            example: 'The museum is two blocks from here, on the left.',
            category: 'navigation',
          },
          {
            word: 'intersection',
            phonetics: '/ˌɪntərˈsekʃən/',
            meaning: 'ngã tư đường',
            example: 'Turn right at the intersection with Oak Street.',
            category: 'navigation',
          },
          {
            word: 'landmark',
            phonetics: '/ˈlændmɑːrk/',
            meaning: 'điểm nhận diện dễ thấy',
            example: 'The hotel is right next to the landmark cathedral.',
            category: 'navigation',
          },
          {
            word: 'roundabout',
            phonetics: '/ˈraʊndəbaʊt/',
            meaning: 'bùng binh giao thông',
            example: 'Take the third exit at the roundabout.',
            category: 'navigation',
          },
          {
            word: 'commute',
            phonetics: '/kəˈmjuːt/',
            meaning: 'đi lại hàng ngày',
            example: 'What\'s the best way to commute to downtown from here?',
            category: 'navigation',
          },
          {
            word: 'one-way street',
            phonetics: '/wʌn weɪ striːt/',
            meaning: 'đường một chiều',
            example: 'Be careful — this is a one-way street.',
            category: 'navigation',
          },
          {
            word: 'get off',
            phonetics: '/ɡet ɒf/',
            meaning: 'xuống xe/tàu',
            example: 'Get off at the Central Station stop.',
            category: 'transport',
          },
          {
            word: 'transfer',
            phonetics: '/ˈtrænsfɜːr/',
            meaning: 'đổi tàu/xe',
            example: 'You need to transfer at Union Square to the Red Line.',
            category: 'transport',
          },
          {
            word: 'pedestrian crossing',
            phonetics: '/pəˈdestriən ˈkrɒsɪŋ/',
            meaning: 'vạch dành cho người đi bộ',
            example: 'Wait at the pedestrian crossing for the green light.',
            category: 'navigation',
          },
          {
            word: 'U-turn',
            phonetics: '/ˈjuː tɜːrn/',
            meaning: 'quay đầu xe',
            example: 'Make a U-turn at the next intersection.',
            category: 'navigation',
          },
          {
            word: 'shortcut',
            phonetics: '/ˈʃɔːrtkʌt/',
            meaning: 'đường tắt',
            example: 'Is there a shortcut to avoid the traffic?',
            category: 'navigation',
          },
          {
            word: 'congestion',
            phonetics: '/kənˈdʒestʃən/',
            meaning: 'tắc đường',
            example: 'There\'s heavy congestion on the highway — take a detour.',
            category: 'navigation',
          },
          {
            word: 'fare',
            phonetics: '/feər/',
            meaning: 'giá vé',
            example: 'What\'s the fare to downtown?',
            category: 'transport',
          },
          {
            word: 'route',
            phonetics: '/ruːt/',
            meaning: 'tuyến đường',
            example: 'Which route do you recommend to the airport?',
            category: 'navigation',
          },
          {
            word: 'GPS',
            phonetics: '/dʒiː piː es/',
            meaning: 'định vị GPS',
            example: 'Just follow the GPS — it\'ll take us there.',
            category: 'navigation',
          },
        ],
        phrases: [
          {
            english: 'Excuse me, I\'m lost. Can you help me find [place]?',
            vietnamese: 'Xin lỗi, tôi bị lạc. Bạn có thể giúp tôi tìm [địa điểm] không?',
            context: 'Being lost',
          },
          {
            english: 'How long does it take to walk from here?',
            vietnamese: 'Đi bộ từ đây mất bao lâu?',
            context: 'Asking walking time',
          },
          {
            english: 'Is it within walking distance or should I take a taxi?',
            vietnamese: 'Đi bộ được không hay phải đi taxi?',
            context: 'Walk vs taxi',
          },
          {
            english: 'Can you show me on the map?',
            vietnamese: 'Bạn có thể chỉ cho tôi trên bản đồ không?',
            context: 'Using a map',
          },
          {
            english: 'Which bus/metro line goes to [destination]?',
            vietnamese: 'Tuyến xe buýt/tàu điện ngầm nào đi đến [điểm đến]?',
            context: 'Public transport',
          },
          {
            english: 'I think I missed my stop. What should I do?',
            vietnamese: 'Tôi nghĩ tôi đã bỏ lỡ trạm rồi. Phải làm gì?',
            context: 'Missed stop',
          },
          {
            english: 'Turn left at the traffic lights, then it\'s the second building on your right.',
            vietnamese: 'Rẽ trái ở đèn giao thông, rồi đó là tòa nhà thứ hai bên phải bạn.',
            context: 'Giving directions',
          },
          {
            english: 'How much would a taxi cost from here to the city center?',
            vietnamese: 'Đi taxi từ đây đến trung tâm thành phố hết bao nhiêu?',
            context: 'Taxi fare',
          },
        ],
      },
    ],
  },
};

export const getAllTopics = (): Topic[] => {
  return Object.values(TOPICS);
};

export const getTopicById = (id: string): Topic | undefined => {
  return TOPICS[id];
};

export const getSubtopic = (topicId: string, subtopicId: string): SubTopic | undefined => {
  const topic = TOPICS[topicId];
  if (!topic) return undefined;
  return topic.subtopics.find((st) => st.id === subtopicId);
};
