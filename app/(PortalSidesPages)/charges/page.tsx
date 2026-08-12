'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Calculator, DollarSign } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { chargeEntries } from '@/data/charge-entry';
import { formatCurrency, formatDate } from '@/lib/format';
import type { ChargeEntry } from '@/types';

export default function ChargeEntryPage() {
  const columns: ColumnDef<ChargeEntry>[] = [
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'cptCode', header: 'CPT', cell: ({ row }) => <span className="font-mono text-xs font-semibold text-primary">{row.original.cptCode}</span> },
    { accessorKey: 'cptDescription', header: 'Procedure', cell: ({ row }) => <span className="text-sm">{row.original.cptDescription}</span> },
    { accessorKey: 'icd10Code', header: 'ICD-10', cell: ({ row }) => <span className="font-mono text-xs">{row.original.icd10Code}</span> },
    { accessorKey: 'provider', header: 'Provider' },
    { accessorKey: 'serviceDate', header: 'Service Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.serviceDate)}</span> },
    { accessorKey: 'quantity', header: 'Qty' },
    { accessorKey: 'unitCharge', header: 'Unit', cell: ({ row }) => formatCurrency(row.original.unitCharge) },
    { accessorKey: 'totalCharge', header: 'Total', cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.totalCharge)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const totalCharges = chargeEntries.reduce((s, c) => s + c.totalCharge, 0);

  return (
    <DashboardShell>
      <PageHeader
        title="Charge Entry"
        description="Record charges for procedures and services rendered"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Charge Entry' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> New Charge</Button>}
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Calculator className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Total Charges</p><p className="text-xl font-bold">{chargeEntries.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><DollarSign className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Total Value</p><p className="text-xl font-bold">{formatCurrency(totalCharges)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><Calculator className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">Draft Charges</p><p className="text-xl font-bold">{chargeEntries.filter((c) => c.status === 'Draft').length}</p></div>
        </CardContent></Card>
      </div>
      <DataTable columns={columns} data={chargeEntries} searchKey="patientName" searchPlaceholder="Search charges..." pageSize={10} />
    </DashboardShell>
  );
}
