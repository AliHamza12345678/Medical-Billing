'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, MoreHorizontal, Edit, Trash2, UserCog } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { users } from '@/data/users';
import { formatDate, formatDateTime } from '@/lib/format';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback className={`${row.original.avatarColor} text-xs font-semibold text-white`}>{row.original.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback></Avatar>
          <div><p className="text-sm font-medium">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.email}</p></div>
        </div>
      ),
    },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => <span className="text-sm font-medium">{row.original.role}</span> },
    { accessorKey: 'lastLogin', header: 'Last Login', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDateTime(row.original.lastLogin)}</span> },
    { accessorKey: 'createdOn', header: 'Created', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.createdOn)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
    {
      id: 'actions', header: '',
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit User</DropdownMenuItem>
            <DropdownMenuItem><UserCog className="mr-2 h-4 w-4" /> Change Role</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Users"
        description={`${users.length} users in the system`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Users' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Add User</Button>}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Total Users" value={String(users.length)} />
        <StatBox label="Active" value={String(users.filter((u) => u.status === 'Active').length)} />
        <StatBox label="Inactive" value={String(users.filter((u) => u.status === 'Inactive').length)} />
        <StatBox label="Suspended" value={String(users.filter((u) => u.status === 'Suspended').length)} />
      </div>
      <DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Search users..." />
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
