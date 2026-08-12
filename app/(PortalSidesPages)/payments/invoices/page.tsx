'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Download, FileText, Eye } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { invoices } from '@/data/payments';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Invoice } from '@/types';

export default function InvoicesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const filtered = statusFilter === 'all' ? invoices : invoices.filter((i) => i.status === statusFilter);

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'invoiceNumber', header: 'Invoice #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.invoiceNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'issueDate', header: 'Issued', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.issueDate)}</span> },
    { accessorKey: 'dueDate', header: 'Due', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.dueDate)}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: 'paidAmount', header: 'Paid', cell: ({ row }) => <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(row.original.paidAmount)}</span> },
    { accessorKey: 'balance', header: 'Balance', cell: ({ row }) => <span className={row.original.balance > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-medium'}>{formatCurrency(row.original.balance)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/payments/invoices/${row.original.id}`); }}>
          <Eye className="mr-1.5 h-3.5 w-3.5" /> View
        </Button>
      ),
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Invoices"
        description={`${invoices.length} invoices generated`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Payments', href: '/payments' }, { label: 'Invoices' }]}
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="patientName"
        searchPlaceholder="Search invoices..."
        onRowClick={(inv) => router.push(`/payments/invoices/${inv.id}`)}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </DashboardShell>
  );
}
