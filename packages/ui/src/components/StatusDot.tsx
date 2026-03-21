import type { HTMLAttributes } from 'react';

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'cyan' | 'amber' | 'green' | 'red' | 'neutral';
}

const colorClasses: Record<NonNullable<StatusDotProps['color']>, string> = {
  cyan: 'bg-accent-cyan',
  amber: 'bg-accent-amber',
  green: 'bg-accent-green',
  red: 'bg-accent-red',
  neutral: 'bg-text-secondary',
};

export function StatusDot({
  color = 'neutral',
  className = '',
  ...props
}: StatusDotProps) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colorClasses[color]} ${className}`}
      {...props}
    />
  );
}
