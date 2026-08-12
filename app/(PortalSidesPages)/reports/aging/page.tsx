'use client';

import { Download, Hourglass } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { BarChartCard, DonutChartCard } from '@/components/features/charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { agingReport, outstandingBuckets } from '@/data/reports';
import { formatCurrency } from '@/lib/format';

const donutData = outstandingBuckets.map((b, i) => ({
  name: b.bucket,
  value: b.amount,
  color: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'][i],
}));

export default function AgingReportPage() {
  const total = agingReport.reduce((s, r) => s + r.amount, 0);

  return (
    <DashboardShell>
      <PageHeader
        title="Aging Report"
        description="Outstanding balances by age bucket"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports', href: '/reports' }, { label: 'Aging' }]}
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Outstanding by Bucket</CardTitle><CardDescription>Amounts owed grouped by days outstanding</CardDescription></CardHeader>
          <CardContent>
            <BarChartCard data={outstandingBuckets} xKey="bucket" bars={[{ key: 'amount', color: 'hsl(var(--chart-3))', name: 'Outstanding' }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Distribution</CardTitle><CardDescription>Share of total outstanding</CardDescription></CardHeader>
          <CardContent><DonutChartCard data={donutData} height={260} /></CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Detailed Aging</CardTitle><CardDescription>{formatCurrency(total)} total outstanding across {agingReport.reduce((s, r) => s + r.claims, 0)} claims</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Aging Bucket</TableHead>
                <TableHead className="text-right">Claims</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
                <TableHead>Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agingReport.map((row) => (
                <TableRow key={row.bucket}>
                  <TableCell className="font-medium">{row.bucket}</TableCell>
                  <TableCell className="text-right">{row.claims}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(row.amount)}</TableCell>
                  <TableCell className="text-right">{row.percent}%</TableCell>
                  <TableCell><div className="w-32"><Progress value={row.percent} className="h-2" /></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
