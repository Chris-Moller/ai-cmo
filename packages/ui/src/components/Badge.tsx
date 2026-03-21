import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'amber' | 'green' | 'red' | 'neutral';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  cyan: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30',
  amber: 'bg-accent-amber/15 text-accent-amber border-accent-amber/30',
  green: 'bg-accent-green/15 text-accent-green border-accent-green/30',
  red: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  neutral: 'bg-bg-tertiary text-text-secondary border-border',
};

export function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-display font-medium border rounded-sm ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
