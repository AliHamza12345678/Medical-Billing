'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { GenericBadge } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { adjustments } from '@/data/payments';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Adjustment, AdjustmentType } from '@/types';

const typeVariant: Record<AdjustmentType, 'info' | 'warning' | 'destructive' | 'success' | 'neutral'> = {
  'Contractual Adjustment': 'info',
  'Write-off': 'warning',
  Refund: 'destructive',
  Administrative: 'neutral',
  'Coding Correction': 'success',
};

export default function AdjustmentsPage() {
  const [typeFilter, setTypeFilter] = React.useState('all');
  const filtered = typeFilter === 'all' ? adjustments : adjustments.filter((a) => a.type === typeFilter);

  const columns: ColumnDef<Adjustment>[] = [
    { accessorKey: 'adjustmentNumber', header: 'Adj #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.adjustmentNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'claimNumber', header: 'Claim', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.claimNumber}</span> },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <GenericBadge variant={typeVariant[row.original.type]}>{row.original.type}</GenericBadge> },
    { accessorKey: 'reason', header: 'Reason', cell: ({ row }) => <span className="text-sm">{row.original.reason}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className={row.original.type === 'Refund' ? 'font-semibold text-rose-600 dark:text-rose-400' : 'font-semibold'}>{formatCurrency(row.original.amount)}</span> },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.date)}</span> },
    { accessorKey: 'postedBy', header: 'Posted By' },
  ];

  const types = Array.from(new Set(adjustments.map((a) => a.type)));
  const total = adjustments.reduce((s, a) => s + a.amount, 0);

  return (
    <DashboardShell>
      <PageHeader
        title="Adjustments"
        description="Contractual write-offs, corrections, and administrative adjustments"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Payments', href: '/payments' }, { label: 'Adjustments' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> New Adjustment</Button>}
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><SlidersHorizontal className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Total Adjustments</p><p className="text-xl font-bold">{adjustments.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><SlidersHorizontal className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Total Amount</p><p className="text-xl font-bold">{formatCurrency(total)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><SlidersHorizontal className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Avg Adjustment</p><p className="text-xl font-bold">{formatCurrency(adjustments.length ? total / adjustments.length : 0)}</p></div>
        </CardContent></Card>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="patientName"
        searchPlaceholder="Search adjustments..."
        toolbar={
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
    </DashboardShell>
  );
}
