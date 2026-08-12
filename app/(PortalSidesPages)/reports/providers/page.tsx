'use client';

import { Download } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { BarChartCard } from '@/components/features/charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { providerReport } from '@/data/reports';
import { formatCurrency } from '@/lib/format';
import type { ProviderReportRow } from '@/types';

export default function ProviderReportPage() {
  const chartData = providerReport.map((p) => ({ name: p.provider.replace('Dr. ', ''), revenue: p.revenue, claims: p.claims }));

  const columns: ColumnDef<ProviderReportRow>[] = [
    { accessorKey: 'provider', header: 'Provider', cell: ({ row }) => <span className="font-medium">{row.original.provider}</span> },
    { accessorKey: 'patients', header: 'Patients' },
    { accessorKey: 'claims', header: 'Claims' },
    { accessorKey: 'submitted', header: 'Submitted' },
    { accessorKey: 'paid', header: 'Paid', cell: ({ row }) => <span className="text-emerald-600 dark:text-emerald-400">{row.original.paid}</span> },
    { accessorKey: 'denied', header: 'Denied', cell: ({ row }) => <span className="text-rose-600 dark:text-rose-400">{row.original.denied}</span> },
    { accessorKey: 'revenue', header: 'Revenue', cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.revenue)}</span> },
    {
      accessorKey: 'collectionRate',
      header: 'Collection Rate',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Progress value={row.original.collectionRate} className="h-2 w-20" />
          <span className="text-sm font-medium">{row.original.collectionRate}%</span>
        </div>
      ),
    },
  ];

  const totalRevenue = providerReport.reduce((s, p) => s + p.revenue, 0);

  return (
    <DashboardShell>
      <PageHeader
        title="Provider Report"
        description="Performance metrics by healthcare provider"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports', href: '/reports' }, { label: 'Providers' }]}
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Total Providers" value={String(providerReport.length)} />
        <StatBox label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <StatBox label="Total Claims" value={String(providerReport.reduce((s, p) => s + p.claims, 0))} />
        <StatBox label="Avg Collection" value={`${(providerReport.reduce((s, p) => s + p.collectionRate, 0) / providerReport.length).toFixed(1)}%`} />
      </div>
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Revenue by Provider</CardTitle><CardDescription>Total revenue generated per provider</CardDescription></CardHeader>
        <CardContent><BarChartCard data={chartData} xKey="name" bars={[{ key: 'revenue', color: 'hsl(var(--chart-1))', name: 'Revenue' }]} /></CardContent>
      </Card>
      <DataTable columns={columns} data={providerReport} searchKey="provider" searchPlaceholder="Search providers..." />
    </DashboardShell>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card><CardContent className="py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </CardContent></Card>
  );
}
