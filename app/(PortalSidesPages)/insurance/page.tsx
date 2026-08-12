'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Building2, Phone, Mail, TrendingUp, DollarSign } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { insuranceProviders } from '@/data/insurance';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { InsuranceProvider } from '@/types';

export default function InsuranceProvidersPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = React.useState('all');

  const filtered = typeFilter === 'all' ? insuranceProviders : insuranceProviders.filter((p) => p.type === typeFilter);

  const columns: ColumnDef<InsuranceProvider>[] = [
    {
      accessorKey: 'name',
      header: 'Provider',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${row.original.logoColor} text-white`}>
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">Payer ID: {row.original.payerId}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'type', header: 'Plan Type', cell: ({ row }) => <span className="text-sm">{row.original.type}</span> },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{row.original.phone}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'claimsSubmitted',
      header: 'Claims',
      cell: ({ row }) => (
        <div className="text-sm">
          <p className="font-medium">{formatNumber(row.original.claimsSubmitted)}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">{formatNumber(row.original.claimsPaid)} paid</p>
        </div>
      ),
    },
    {
      accessorKey: 'avgProcessingDays',
      header: 'Avg Days',
      cell: ({ row }) => <span className="text-sm">{row.original.avgProcessingDays} days</span>,
    },
    {
      accessorKey: 'totalRevenue',
      header: 'Revenue',
      cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.totalRevenue)}</span>,
    },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const types = Array.from(new Set(insuranceProviders.map((p) => p.type)));
  const totalRevenue = insuranceProviders.reduce((s, p) => s + p.totalRevenue, 0);
  const totalClaims = insuranceProviders.reduce((s, p) => s + p.claimsSubmitted, 0);
  const activeProviders = insuranceProviders.filter((p) => p.status === 'Active').length;

  return (
    <DashboardShell>
      <PageHeader
        title="Insurance Providers"
        description="Manage payer relationships and track performance"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Insurance', href: '/insurance' }, { label: 'Providers' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Add Provider</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Active Providers</p><p className="text-xl font-bold">{activeProviders}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><TrendingUp className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Total Claims</p><p className="text-xl font-bold">{formatNumber(totalClaims)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><DollarSign className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p></div>
        </CardContent></Card>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="name"
        searchPlaceholder="Search providers..."
        onRowClick={(p) => router.push(`/insurance/${p.id}`)}
        toolbar={
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Plan type" /></SelectTrigger>
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
