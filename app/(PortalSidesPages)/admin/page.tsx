'use client';

import { useRouter } from 'next/navigation';
import {
  Users, KeyRound, Lock, Hash, DollarSign, Building2, ScrollText, ArrowRight, Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { Card, CardContent } from '@/components/ui/card';

const adminPages = [
  { title: 'Users', description: 'Manage user accounts and access', icon: Users, href: '/admin/users', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { title: 'Roles', description: 'Define roles and responsibilities', icon: KeyRound, href: '/admin/roles', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { title: 'Permissions', description: 'Module-level access control', icon: Lock, href: '/admin/permissions', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { title: 'Billing Codes', description: 'CPT and ICD-10 code library', icon: Hash, href: '/admin/billing-codes', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { title: 'Fee Schedule', description: 'Negotiated rates by provider', icon: DollarSign, href: '/admin/fee-schedule', color: 'bg-primary/10 text-primary' },
  { title: 'Insurance Providers', description: 'Payer relationship management', icon: Building2, href: '/admin/insurance-providers', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  { title: 'Audit Logs', description: 'System activity tracking', icon: ScrollText, href: '/admin/audit-logs', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
];

export default function AdminPage() {
  const router = useRouter();
  return (
    <DashboardShell>
      <PageHeader
        title="Admin Panel"
        description="System configuration and administrative tools"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin' }]}
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adminPages.map((p, i) => (
          <motion.div key={p.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => router.push(p.href)}>
              <CardContent className="flex items-start gap-4 py-6">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${p.color}`}>
                  <p.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
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
