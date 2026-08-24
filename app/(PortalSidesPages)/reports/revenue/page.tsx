'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { AreaChartCard, BarChartCard } from '@/components/features/charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';

export default function RevenueReportPage() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [totalRevenueVal, setTotalRevenueVal] = useState(0);
  const [avgMonthlyVal, setAvgMonthlyVal] = useState(0);
  const [totalClaimsVal, setTotalClaimsVal] = useState(0);
  const [totalPaidVal, setTotalPaidVal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRevenueReport = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/revenue');
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        if (data.data.totalRevenue !== undefined) setTotalRevenueVal(data.data.totalRevenue);
        if (data.data.avgMonthly !== undefined) setAvgMonthlyVal(data.data.avgMonthly);
        if (data.data.totalClaims !== undefined) setTotalClaimsVal(data.data.totalClaims);
        if (data.data.totalPaid !== undefined) setTotalPaidVal(data.data.totalPaid);
        if (Array.isArray(data.data.monthlyRevenue)) setMonthlyData(data.data.monthlyRevenue);
        if (Array.isArray(data.data.revenueTrend)) setTrendData(data.data.revenueTrend);
      }
    } catch (err) {
      console.error('[FETCH_REVENUE_REPORT_ERROR]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueReport();
  }, [fetchRevenueReport]);

  return (
    <DashboardShell>
      <PageHeader
        title="Revenue Report"
        description="Monthly revenue performance and trends"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports', href: '/reports' }, { label: 'Revenue' }]}
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Total Revenue" value={formatCurrency(totalRevenueVal)} />
        <StatBox label="Avg Monthly" value={formatCurrency(avgMonthlyVal)} />
        <StatBox label="Total Claims" value={String(totalClaimsVal)} />
        <StatBox label="Claims Paid" value={String(totalPaidVal)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue Over Time</CardTitle><CardDescription>Monthly revenue trend</CardDescription></CardHeader>
          <CardContent>
            <AreaChartCard data={monthlyData} xKey="month" areas={[{ key: 'revenue', color: 'hsl(var(--chart-1))', name: 'Revenue' }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue vs Target</CardTitle><CardDescription>Actual performance against goals</CardDescription></CardHeader>
          <CardContent>
            <BarChartCard data={trendData} xKey="month" bars={[
              { key: 'revenue', color: 'hsl(var(--chart-1))', name: 'Revenue' },
              { key: 'target', color: 'hsl(var(--chart-3))', name: 'Target' },
            ]} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Monthly Breakdown</CardTitle><CardDescription>Detailed revenue and claims by month</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Claims</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Paid Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((m, idx) => {
                const revenue = Number(m?.revenue || 0);
                const claims = Number(m?.claims || 0);
                const paid = Number(m?.paid || 0);
                const paidRate = claims > 0 ? ((paid / claims) * 100).toFixed(1) : '0.0';
                return (
                  <TableRow key={m?.month || idx}>
                    <TableCell className="font-medium">{m?.month || '—'}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(revenue)}</TableCell>
                    <TableCell className="text-right">{claims}</TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{paid}</TableCell>
                    <TableCell className="text-right">{paidRate}%</TableCell>
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
    <Card><CardContent className="py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </CardContent></Card>
  );
}
