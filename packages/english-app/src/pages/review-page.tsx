import { useState } from 'react';
import { Search } from 'lucide-react';
import { getAllTopics } from '@/data/topics';
import { BottomNav } from '@/components/BottomNav';

export function ReviewPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const topics = getAllTopics();

  const allVocabulary = topics.flatMap((topic) =>
    topic.subtopics.flatMap((subtopic) =>
      subtopic.vocabulary.map((vocab) => ({
        ...vocab,
        topicName: topic.name,
        subtopicName: subtopic.name,
      }))
    )
  );

  const filteredVocab = allVocabulary.filter((word) => {
    const matchesSearch =
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || word.topicName === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] pb-20">
      {/* Header */}
      <div className="border-b border-[#1f2d40] bg-[#111827] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Ôn Tập</h1>
          <p className="mt-2 text-[#94a3b8]">
            Xem lại các từ vựng đã học
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#1f2d40] bg-[#111827] py-3 pl-10 pr-4 text-[#f1f5f9] placeholder-[#94a3b8] focus:border-[#10b981] focus:outline-none"
          />
        </div>

        {/* Topic filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`rounded-full px-4 py-2 font-medium transition-colors ${
              selectedTopic === null
                ? 'bg-[#10b981] text-white'
                : 'bg-[#334155] text-[#94a3b8] hover:text-[#f1f5f9]'
            }`}
          >
            Tất cả
          </button>
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.name)}
              className={`rounded-full px-4 py-2 font-medium transition-colors ${
                selectedTopic === topic.name
                  ? 'bg-[#10b981] text-white'
                  : 'bg-[#334155] text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              {topic.icon} {topic.name}
            </button>
          ))}
        </div>

        {/* Vocabulary list */}
        <div className="space-y-3">
          {filteredVocab.length === 0 ? (
            <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-8 text-center">
              <p className="text-[#94a3b8]">Không tìm thấy từ vựng nào</p>
            </div>
          ) : (
            filteredVocab.map((word, idx) => (
              <details
                key={idx}
                className="group rounded-lg border border-[#1f2d40] bg-[#1e293b] transition-all open:border-[#10b981] open:bg-[#1e293b]"
              >
                <summary className="flex cursor-pointer items-center justify-between p-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#f1f5f9]">
                      {word.word}
                    </h3>
                    <p className="mt-1 text-sm text-[#10b981]">
                      {word.meaning}
                    </p>
                  </div>
                  <span className="text-[#94a3b8]">+</span>
                </summary>
                <div className="border-t border-[#1f2d40] px-4 pb-4 pt-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[#94a3b8] uppercase">
                      Phát âm
                    </p>
                    <p className="mt-1 text-sm text-[#cbd5e1]">
                      {word.phonetics}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#94a3b8] uppercase">
                      Ví Dụ
                    </p>
                    <p className="mt-1 italic text-[#cbd5e1]">
                      "{word.example}"
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#94a3b8] uppercase">
                      Thông Tin
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="inline-block rounded-full bg-[#10b981]/20 px-2 py-1 text-xs text-[#10b981]">
                        {word.category}
                      </span>
                      <span className="inline-block rounded-full bg-[#6366f1]/20 px-2 py-1 text-xs text-[#818cf8]">
                        {word.subtopicName}
                      </span>
                      <span className="inline-block rounded-full bg-[#f97316]/20 px-2 py-1 text-xs text-[#fb923c]">
                        {word.topicName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(
                          word.word
                        );
                        utterance.lang = 'en-US';
                        speechSynthesis.speak(utterance);
                      }
                    }}
                    className="mt-3 w-full rounded-lg bg-[#10b981]/20 px-4 py-2 text-sm font-medium text-[#10b981] hover:bg-[#10b981]/30 transition-colors"
                  >
                    🔊 Phát âm
                  </button>
                </div>
              </details>
            ))
          )}
        </div>

        {/* Stats */}
        {filteredVocab.length > 0 && (
          <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] p-4">
            <p className="text-sm text-[#94a3b8]">
              Đang hiển thị {filteredVocab.length} từ vựng
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
