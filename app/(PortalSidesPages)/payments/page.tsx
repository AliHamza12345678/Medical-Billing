'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Download, CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { payments } from '@/data/payments';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Payment } from '@/types';

export default function PaymentHistoryPage() {
  const [methodFilter, setMethodFilter] = React.useState('all');
  const filtered = methodFilter === 'all' ? payments : payments.filter((p) => p.method === methodFilter);

  const columns: ColumnDef<Payment>[] = [
    { accessorKey: 'paymentNumber', header: 'Payment #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.paymentNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.date)}</span> },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'method', header: 'Method' },
    { accessorKey: 'appliedTo', header: 'Applied To', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.appliedTo}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.amount)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const totalPaid = payments.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const totalRefunded = payments.filter((p) => p.status === 'Refunded').reduce((s, p) => s + p.amount, 0);

  const methods = Array.from(new Set(payments.map((p) => p.method)));

  return (
    <DashboardShell>
      <PageHeader
        title="Payment History"
        description={`${payments.length} payments recorded`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Payments' }]}
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><DollarSign className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Total Paid</p><p className="text-xl font-bold">{formatCurrency(totalPaid)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><CreditCard className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Pending</p><p className="text-xl font-bold">{formatCurrency(totalPending)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"><TrendingUp className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Refunded</p><p className="text-xl font-bold">{formatCurrency(totalRefunded)}</p></div>
        </CardContent></Card>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="patientName"
        searchPlaceholder="Search payments..."
        toolbar={
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {methods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
    </DashboardShell>
  );
}
