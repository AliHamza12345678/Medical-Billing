'use client';

import { Download, TrendingUp } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { AreaChartCard, BarChartCard } from '@/components/features/charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { monthlyRevenue, revenueTrend } from '@/data/reports';
import { formatCurrency } from '@/lib/format';

export default function RevenueReportPage() {
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalClaims = monthlyRevenue.reduce((s, m) => s + m.claims, 0);
  const totalPaid = monthlyRevenue.reduce((s, m) => s + m.paid, 0);
  const avgMonthly = totalRevenue / monthlyRevenue.length;

  return (
    <DashboardShell>
      <PageHeader
        title="Revenue Report"
        description="Monthly revenue performance and trends"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports', href: '/reports' }, { label: 'Revenue' }]}
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <StatBox label="Avg Monthly" value={formatCurrency(avgMonthly)} />
        <StatBox label="Total Claims" value={String(totalClaims)} />
        <StatBox label="Claims Paid" value={String(totalPaid)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue Over Time</CardTitle><CardDescription>Monthly revenue trend</CardDescription></CardHeader>
          <CardContent>
            <AreaChartCard data={monthlyRevenue} xKey="month" areas={[{ key: 'revenue', color: 'hsl(var(--chart-1))', name: 'Revenue' }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue vs Target</CardTitle><CardDescription>Actual performance against goals</CardDescription></CardHeader>
          <CardContent>
            <BarChartCard data={revenueTrend} xKey="month" bars={[
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
              {monthlyRevenue.map((m) => (
                <TableRow key={m.month}>
                  <TableCell className="font-medium">{m.month}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(m.revenue)}</TableCell>
                  <TableCell className="text-right">{m.claims}</TableCell>
                  <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{m.paid}</TableCell>
                  <TableCell className="text-right">{((m.paid / m.claims) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
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
