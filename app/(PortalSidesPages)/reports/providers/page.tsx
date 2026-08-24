'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { BarChartCard } from '@/components/features/charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';
import type { ProviderReportRow } from '@/types';

export default function ProviderReportPage() {
  const [providerList, setProviderList] = useState<ProviderReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviderReport = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/providers');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setProviderList(data.data);
      }
    } catch (err) {
      console.error('[FETCH_PROVIDER_REPORT_ERROR]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviderReport();
  }, [fetchProviderReport]);

  const chartData = (providerList || []).map((p) => ({
    name: String(p?.provider || 'Provider').replace('Dr. ', ''),
    revenue: Number(p?.revenue || 0),
    claims: Number(p?.claims || 0),
  }));

  const totalRevenue = (providerList || []).reduce((s, p) => s + Number(p?.revenue || 0), 0);
  const totalClaimsCount = (providerList || []).reduce((s, p) => s + Number(p?.claims || 0), 0);
  const avgCollection = providerList.length
    ? (providerList.reduce((s, p) => s + Number(p?.collectionRate || 0), 0) / providerList.length).toFixed(1)
    : '0.0';

  return (
    <DashboardShell>
      <PageHeader
        title="Provider Report"
        description="Performance metrics by healthcare provider"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports', href: '/reports' }, { label: 'Providers' }]}
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Total Providers" value={String(providerList.length)} />
        <StatBox label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <StatBox label="Total Claims" value={String(totalClaimsCount)} />
        <StatBox label="Avg Collection" value={`${avgCollection}%`} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Revenue by Provider</CardTitle>
          <CardDescription>Total revenue generated per provider</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartCard data={chartData} xKey="name" bars={[{ key: 'revenue', color: 'hsl(var(--chart-1))', name: 'Revenue' }]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Provider Details</CardTitle>
          <CardDescription>Breakdown of claims, revenue, and collection rates</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Patients</TableHead>
                <TableHead className="text-right">Claims</TableHead>
                <TableHead className="text-right">Submitted</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Denied</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Collection Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(providerList || []).map((row, idx) => {
                const rate = Number(row?.collectionRate || 0);
                return (
                  <TableRow key={row?.provider || idx}>
                    <TableCell className="font-medium">{row?.provider || '—'}</TableCell>
                    <TableCell className="text-right">{Number(row?.patients || 0)}</TableCell>
                    <TableCell className="text-right">{Number(row?.claims || 0)}</TableCell>
                    <TableCell className="text-right">{Number(row?.submitted || 0)}</TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{Number(row?.paid || 0)}</TableCell>
                    <TableCell className="text-right text-rose-600 dark:text-rose-400">{Number(row?.denied || 0)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(Number(row?.revenue || 0))}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, rate))}%` }} />
                        </div>
                        <span className="text-sm font-medium">{rate}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
