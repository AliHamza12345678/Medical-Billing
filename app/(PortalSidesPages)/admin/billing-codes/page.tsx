'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Hash } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { procedureCodes, diagnosisCodes } from '@/data/charge-entry';
import { formatCurrency } from '@/lib/format';
import type { ProcedureCode, DiagnosisCode } from '@/types';

export default function BillingCodesPage() {
  const cptColumns: ColumnDef<ProcedureCode>[] = [
    { accessorKey: 'cptCode', header: 'CPT Code', cell: ({ row }) => <span className="font-mono text-sm font-semibold text-primary">{row.original.cptCode}</span> },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'standardCharge', header: 'Standard', cell: ({ row }) => formatCurrency(row.original.standardCharge) },
    { accessorKey: 'medicareRate', header: 'Medicare', cell: ({ row }) => formatCurrency(row.original.medicareRate) },
    { accessorKey: 'rvu', header: 'RVU', cell: ({ row }) => row.original.rvu.toFixed(2) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const icdColumns: ColumnDef<DiagnosisCode>[] = [
    { accessorKey: 'icd10Code', header: 'ICD-10 Code', cell: ({ row }) => <span className="font-mono text-sm font-semibold text-primary">{row.original.icd10Code}</span> },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Billing Codes"
        description="Manage CPT and ICD-10 code libraries"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Billing Codes' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Add Code</Button>}
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Hash className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">CPT Codes</p><p className="text-xl font-bold">{procedureCodes.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><Hash className="h-5 w-5" /></div>
          <div><p className="text-sm text-muted-foreground">ICD-10 Codes</p><p className="text-xl font-bold">{diagnosisCodes.length}</p></div>
        </CardContent></Card>
      </div>
      <Tabs defaultValue="cpt">
        <TabsList className="mb-4"><TabsTrigger value="cpt">CPT Codes</TabsTrigger><TabsTrigger value="icd">ICD-10 Codes</TabsTrigger></TabsList>
        <TabsContent value="cpt"><DataTable columns={cptColumns} data={procedureCodes} searchKey="description" searchPlaceholder="Search CPT codes..." /></TabsContent>
        <TabsContent value="icd"><DataTable columns={icdColumns} data={diagnosisCodes} searchKey="description" searchPlaceholder="Search ICD-10 codes..." /></TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
