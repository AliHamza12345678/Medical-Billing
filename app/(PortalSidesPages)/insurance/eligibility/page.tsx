'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { BadgeCheck, RotateCw, Plus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { eligibilityVerifications } from '@/data/insurance';
import { formatCurrency, formatDate } from '@/lib/format';
import type { EligibilityVerification } from '@/types';

export default function EligibilityPage() {
  const [statusFilter, setStatusFilter] = React.useState('all');
  const filtered = statusFilter === 'all' ? eligibilityVerifications : eligibilityVerifications.filter((e) => e.status === statusFilter);

  const columns: ColumnDef<EligibilityVerification>[] = [
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'provider', header: 'Provider' },
    { accessorKey: 'planName', header: 'Plan' },
    { accessorKey: 'memberId', header: 'Member ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.memberId}</span> },
    { accessorKey: 'copay', header: 'Copay', cell: ({ row }) => formatCurrency(row.original.copay) },
    { accessorKey: 'deductibleRemaining', header: 'Deductible Left', cell: ({ row }) => formatCurrency(row.original.deductibleRemaining) },
    { accessorKey: 'coveragePercent', header: 'Coverage', cell: ({ row }) => `${row.original.coveragePercent}%` },
    { accessorKey: 'verificationDate', header: 'Verified', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.verificationDate)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Eligibility Verification"
        description="Verify patient insurance coverage and benefits in real time"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Insurance', href: '/insurance' }, { label: 'Eligibility' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> New Verification</Button>}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="patientName"
        searchPlaceholder="Search by patient..."
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Not Found">Not Found</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </DashboardShell>
  );
}
