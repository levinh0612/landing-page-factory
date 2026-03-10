import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getAllTopics, getTopicById } from '@/data/topics';
import { BottomNav } from '@/components/BottomNav';

export function LearnPage() {
  const topics = getAllTopics();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const currentTopic = selectedTopic ? getTopicById(selectedTopic) : null;

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24">
      {/* Header */}
      <div className="border-b border-[#1f2d40] bg-[#111827] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Học Tiếng Anh</h1>
          <p className="mt-2 text-[#94a3b8]">
            Chọn chủ đề để bắt đầu học từ mới
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {!selectedTopic ? (
          // Topic selection
          <div className="space-y-4">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className="w-full rounded-xl border border-[#1f2d40] bg-[#1e293b] p-6 text-left transition-all hover:border-[#10b981] hover:bg-[#1e293b]/80"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-3xl">{topic.icon}</span>
                      <h2 className="text-xl font-bold text-[#f1f5f9]">
                        {topic.name}
                      </h2>
                    </div>
                    <p className="mb-3 text-sm text-[#94a3b8]">
                      {topic.subtopics.length} chủ đề con
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {topic.subtopics.slice(0, 2).map((subtopic) => (
                        <span
                          key={subtopic.id}
                          className="text-xs rounded-full bg-[#10b981]/20 px-2 py-1 text-[#10b981]"
                        >
                          {subtopic.name}
                        </span>
                      ))}
                      {topic.subtopics.length > 2 && (
                        <span className="text-xs text-[#94a3b8]">
                          +{topic.subtopics.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="text-[#94a3b8]" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Subtopic selection
          <div>
            <button
              onClick={() => setSelectedTopic(null)}
              className="mb-6 flex items-center gap-2 text-[#10b981] hover:text-[#34d399] transition-colors"
            >
              <span>← Quay lại</span>
            </button>

            <div className="mb-6 flex items-center gap-3">
              <span className="text-4xl">{currentTopic?.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-[#f1f5f9]">
                  {currentTopic?.name}
                </h2>
                <p className="text-[#94a3b8]">
                  Chọn chủ đề con để học
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {currentTopic?.subtopics.map((subtopic) => (
                <Link
                  key={subtopic.id}
                  to={`/lesson/${currentTopic.id}/${subtopic.id}`}
                  className="block rounded-xl border border-[#1f2d40] bg-[#1e293b] p-4 transition-all hover:border-[#10b981] hover:bg-[#1e293b]/80"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#f1f5f9]">
                        {subtopic.name}
                      </h3>
                      <p className="text-sm text-[#94a3b8]">
                        {subtopic.vocabulary.length} từ vựng
                      </p>
                    </div>
                    <ChevronRight className="text-[#94a3b8]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
