'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { GenericBadge } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { auditLogs as fallbackLogs } from '@/data/users';
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
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = actionFilter !== 'all' ? `/api/admin/audit-logs?action=${actionFilter}` : '/api/admin/audit-logs';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setLogs(data.data);
      } else {
        setLogs(fallbackLogs);
      }
    } catch (err) {
      console.error('[FETCH_AUDIT_LOGS_ERROR]', err);
      setLogs(fallbackLogs);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Resource', 'Details', 'IP Address'];
    const rows = logs.map((l) => [
      l.timestamp,
      l.user,
      l.action,
      l.module,
      l.resource,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medibill_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<AuditLog>[] = [
    { accessorKey: 'timestamp', header: 'Timestamp', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDateTime(String(row.original.timestamp))}</span> },
    { accessorKey: 'user', header: 'User', cell: ({ row }) => <span className="font-medium">{row.original.user}</span> },
    { accessorKey: 'action', header: 'Action', cell: ({ row }) => <GenericBadge variant={actionVariant[row.original.action] || 'neutral'}>{row.original.action}</GenericBadge> },
    { accessorKey: 'module', header: 'Module' },
    { accessorKey: 'resource', header: 'Resource', cell: ({ row }) => <span className="font-mono text-xs">{row.original.resource}</span> },
    { accessorKey: 'details', header: 'Details', cell: ({ row }) => <span className="text-sm">{row.original.details}</span> },
    { accessorKey: 'ipAddress', header: 'IP Address', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.ipAddress}</span> },
  ];

  const actions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <DashboardShell>
      <PageHeader
        title="Audit Logs"
        description="System activity and change tracking"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Audit Logs' }]}
        actions={
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Total Events" value={String(logs.length)} />
        <StatBox label="Logins Today" value={String(logs.filter((l) => l.action === 'Login').length)} />
        <StatBox label="Deletions" value={String(logs.filter((l) => l.action === 'Delete').length)} />
        <StatBox label="Exports" value={String(logs.filter((l) => l.action === 'Export').length)} />
      </div>
      <DataTable
        columns={columns}
        data={logs}
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
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
