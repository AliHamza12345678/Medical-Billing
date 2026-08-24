'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  CreditCard, CheckCircle2, XCircle, FileText, ShieldCheck, FileCheck, AlertTriangle,
  Bell, Check, Trash2, Filter,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/format';
import { notifications as fallbackNotifications } from '@/data/notifications';
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

import { useRealtimeEvents } from '@/hooks/use-realtime-events';

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setItems(data.data);
      } else {
        setItems(fallbackNotifications);
      }
    } catch (err) {
      console.error('[FETCH_NOTIFICATIONS_ERROR]', err);
      setItems(fallbackNotifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time SSE event stream hook
  useRealtimeEvents(React.useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]));

  const filtered = tab === 'unread' ? items.filter((n) => !n.read) : tab === 'high' ? items.filter((n) => n.priority === 'high') : items;

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('[MARK_ALL_READ_ERROR]', err);
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('[MARK_READ_ERROR]', err);
    }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('[DELETE_NOTIF_ERROR]', err);
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <DashboardShell>
      <PageHeader
        title="Notification Center"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Notifications' }]}
        actions={<Button variant="outline" onClick={markAllRead}><Check className="mr-2 h-4 w-4" /> Mark all read</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <NotifStat icon={CreditCard} label="Payment Due" count={items.filter((n) => n.type === 'payment_due').length} color="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
        <NotifStat icon={CheckCircle2} label="Approved" count={items.filter((n) => n.type === 'claim_approved').length} color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <NotifStat icon={XCircle} label="Rejected" count={items.filter((n) => n.type === 'claim_rejected' || n.type === 'denial_received').length} color="bg-rose-500/10 text-rose-600 dark:text-rose-400" />
        <NotifStat icon={FileText} label="Invoices" count={items.filter((n) => n.type === 'invoice_generated').length} color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="high">High Priority</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm text-muted-foreground">No notifications here.</p>
                  </div>
                ) : (
                  filtered.map((n) => {
                    const iconConfig = iconMap[n.type] || { icon: Bell, color: 'bg-primary/10 text-primary' };
                    const Icon = iconConfig.icon;
                    const color = iconConfig.color;
                    return (
                      <div key={n.id} className={cn('flex items-start gap-4 px-6 py-4 transition-colors hover:bg-accent', !n.read && 'bg-primary/[0.03]')}>
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{n.title}</p>
                            {n.priority === 'high' && <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">HIGH</span>}
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.timestamp)}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {!n.read && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markRead(n.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove(n.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}

function NotifStat({ icon: Icon, label, count, color }: { icon: typeof Bell; label: string; count: number; color: string }) {
  return (
    <Card><CardContent className="flex items-center gap-3 py-4">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}><Icon className="h-5 w-5" /></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold">{count}</p></div>
    </CardContent></Card>
  );
}
