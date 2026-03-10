import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className, hover, onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-lg border border-[#475569] bg-[#1e293b] shadow-sm',
        hover && 'transition-all duration-200 hover:border-[#64748b] hover:shadow-md hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
};
