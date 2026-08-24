'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { eligibilityVerifications as fallbackVerifications } from '@/data/insurance';
import { formatCurrency, formatDate } from '@/lib/format';
import type { EligibilityVerification } from '@/types';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function EligibilityPage() {
  const [records, setRecords] = useState<EligibilityVerification[]>(fallbackVerifications);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', provider: 'Blue Cross Blue Shield', memberId: 'MEM-99231', planName: 'PPO Choice Plus',
  });

  const fetchEligibilityRecords = async () => {
    try {
      const url = statusFilter !== 'all' ? `/api/insurance/eligibility?status=${statusFilter}` : '/api/insurance/eligibility';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error('[FETCH_ELIGIBILITY_ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibilityRecords();
  }, [statusFilter]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/insurance/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Eligibility verified via X12 270/271 EDI', {
          description: `Status: ${data.data.status} | Copay: $${data.data.copay}`,
        });
        setIsModalOpen(false);
        fetchEligibilityRecords();
      } else {
        toast.error('Verification failed', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[VERIFY_ELIGIBILITY_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error verifying eligibility' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<EligibilityVerification>[] = [
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original?.patientName || '—'}</span> },
    { accessorKey: 'provider', header: 'Provider', cell: ({ row }) => row.original?.provider || '—' },
    { accessorKey: 'planName', header: 'Plan', cell: ({ row }) => row.original?.planName || '—' },
    { accessorKey: 'memberId', header: 'Member ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original?.memberId || '—'}</span> },
    { accessorKey: 'copay', header: 'Copay', cell: ({ row }) => formatCurrency(Number(row.original?.copay || 0)) },
    { accessorKey: 'deductibleRemaining', header: 'Deductible Left', cell: ({ row }) => formatCurrency(Number(row.original?.deductibleRemaining || 0)) },
    { accessorKey: 'coveragePercent', header: 'Coverage', cell: ({ row }) => `${Number(row.original?.coveragePercent || 0)}%` },
    { accessorKey: 'verificationDate', header: 'Verified', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original?.verificationDate || new Date()))}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original?.status || 'Verified'} /> },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Eligibility Verification"
        description="Verify patient insurance coverage and benefits in real time"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Insurance', href: '/insurance' }, { label: 'Eligibility' }]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Verification
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={records}
        searchKey="patientName"
        searchPlaceholder="Search by patient..."
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Not Found">Not Found</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Insurance Eligibility</DialogTitle>
            <DialogDescription>Submit an ANSI X12 270 transaction request to clearinghouse.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerify} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Patient ID</Label>
              <Input required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} placeholder="Enter Patient ID (or UUID)" />
            </div>
            <div className="space-y-1">
              <Label>Insurance Payer</Label>
              <Input required value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} placeholder="Blue Cross" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Member ID</Label>
                <Input required value={formData.memberId} onChange={(e) => setFormData({ ...formData, memberId: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Plan Name</Label>
                <Input required value={formData.planName} onChange={(e) => setFormData({ ...formData, planName: e.target.value })} />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Verifying 270 EDI...' : 'Run Verification'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
