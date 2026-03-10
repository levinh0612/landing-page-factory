import { useState, useRef, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import type { Vocabulary } from '@/data/topics';

interface VocabCardProps {
  vocab: Vocabulary;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  index: number;
  total: number;
}

export function VocabCard({
  vocab,
  onSwipeRight,
  onSwipeLeft,
  index,
  total,
}: VocabCardProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onSwipeLeft?.();
    } else if (isRightSwipe) {
      onSwipeRight?.();
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(vocab.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      ref={cardRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={() => setIsFlipped(!isFlipped)}
      className="relative mx-auto h-96 w-full max-w-sm cursor-pointer perspective"
    >
      <div
        className={`relative w-full h-full transition-transform duration-300 transform ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[#1f2d40] bg-gradient-to-br from-[#1e293b] to-[#111827] p-8 shadow-xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center">
            <p className="mb-2 text-sm text-[#94a3b8]">Từ #{index + 1}</p>
            <h2 className="mb-4 text-5xl font-bold text-[#f1f5f9]">
              {vocab.word}
            </h2>
            <p className="mb-6 text-lg text-[#10b981]">{vocab.phonetics}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak();
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#10b981]/20 px-4 py-2 text-[#10b981] hover:bg-[#10b981]/30 transition-colors"
            >
              <Volume2 size={20} />
              <span className="text-sm font-medium">Phát âm</span>
            </button>
            <p className="mt-8 text-xs text-[#94a3b8]">Nhấp để xem nghĩa</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border border-[#1f2d40] bg-gradient-to-br from-[#1e293b] to-[#111827] p-8 shadow-xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs font-semibold text-[#94a3b8] uppercase">
                Nghĩa Tiếng Việt
              </p>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                {vocab.meaning}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-[#94a3b8] uppercase">
                Ví Dụ
              </p>
              <p className="text-sm italic text-[#cbd5e1]">{vocab.example}</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-[#94a3b8] uppercase">
                Danh Mục
              </p>
              <span className="inline-block rounded-full bg-[#10b981]/20 px-3 py-1 text-xs font-medium text-[#10b981]">
                {vocab.category}
              </span>
            </div>

            <p className="text-xs text-[#94a3b8]">Nhấp để xem từ</p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-[#94a3b8]">
        {index + 1} / {total}
      </div>
    </div>
  );
}
