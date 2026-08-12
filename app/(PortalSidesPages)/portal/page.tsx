'use client';

import Link from 'next/link';
import { Wallet, CheckCircle, FileText, CalendarClock, ArrowRight, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { PortalLayout } from '@/components/layout/portal-layout';
import { StatCard } from '@/components/features/stat-card';
import { StatusChip } from '@/components/features/status-chip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { portalStats, portalInvoices } from '@/data/dashboard';
import { formatCurrency, formatDate } from '@/lib/format';

export default function PortalDashboardPage() {
  const iconMap: Record<string, typeof Wallet> = { Wallet, CheckCircle, FileText, CalendarClock };

  return (
    <PortalLayout>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {portalStats.map((stat, i) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} change={stat.change} trend={stat.trend} icon={iconMap[stat.icon] ?? Wallet} color={stat.color} index={i} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Invoices</CardTitle>
            <Link href="/portal/invoices" className="text-sm font-medium text-primary hover:text-primary/80">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {portalInvoices.slice(0, 4).map((inv, i) => (
                <motion.div key={inv.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-mono text-sm font-medium">{inv.number}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(inv.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(inv.amount)}</p>
                    <p className={inv.balance > 0 ? 'text-xs text-amber-600 dark:text-amber-400' : 'text-xs text-emerald-600 dark:text-emerald-400'}>
                      {inv.balance > 0 ? `Balance: ${formatCurrency(inv.balance)}` : 'Paid in full'}
                    </p>
                  </div>
                  <StatusChip status={inv.status} />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <CreditCard className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold">Make a Payment</h3>
            <p className="mt-1 text-sm text-primary-foreground/80">Pay your outstanding balance securely online</p>
            <Button asChild variant="secondary" className="mt-5 w-full">
              <Link href="/portal/pay">Pay Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
