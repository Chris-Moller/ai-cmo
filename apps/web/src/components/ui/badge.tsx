import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-emerald-400/10 text-emerald-400',
        secondary:
          'border-transparent bg-zinc-800 text-zinc-100',
        destructive:
          'border-transparent bg-rose-400/10 text-rose-400',
        outline: 'border-zinc-700 text-zinc-300',
        warning:
          'border-transparent bg-amber-400/10 text-amber-400',
        info:
          'border-transparent bg-sky-400/10 text-sky-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
