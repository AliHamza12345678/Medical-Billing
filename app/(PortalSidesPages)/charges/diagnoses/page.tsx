'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { diagnosisCodes } from '@/data/charge-entry';
import type { DiagnosisCode } from '@/types';

export default function DiagnosisCodesPage() {
  const [category, setCategory] = React.useState('all');
  const filtered = category === 'all' ? diagnosisCodes : diagnosisCodes.filter((c) => c.category === category);

  const columns: ColumnDef<DiagnosisCode>[] = [
    { accessorKey: 'icd10Code', header: 'ICD-10 Code', cell: ({ row }) => <span className="font-mono text-sm font-semibold text-primary">{row.original.icd10Code}</span> },
    { accessorKey: 'description', header: 'Description', cell: ({ row }) => <span className="text-sm">{row.original.description}</span> },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const categories = Array.from(new Set(diagnosisCodes.map((c) => c.category)));

  return (
    <DashboardShell>
      <PageHeader
        title="Diagnosis Codes (ICD-10)"
        description="Manage International Classification of Diseases codes"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Charge Entry', href: '/charges' }, { label: 'Diagnosis Codes' }]}
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
