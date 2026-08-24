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

  const chartData = (payerList || []).map((r) => ({
    name: String(r?.provider || 'Provider').slice(0, 12),
    revenue: Number(r?.revenue || 0),
    denialRate: Number(r?.denialRate || 0),
  }));

  const totalRevenue = (payerList || []).reduce((s, r) => s + Number(r?.revenue || 0), 0);
  const totalClaimsCount = (payerList || []).reduce((s, r) => s + Number(r?.claims || 0), 0);
  const avgDenial = payerList.length
    ? (payerList.reduce((s, r) => s + Number(r?.denialRate || 0), 0) / payerList.length).toFixed(1)
    : '0.0';

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
        <StatBox label="Total Claims" value={formatNumber(totalClaimsCount)} />
        <StatBox label="Avg Denial Rate" value={`${avgDenial}%`} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Revenue by Payer</CardTitle>
          <CardDescription>Revenue distribution across insurance providers</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartCard data={chartData} xKey="name" bars={[{ key: 'revenue', color: 'hsl(var(--chart-1))', name: 'Revenue' }]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payer Performance</CardTitle>
          <CardDescription>Comprehensive breakdown of insurance claims and processing times</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Claims</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Denied</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg Days</TableHead>
                <TableHead className="text-right">Denial Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payerList || []).map((row, idx) => {
                const rate = Number(row?.denialRate || 0);
                return (
                  <TableRow key={row?.provider || idx}>
                    <TableCell className="font-medium">{row?.provider || '—'}</TableCell>
                    <TableCell className="text-right">{formatNumber(Number(row?.claims || 0))}</TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{formatNumber(Number(row?.paid || 0))}</TableCell>
                    <TableCell className="text-right text-rose-600 dark:text-rose-400">{formatNumber(Number(row?.denied || 0))}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(Number(row?.revenue || 0))}</TableCell>
                    <TableCell className="text-right">{Number(row?.avgDays || 0)}d</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full bg-rose-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, rate))}%` }} />
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
