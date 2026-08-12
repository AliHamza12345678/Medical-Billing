'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Building2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { insuranceProviders } from '@/data/insurance';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { InsuranceProvider } from '@/types';

export default function AdminInsuranceProvidersPage() {
  const columns: ColumnDef<InsuranceProvider>[] = [
    {
      accessorKey: 'name', header: 'Provider',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${row.original.logoColor} text-white`}><Building2 className="h-4 w-4" /></div>
          <div><p className="text-sm font-medium">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.payerId}</p></div>
        </div>
      ),
    },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'claimsSubmitted', header: 'Claims', cell: ({ row }) => formatNumber(row.original.claimsSubmitted) },
    { accessorKey: 'avgProcessingDays', header: 'Avg Days' },
    { accessorKey: 'totalRevenue', header: 'Revenue', cell: ({ row }) => formatCurrency(row.original.totalRevenue) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Insurance Providers"
        description="Administrative management of payer relationships"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Insurance Providers' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Add Provider</Button>}
      />
      <DataTable columns={columns} data={insuranceProviders} searchKey="name" searchPlaceholder="Search providers..." />
    </DashboardShell>
  );
}
