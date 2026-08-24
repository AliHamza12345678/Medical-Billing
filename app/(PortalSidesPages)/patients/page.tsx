'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Users, UserPlus, Download, MoreHorizontal, Eye, Edit, FileText } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
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
import { formatCurrency, formatDate, age } from '@/lib/format';
import type { Patient } from '@/types';

import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientsPage() {
  const router = useRouter();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchPatients = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setPatientList(data.data);
      } else {
        setPatientList([]);
      }
    } catch (err) {
      console.error('[FETCH_PATIENTS_ERROR]', err);
      setPatientList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDeletePatient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete patient '${name}'?`)) return;
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Patient deleted', { description: `Patient '${name}' has been soft-deleted.` });
        fetchPatients();
      } else {
        toast.error('Deletion failed', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[DELETE_PATIENT_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error deleting patient' });
    }
  };

  const filtered = React.useMemo(
    () => (statusFilter === 'all' ? patientList : patientList.filter((p) => p.status === statusFilter)),
    [statusFilter, patientList]
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
              <AvatarFallback className={`${p.avatarColor || 'bg-blue-500'} text-xs font-semibold text-white`}>
                {`${(p.firstName || '')[0] || ''}${(p.lastName || '')[0] || ''}`}
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
            <p>{age(String(p.dateOfBirth))} yrs</p>
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
          <p className="truncate font-medium">{row.original.insurance && row.original.insurance[0]?.provider ? row.original.insurance[0].provider : 'Self Pay'}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.insurance?.length || 0} plan{(row.original.insurance?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => (
        <span className={Number(row.original.balance) > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-medium'}>
          {formatCurrency(Number(row.original.balance))}
        </span>
      ),
    },
    {
      accessorKey: 'lastVisit',
      header: 'Last Visit',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.lastVisit ? formatDate(String(row.original.lastVisit)) : 'None'}</span>,
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
            <DropdownMenuItem onClick={() => router.push(`/claims?search=${row.original.mrn}`)}>
              <FileText className="mr-2 h-4 w-4" /> View Claims
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDeletePatient(row.original.id, `${row.original.firstName} ${row.original.lastName}`)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Patient
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
        description={`${patientList.length} patients in your practice`}
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
