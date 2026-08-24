'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { BarChartCard } from '@/components/features/charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { InsuranceReportRow } from '@/types';

export default function InsuranceReportPage() {
  const [payerList, setPayerList] = useState<InsuranceReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsuranceReport = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/insurance');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setPayerList(data.data);
      }
    } catch (err) {
      console.error('[FETCH_INSURANCE_REPORT_ERROR]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsuranceReport();
  }, [fetchInsuranceReport]);

  const chartData = payerList.map((r) => ({
    name: r.provider.slice(0, 12),
    revenue: Number(r.revenue),
    denialRate: r.denialRate,
  }));

  const columns: ColumnDef<InsuranceReportRow>[] = [
    { accessorKey: 'provider', header: 'Provider', cell: ({ row }) => <span className="font-medium">{row.original.provider}</span> },
    { accessorKey: 'claims', header: 'Claims', cell: ({ row }) => formatNumber(row.original.claims) },
    { accessorKey: 'paid', header: 'Paid', cell: ({ row }) => <span className="text-emerald-600 dark:text-emerald-400">{formatNumber(row.original.paid)}</span> },
    { accessorKey: 'denied', header: 'Denied', cell: ({ row }) => <span className="text-rose-600 dark:text-rose-400">{formatNumber(row.original.denied)}</span> },
    { accessorKey: 'revenue', header: 'Revenue', cell: ({ row }) => <span className="font-semibold">{formatCurrency(Number(row.original.revenue))}</span> },
    { accessorKey: 'avgDays', header: 'Avg Days', cell: ({ row }) => `${row.original.avgDays}d` },
    {
      accessorKey: 'denialRate',
      header: 'Denial Rate',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Progress value={row.original.denialRate} className="h-2 w-20" />
          <span className="text-sm font-medium">{row.original.denialRate}%</span>
        </div>
      ),
    },
  ];

  const totalRevenue = payerList.reduce((s, r) => s + Number(r.revenue), 0);
  const avgDenial = payerList.length
    ? (payerList.reduce((s, r) => s + r.denialRate, 0) / payerList.length).toFixed(1)
    : '0';

  return (
    <DashboardShell>
      <PageHeader
        title="Insurance Report"
        description="Payer performance, processing times, and denial analysis"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports', href: '/reports' }, { label: 'Insurance' }]}
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Active Payers" value={String(payerList.length)} />
        <StatBox label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <StatBox label="Total Claims" value={formatNumber(payerList.reduce((s, r) => s + r.claims, 0))} />
        <StatBox label="Avg Denial Rate" value={`${avgDenial}%`} />
      </div>
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Revenue by Payer</CardTitle><CardDescription>Revenue distribution across insurance providers</CardDescription></CardHeader>
        <CardContent><BarChartCard data={chartData} xKey="name" bars={[{ key: 'revenue', color: 'hsl(var(--chart-1))', name: 'Revenue' }]} /></CardContent>
      </Card>
      <DataTable columns={columns} data={payerList} searchKey="provider" searchPlaceholder="Search payers..." />
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
