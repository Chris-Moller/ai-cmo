import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export function Card({
  title,
  subtitle,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-bg-secondary border border-border rounded p-4 ${className}`}
      {...props}
    >
      {title && (
        <div className="mb-3">
          <h3 className="font-display text-sm font-semibold text-text-primary uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
