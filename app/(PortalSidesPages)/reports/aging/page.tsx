'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { BarChartCard, DonutChartCard } from '@/components/features/charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';

export default function AgingReportPage() {
  const [bucketsData, setBucketsData] = useState<any[]>([]);
  const [agingData, setAgingData] = useState<any[]>([]);
  const [totalVal, setTotalVal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAgingReport = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/aging');
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        if (Array.isArray(data.data.outstandingBuckets)) setBucketsData(data.data.outstandingBuckets);
        if (Array.isArray(data.data.agingReport)) setAgingData(data.data.agingReport);
        if (data.data.totalAmount !== undefined) setTotalVal(data.data.totalAmount);
      }
    } catch (err) {
      console.error('[FETCH_AGING_REPORT_ERROR]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgingReport();
  }, [fetchAgingReport]);

  const donutData = (bucketsData || []).map((b, i) => ({
    name: String(b?.bucket || 'Bucket'),
    value: Number(b?.amount || 0),
    color: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'][i % 5],
  }));

  const totalClaims = (agingData || []).reduce((s, r) => s + Number(r?.claims || 0), 0);

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
            <BarChartCard data={bucketsData} xKey="bucket" bars={[{ key: 'amount', color: 'hsl(var(--chart-3))', name: 'Outstanding' }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Distribution</CardTitle><CardDescription>Share of total outstanding</CardDescription></CardHeader>
          <CardContent><DonutChartCard data={donutData} height={260} /></CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Detailed Aging</CardTitle><CardDescription>{formatCurrency(totalVal)} total outstanding across {totalClaims} claims</CardDescription></CardHeader>
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
              {(agingData || []).map((row, idx) => {
                const claims = Number(row?.claims || 0);
                const amount = Number(row?.amount || 0);
                const percent = Number(row?.percent || 0);
                return (
                  <TableRow key={row?.bucket || idx}>
                    <TableCell className="font-medium">{row?.bucket || '—'}</TableCell>
                    <TableCell className="text-right">{claims}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(amount)}</TableCell>
                    <TableCell className="text-right">{percent}%</TableCell>
                    <TableCell>
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-amber-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
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
