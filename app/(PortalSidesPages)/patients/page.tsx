'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Users, UserPlus, Download, MoreHorizontal, Eye, Edit, FileText } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip, GenericBadge } from '@/components/features/status-chip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { patients, patientInitials } from '@/data/patients';
import { formatCurrency, formatDate, age } from '@/lib/format';
import type { Patient } from '@/types';

export default function PatientsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const filtered = React.useMemo(
    () => (statusFilter === 'all' ? patients : patients.filter((p) => p.status === statusFilter)),
    [statusFilter]
  );

  const columns: ColumnDef<Patient>[] = [
    {
      id: 'name',
      accessorKey: 'firstName',
      header: 'Patient',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className={`${p.avatarColor} text-xs font-semibold text-white`}>
                {patientInitials(p)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {p.firstName} {p.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{p.mrn}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'dateOfBirth',
      header: 'Age / Gender',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="text-sm">
            <p>{age(p.dateOfBirth)} yrs</p>
            <p className="text-xs text-muted-foreground">{p.gender}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{row.original.phone}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'insurance',
      header: 'Insurance',
      cell: ({ row }) => (
        <div className="text-sm">
          <p className="truncate font-medium">{row.original.insurance[0]?.provider}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.insurance.length} plan{row.original.insurance.length > 1 ? 's' : ''}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => (
        <span className={row.original.balance > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-medium'}>
          {formatCurrency(row.original.balance)}
        </span>
      ),
    },
    {
      accessorKey: 'lastVisit',
      header: 'Last Visit',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.lastVisit)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusChip status={row.original.status} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => router.push(`/patients/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/patients/${row.original.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Patient
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" /> View Claims
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Patients"
        description={`${patients.length} patients in your practice`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Patients' }]}
        actions={
          <>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => router.push('/patients/new')}>
              <UserPlus className="mr-2 h-4 w-4" /> Add Patient
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="firstName"
        searchPlaceholder="Search patients by name..."
        pageSize={10}
        onRowClick={(p) => router.push(`/patients/${p.id}`)}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </DashboardShell>
  );
}
