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
import { Progress } from '@/components/ui/progress';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { authorizations as fallbackAuthorizations } from '@/data/insurance';
import { formatDate } from '@/lib/format';
import type { Authorization } from '@/types';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AuthorizationsPage() {
  const [records, setRecords] = useState<Authorization[]>(fallbackAuthorizations);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    provider: 'Blue Cross Blue Shield',
    procedure: 'CPT 99214 - Extended Consultation',
    requestedDate: new Date().toISOString().split('T')[0],
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    visitsApproved: 12,
  });

  const fetchAuthorizations = async () => {
    try {
      const url = statusFilter !== 'all' ? `/api/insurance/authorizations?status=${statusFilter}` : '/api/insurance/authorizations';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error('[FETCH_AUTHORIZATIONS_ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorizations();
  }, [statusFilter]);

  const handleRequestAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/insurance/authorizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Prior Authorization submitted', {
          description: `Auth #: ${data.data.authorizationNumber}`,
        });
        setIsModalOpen(false);
        fetchAuthorizations();
      } else {
        toast.error('Submission failed', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[SUBMIT_AUTH_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error requesting authorization' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<Authorization>[] = [
    { accessorKey: 'authorizationNumber', header: 'Auth #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.authorizationNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'procedure', header: 'Procedure' },
    { accessorKey: 'provider', header: 'Insurer' },
    {
      accessorKey: 'visitsUsed',
      header: 'Visits Used',
      cell: ({ row }) => {
        const pct = row.original.visitsApproved > 0 ? (row.original.visitsUsed / row.original.visitsApproved) * 100 : 0;
        return (
          <div className="w-28">
            <div className="mb-1 flex justify-between text-xs">
              <span>{row.original.visitsUsed}/{row.original.visitsApproved}</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      },
    },
    { accessorKey: 'validTo', header: 'Valid Until', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original.validTo))}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Authorization Numbers"
        description="Track prior authorizations and their utilization"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Insurance', href: '/insurance' }, { label: 'Authorizations' }]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Request Authorization
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={records}
        searchKey="patientName"
        searchPlaceholder="Search authorizations..."
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Denied">Denied</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Prior Authorization</DialogTitle>
            <DialogDescription>Submit prior auth request to payer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestAuth} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Patient ID</Label>
              <Input required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} placeholder="Enter Patient ID (or UUID)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Payer Name</Label>
                <Input required value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Visits Approved</Label>
                <Input type="number" required value={formData.visitsApproved} onChange={(e) => setFormData({ ...formData, visitsApproved: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Procedure Details</Label>
              <Input required value={formData.procedure} onChange={(e) => setFormData({ ...formData, procedure: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Valid From</Label>
                <Input type="date" required value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Valid Until</Label>
                <Input type="date" required value={formData.validTo} onChange={(e) => setFormData({ ...formData, validTo: e.target.value })} />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
