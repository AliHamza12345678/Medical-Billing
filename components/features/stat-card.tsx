'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'flat';
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | string;
  index?: number;
}

const colorMap: Record<string, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  destructive: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
  info: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
};

export function StatCard({
  label,
  value,
  change,
  trend = 'flat',
  icon: Icon,
  color = 'primary',
  index = 0,
}: StatCardProps) {
  const c = colorMap[color] || colorMap.primary;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <Card className="relative overflow-hidden p-4 transition-shadow hover:shadow-md sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
            {change !== undefined && (
              <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', trendColor)}>
                <TrendIcon className="h-3.5 w-3.5" />
                <span>
                  {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
                  {Math.abs(change)}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', c.bg, c.text)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
