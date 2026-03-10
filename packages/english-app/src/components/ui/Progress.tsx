interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export const Progress = ({ value, max = 100, label, showLabel = true, className }: ProgressProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      {(label || showLabel) && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-[#cbd5e1]">{label || 'Progress'}</span>
          <span className="text-sm font-medium text-[#f1f5f9]">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#334155]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
