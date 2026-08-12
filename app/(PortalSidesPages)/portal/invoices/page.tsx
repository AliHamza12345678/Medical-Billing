'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Download, Eye } from 'lucide-react';
import { PortalLayout } from '@/components/layout/portal-layout';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { portalInvoices } from '@/data/dashboard';
import { formatCurrency, formatDate } from '@/lib/format';

type PortalInvoice = (typeof portalInvoices)[number];

export default function PortalInvoicesPage() {
  const columns: ColumnDef<PortalInvoice>[] = [
    { accessorKey: 'number', header: 'Invoice #', cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.number}</span> },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.date)}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: 'balance', header: 'Balance', cell: ({ row }) => <span className={row.original.balance > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-medium'}>{formatCurrency(row.original.balance)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <PortalLayout>
      <h2 className="mb-4 text-lg font-bold">My Invoices</h2>
      <DataTable columns={columns} data={portalInvoices} searchKey="number" searchPlaceholder="Search invoices..." />
    </PortalLayout>
  );
}
