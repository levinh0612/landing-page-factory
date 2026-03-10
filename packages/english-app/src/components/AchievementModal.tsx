import { X } from 'lucide-react';

interface AchievementModalProps {
  isOpen: boolean;
  title: string;
  icon: string;
  description: string;
  onClose: () => void;
}

export function AchievementModal({
  isOpen,
  title,
  icon,
  description,
  onClose,
}: AchievementModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-sm rounded-2xl border border-[#1f2d40] bg-gradient-to-br from-[#1e293b] to-[#111827] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-[#334155] transition-colors"
        >
          <X size={20} className="text-[#94a3b8]" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-block text-8xl">{icon}</div>
          <h2 className="mb-2 text-3xl font-bold text-[#f59e0b]">{title}</h2>
          <p className="mb-8 text-[#cbd5e1]">{description}</p>
          <button
            onClick={onClose}
            className="btn-primary w-full"
          >
            Tuyệt vời!
          </button>
        </div>
      </div>
    </div>
  );
}
