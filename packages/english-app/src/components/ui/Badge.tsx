import { clsx } from 'clsx';
import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[#10b981]/20 text-[#34d399]',
  secondary: 'bg-[#1e3a8a]/40 text-[#60a5fa]',
  accent: 'bg-[#f59e0b]/20 text-[#fbbf24]',
  success: 'bg-[#059669]/20 text-[#10b981]',
  warning: 'bg-[#d97706]/20 text-[#f59e0b]',
};

export const Badge = ({ children, variant = 'primary', className }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};
