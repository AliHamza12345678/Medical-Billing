'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, FileCheck } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { authorizations } from '@/data/insurance';
import { formatDate } from '@/lib/format';
import type { Authorization } from '@/types';

export default function AuthorizationsPage() {
  const [statusFilter, setStatusFilter] = React.useState('all');
  const filtered = statusFilter === 'all' ? authorizations : authorizations.filter((a) => a.status === statusFilter);

  const columns: ColumnDef<Authorization>[] = [
    { accessorKey: 'authorizationNumber', header: 'Auth #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.authorizationNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'procedure', header: 'Procedure' },
    { accessorKey: 'provider', header: 'Insurer' },
    {
      accessorKey: 'visitsUsed',
      header: 'Visits Used',
      cell: ({ row }) => {
        const pct = row.original.visitsApproved > 0 ? (row.original.visitsUsed / row.original.visitsApproved) * 100 : 0;
        return (
          <div className="w-28">
            <div className="mb-1 flex justify-between text-xs"><span>{row.original.visitsUsed}/{row.original.visitsApproved}</span></div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      },
    },
    { accessorKey: 'validTo', header: 'Valid Until', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.validTo)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Authorization Numbers"
        description="Track prior authorizations and their utilization"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Insurance', href: '/insurance' }, { label: 'Authorizations' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Request Authorization</Button>}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="patientName"
        searchPlaceholder="Search authorizations..."
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Denied">Denied</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </DashboardShell>
  );
}
