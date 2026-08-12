'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ScrollText, Download, Filter } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { GenericBadge } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { auditLogs } from '@/data/users';
import { formatDateTime } from '@/lib/format';
import type { AuditLog, AuditAction } from '@/types';

const actionVariant: Record<AuditAction, 'info' | 'success' | 'destructive' | 'warning' | 'neutral'> = {
  Create: 'success',
  Update: 'info',
  Delete: 'destructive',
  Login: 'neutral',
  Logout: 'neutral',
  View: 'neutral',
  Export: 'warning',
};

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = React.useState('all');
  const filtered = actionFilter === 'all' ? auditLogs : auditLogs.filter((l) => l.action === actionFilter);

  const columns: ColumnDef<AuditLog>[] = [
    { accessorKey: 'timestamp', header: 'Timestamp', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDateTime(row.original.timestamp)}</span> },
    { accessorKey: 'user', header: 'User', cell: ({ row }) => <span className="font-medium">{row.original.user}</span> },
    { accessorKey: 'action', header: 'Action', cell: ({ row }) => <GenericBadge variant={actionVariant[row.original.action]}>{row.original.action}</GenericBadge> },
    { accessorKey: 'module', header: 'Module' },
    { accessorKey: 'resource', header: 'Resource', cell: ({ row }) => <span className="font-mono text-xs">{row.original.resource}</span> },
    { accessorKey: 'details', header: 'Details', cell: ({ row }) => <span className="text-sm">{row.original.details}</span> },
    { accessorKey: 'ipAddress', header: 'IP Address', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.ipAddress}</span> },
  ];

  const actions = Array.from(new Set(auditLogs.map((l) => l.action)));

  return (
    <DashboardShell>
      <PageHeader
        title="Audit Logs"
        description="System activity and change tracking"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Audit Logs' }]}
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Total Events" value={String(auditLogs.length)} />
        <StatBox label="Logins Today" value={String(auditLogs.filter((l) => l.action === 'Login').length)} />
        <StatBox label="Deletions" value={String(auditLogs.filter((l) => l.action === 'Delete').length)} />
        <StatBox label="Exports" value={String(auditLogs.filter((l) => l.action === 'Export').length)} />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="user"
        searchPlaceholder="Search by user or action..."
        toolbar={
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
    </DashboardShell>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card><CardContent className="py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </CardContent></Card>
  );
}
