'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Download, FileText, Filter } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { claims } from '@/data/claims';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Claim, ClaimStatus } from '@/types';

export default function ClaimsListPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const filtered = statusFilter === 'all' ? claims : claims.filter((c) => c.status === statusFilter);

  const columns: ColumnDef<Claim>[] = [
    { accessorKey: 'claimNumber', header: 'Claim #', cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.claimNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'insuranceProvider', header: 'Insurer' },
    { accessorKey: 'serviceDate', header: 'Service Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.serviceDate)}</span> },
    { accessorKey: 'submissionDate', header: 'Submitted', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.submissionDate)}</span> },
    { accessorKey: 'billedAmount', header: 'Billed', cell: ({ row }) => formatCurrency(row.original.billedAmount) },
    { accessorKey: 'paidAmount', header: 'Paid', cell: ({ row }) => <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(row.original.paidAmount)}</span> },
    { accessorKey: 'ageDays', header: 'Age', cell: ({ row }) => <span className="text-sm">{row.original.ageDays}d</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const statuses: ClaimStatus[] = ['Submitted', 'Pending', 'Paid', 'Denied', 'Rejected'];
  const counts = Object.fromEntries(statuses.map((s) => [s, claims.filter((c) => c.status === s).length]));

  return (
    <DashboardShell>
      <PageHeader
        title="Claims"
        description={`${claims.length} claims in the system`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Claims' }]}
        actions={
          <>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button onClick={() => router.push('/claims/new')}><Plus className="mr-2 h-4 w-4" /> Create Claim</Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statuses.map((s) => (
          <Card key={s}><CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s}</p>
                <p className="text-xl font-bold">{counts[s]}</p>
              </div>
              <StatusChip status={s} withDot={false} />
            </div>
          </CardContent></Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="patientName"
        searchPlaceholder="Search by patient or claim #..."
        onRowClick={(c) => router.push(`/claims/${c.id}`)}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
    </DashboardShell>
  );
}
