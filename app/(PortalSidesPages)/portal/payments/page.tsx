'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { PortalLayout } from '@/components/layout/portal-layout';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { portalPayments } from '@/data/dashboard';
import { formatCurrency, formatDate } from '@/lib/format';

type PortalPayment = (typeof portalPayments)[number];

export default function PortalPaymentsPage() {
  const columns: ColumnDef<PortalPayment>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.date)}</span> },
    { accessorKey: 'invoice', header: 'Invoice', cell: ({ row }) => <span className="font-mono text-xs">{row.original.invoice}</span> },
    { accessorKey: 'method', header: 'Method' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.amount)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const totalPaid = portalPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <PortalLayout>
      <h2 className="mb-4 text-lg font-bold">Payment History</h2>
      <p className="mb-4 text-sm text-muted-foreground">You have paid {formatCurrency(totalPaid)} across {portalPayments.length} payments.</p>
      <DataTable columns={columns} data={portalPayments} searchKey="method" searchPlaceholder="Search payments..." />
    </PortalLayout>
  );
}
