'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Download } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Claim, ClaimStatus } from '@/types';

export default function ClaimsListPage() {
  const router = useRouter();
  const [claimList, setClaimList] = useState<Claim[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchClaims = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'all' ? `/api/claims?status=${statusFilter}` : '/api/claims';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setClaimList(data.data);
      } else {
        setClaimList([]);
      }
    } catch (err) {
      console.error('[FETCH_CLAIMS_ERROR]', err);
      setClaimList([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const columns: ColumnDef<Claim>[] = [
    { accessorKey: 'claimNumber', header: 'Claim #', cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.claimNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'insuranceProvider', header: 'Insurer' },
    { accessorKey: 'serviceDate', header: 'Service Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original.serviceDate))}</span> },
    { accessorKey: 'submissionDate', header: 'Submitted', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original.submissionDate))}</span> },
    { accessorKey: 'billedAmount', header: 'Billed', cell: ({ row }) => formatCurrency(Number(row.original.billedAmount)) },
    { accessorKey: 'paidAmount', header: 'Paid', cell: ({ row }) => <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(row.original.paidAmount))}</span> },
    { accessorKey: 'ageDays', header: 'Age', cell: ({ row }) => <span className="text-sm">{row.original.ageDays}d</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const statuses: ClaimStatus[] = ['Submitted', 'Pending', 'Paid', 'Denied', 'Rejected'];
  const counts = Object.fromEntries(statuses.map((s) => [s, claimList.filter((c) => c.status === s).length]));

  return (
    <DashboardShell>
      <PageHeader
        title="Claims"
        description={`${claimList.length} claims in the system`}
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
          <Card key={s}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s}</p>
                  <p className="text-xl font-bold">{counts[s]}</p>
                </div>
                <StatusChip status={s} withDot={false} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={claimList}
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
