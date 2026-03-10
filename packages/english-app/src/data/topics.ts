export interface Vocabulary {
  word: string;
  phonetics: string;
  meaning: string;
  example: string;
  category: string;
}

export interface SubTopic {
  id: string;
  name: string;
  vocabulary: Vocabulary[];
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
