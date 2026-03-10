interface XPBarProps {
  current: number;
  total: number;
  level: number;
  className?: string;
}

export const XPBar = ({ current, total, level, className }: XPBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[#cbd5e1]">Level {level}</span>
        <span className="text-sm text-[#94a3b8]">
          {current} / {total} XP
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#334155]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] transition-all duration-300 shadow-lg"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
