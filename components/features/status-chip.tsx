import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ClaimStatus, PaymentStatus } from '@/types';

const claimStatusClasses: Record<ClaimStatus, string> = {
  Submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-blue-600/20',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-600/20',
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-600/20',
  Denied: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-600/20',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300 ring-red-600/20',
};

const paymentStatusClasses: Record<PaymentStatus, string> = {
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-600/20',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-600/20',
  Failed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-600/20',
  Refunded: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-600/20',
  Partial: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-blue-600/20',
};

const dotClasses: Record<ClaimStatus, string> = {
  Submitted: 'bg-blue-500',
  Pending: 'bg-amber-500',
  Paid: 'bg-emerald-500',
  Denied: 'bg-rose-500',
  Rejected: 'bg-red-500',
};

interface StatusChipProps {
  status: ClaimStatus | PaymentStatus | string;
  className?: string;
  withDot?: boolean;
}

export function StatusChip({ status, className, withDot = true }: StatusChipProps) {
  const claimKey = status as ClaimStatus;
  const payKey = status as PaymentStatus;
  const classes =
    claimStatusClasses[claimKey] ??
    paymentStatusClasses[payKey] ??
    'bg-secondary text-secondary-foreground ring-border';

  const dot =
    dotClasses[claimKey] ??
    (payKey === 'Paid'
      ? 'bg-emerald-500'
      : payKey === 'Pending'
        ? 'bg-amber-500'
        : payKey === 'Failed'
          ? 'bg-rose-500'
          : payKey === 'Refunded'
            ? 'bg-violet-500'
            : 'bg-blue-500');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        classes,
        className
      )}
    >
      {withDot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
      {status}
    </span>
  );
}

interface GenericBadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

const genericClasses: Record<NonNullable<GenericBadgeProps['variant']>, string> = {
  default: 'bg-primary/10 text-primary ring-primary/20',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-600/20',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-600/20',
  destructive: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-600/20',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-blue-600/20',
  neutral: 'bg-secondary text-secondary-foreground ring-border',
};

export function GenericBadge({ variant = 'neutral', children, className }: GenericBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        genericClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
