'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { RotateCcw, Plus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { payments } from '@/data/payments';
import { formatCurrency, formatDate } from '@/lib/format';

export default function RefundsPage() {
  const refunds = payments.filter((p) => p.status === 'Refunded' || p.type === 'Refund');

  const columns: ColumnDef<(typeof refunds)[number]>[] = [
    { accessorKey: 'paymentNumber', header: 'Refund #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.paymentNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.date)}</span> },
    { accessorKey: 'method', header: 'Method' },
    { accessorKey: 'reason', header: 'Reason', cell: ({ row }) => <span className="text-sm">{row.original.reference}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(row.original.amount)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const total = refunds.reduce((s, r) => s + r.amount, 0);

  return (
    <DashboardShell>
      <PageHeader
        title="Refunds"
        description="Process and track patient refunds"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Payments', href: '/payments' }, { label: 'Refunds' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Process Refund</Button>}
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"><RotateCcw className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Total Refunds</p><p className="text-xl font-bold">{refunds.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"><RotateCcw className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Refund Amount</p><p className="text-xl font-bold">{formatCurrency(total)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><RotateCcw className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Avg Refund</p><p className="text-xl font-bold">{formatCurrency(refunds.length ? total / refunds.length : 0)}</p></div>
        </CardContent></Card>
      </div>
      <DataTable columns={columns} data={refunds} searchKey="patientName" searchPlaceholder="Search refunds..." />
    </DashboardShell>
  );
}
