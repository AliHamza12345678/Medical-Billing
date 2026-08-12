'use client';

import { useRouter } from 'next/navigation';
import { TrendingUp, Hourglass, Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { Card, CardContent } from '@/components/ui/card';

const reports = [
  { title: 'Revenue Report', description: 'Monthly revenue trends, targets, and growth analysis', icon: TrendingUp, href: '/reports/revenue', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { title: 'Aging Report', description: 'Outstanding balances bucketed by age', icon: Hourglass, href: '/reports/aging', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { title: 'Provider Report', description: 'Performance metrics by healthcare provider', icon: Stethoscope, href: '/reports/providers', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { title: 'Insurance Report', description: 'Payer performance and denial analysis', icon: ShieldCheck, href: '/reports/insurance', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
];

export default function ReportsIndexPage() {
  const router = useRouter();
  return (
    <DashboardShell>
      <PageHeader
        title="Reports"
        description="Financial and operational analytics for your practice"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports' }]}
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {reports.map((r, i) => (
          <motion.div key={r.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => router.push(r.href)}>
              <CardContent className="flex items-start gap-4 py-6">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${r.color}`}>
                  <r.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </DashboardShell>
  );
}
