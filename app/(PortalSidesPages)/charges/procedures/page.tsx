'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Stethoscope } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { procedureCodes } from '@/data/charge-entry';
import { formatCurrency } from '@/lib/format';
import type { ProcedureCode } from '@/types';

export default function ProcedureCodesPage() {
  const [category, setCategory] = React.useState('all');
  const filtered = category === 'all' ? procedureCodes : procedureCodes.filter((c) => c.category === category);

  const columns: ColumnDef<ProcedureCode>[] = [
    { accessorKey: 'cptCode', header: 'CPT Code', cell: ({ row }) => <span className="font-mono text-sm font-semibold text-primary">{row.original.cptCode}</span> },
    { accessorKey: 'description', header: 'Description', cell: ({ row }) => <span className="text-sm">{row.original.description}</span> },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'standardCharge', header: 'Standard Charge', cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.standardCharge)}</span> },
    { accessorKey: 'medicareRate', header: 'Medicare Rate', cell: ({ row }) => formatCurrency(row.original.medicareRate) },
    { accessorKey: 'rvu', header: 'RVU', cell: ({ row }) => row.original.rvu.toFixed(2) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const categories = Array.from(new Set(procedureCodes.map((c) => c.category)));

  return (
    <DashboardShell>
      <PageHeader
        title="Procedure Codes (CPT)"
        description="Manage Current Procedural Terminology codes and pricing"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Charge Entry', href: '/charges' }, { label: 'Procedure Codes' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Add Code</Button>}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="description"
        searchPlaceholder="Search by description or code..."
        toolbar={
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
    </DashboardShell>
  );
}
