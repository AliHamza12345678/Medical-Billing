'use client';

import { Building2, Phone, Mail, MapPin, ArrowLeft, Edit, TrendingUp, FileText, Clock, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { StatusChip } from '@/components/features/status-chip';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DonutChartCard } from '@/components/features/charts';
import { getProviderById } from '@/data/insurance';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const provider = getProviderById(params.id);
  if (!provider) {
    return (
      <DashboardShell>
        <PageHeader title="Provider Not Found" breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Insurance', href: '/insurance' }]} />
        <p className="text-muted-foreground">This insurance provider does not exist.</p>
      </DashboardShell>
    );
  }

  const denied = provider.claimsSubmitted - provider.claimsPaid;
  const chartData = [
    { name: 'Paid', value: provider.claimsPaid, color: 'hsl(var(--chart-2))' },
    { name: 'Outstanding', value: provider.claimsSubmitted - provider.claimsPaid - denied, color: 'hsl(var(--chart-3))' },
    { name: 'Denied', value: denied, color: 'hsl(var(--chart-4))' },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title={provider.name}
        description={`Payer ID: ${provider.payerId} · ${provider.type} plan`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Insurance', href: '/insurance' }, { label: provider.name }]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push('/insurance')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button><Edit className="mr-2 h-4 w-4" /> Edit Provider</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${provider.logoColor} text-white`}>
                <Building2 className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-lg font-bold">{provider.name}</h2>
              <div className="mt-2"><StatusChip status={provider.status} /></div>
            </div>
            <Separator className="my-5" />
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" />{provider.phone}</div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" />{provider.email}</div>
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" /><span>{provider.address}, {provider.city}, {provider.state} {provider.zip}</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatBox icon={FileText} label="Claims Submitted" value={formatNumber(provider.claimsSubmitted)} color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
          <StatBox icon={TrendingUp} label="Claims Paid" value={formatNumber(provider.claimsPaid)} color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
          <StatBox icon={Clock} label="Avg Processing" value={`${provider.avgProcessingDays} days`} color="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          <StatBox icon={DollarSign} label="Total Revenue" value={formatCurrency(provider.totalRevenue)} color="bg-primary/10 text-primary" />
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Claims Breakdown</CardTitle><CardDescription>Distribution of submitted claims</CardDescription></CardHeader>
        <CardContent><DonutChartCard data={chartData} height={300} /></CardContent>
      </Card>
    </DashboardShell>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: typeof FileText; label: string; value: string; color: string }) {
  return (
    <Card><CardContent className="py-4">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </CardContent></Card>
  );
}
