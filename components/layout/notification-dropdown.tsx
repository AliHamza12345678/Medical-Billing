'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  CreditCard,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/format';
import { notifications as allNotifications } from '@/data/notifications';
import type { AppNotification, NotificationType } from '@/types';

const iconMap: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  payment_due: { icon: CreditCard, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  claim_approved: { icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  claim_rejected: { icon: XCircle, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  invoice_generated: { icon: FileText, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  eligibility_verified: { icon: ShieldCheck, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  authorization_required: { icon: FileCheck, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  denial_received: { icon: AlertTriangle, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
};

export function NotificationDropdown() {
  const [items, setItems] = React.useState<AppNotification[]>(allNotifications);
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Mark all read
          </button>
        </div>
        <DropdownMenuSeparator className="m-0" />
        <ScrollArea className="h-80">
          <div className="divide-y">
            {items.slice(0, 8).map((n) => {
              const { icon: Icon, color } = iconMap[n.type];
              return (
                <Link
                  key={n.id}
                  href={n.actionUrl ?? '/notifications'}
                  className={cn(
                    'flex gap-3 px-4 py-3 transition-colors hover:bg-accent',
                    !n.read && 'bg-primary/[0.03]'
                  )}
                >
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {n.message}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {timeAgo(n.timestamp)}
                    </p>
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </div>
        </ScrollArea>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2">
          <Link
            href="/notifications"
            className="block rounded-md py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
