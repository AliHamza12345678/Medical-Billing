'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, DollarSign } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { feeSchedule } from '@/data/users';
import { formatCurrency, formatDate } from '@/lib/format';
import type { FeeSchedule } from '@/types';

export default function FeeSchedulePage() {
  const [providerFilter, setProviderFilter] = React.useState('all');
  const filtered = providerFilter === 'all' ? feeSchedule : feeSchedule.filter((f) => f.provider === providerFilter);

  const columns: ColumnDef<FeeSchedule>[] = [
    { accessorKey: 'cptCode', header: 'CPT', cell: ({ row }) => <span className="font-mono text-sm font-semibold text-primary">{row.original.cptCode}</span> },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'provider', header: 'Provider' },
    { accessorKey: 'standardRate', header: 'Standard', cell: ({ row }) => formatCurrency(row.original.standardRate) },
    { accessorKey: 'negotiatedRate', header: 'Negotiated', cell: ({ row }) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.original.negotiatedRate)}</span> },
    { accessorKey: 'effectiveDate', header: 'Effective', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.effectiveDate)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const providers = Array.from(new Set(feeSchedule.map((f) => f.provider)));

  return (
    <DashboardShell>
      <PageHeader
        title="Fee Schedule"
        description="Negotiated rates by provider and procedure code"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Fee Schedule' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Add Rate</Button>}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="description"
        searchPlaceholder="Search fee schedule..."
        toolbar={
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
    </DashboardShell>
  );
}
