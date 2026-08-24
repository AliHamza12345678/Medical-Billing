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
import { feeSchedule as fallbackFeeSchedule } from '@/data/users';
import { formatCurrency, formatDate } from '@/lib/format';
import type { FeeSchedule } from '@/types';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function FeeSchedulePage() {
  const [schedules, setSchedules] = useState<FeeSchedule[]>([]);
  const [providerFilter, setProviderFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cptCode: '', description: '', provider: 'Blue Cross Blue Shield', standardRate: 200, negotiatedRate: 140, effectiveDate: new Date().toISOString().split('T')[0],
  });

  const fetchFeeSchedules = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = providerFilter !== 'all' ? `/api/admin/fee-schedule?provider=${encodeURIComponent(providerFilter)}` : '/api/admin/fee-schedule';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setSchedules(data.data);
      } else {
        setSchedules(fallbackFeeSchedule);
      }
    } catch (err) {
      console.error('[FETCH_FEE_SCHEDULES_ERROR]', err);
      setSchedules(fallbackFeeSchedule);
    } finally {
      setLoading(false);
    }
  }, [providerFilter]);

  useEffect(() => {
    fetchFeeSchedules();
  }, [fetchFeeSchedules]);

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/fee-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Fee Schedule Rate added');
        setIsModalOpen(false);
        setFormData({ cptCode: '', description: '', provider: 'Blue Cross Blue Shield', standardRate: 200, negotiatedRate: 140, effectiveDate: new Date().toISOString().split('T')[0] });
        fetchFeeSchedules();
      } else {
        toast.error('Failed to add rate', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[SAVE_FEE_SCHEDULE_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error adding rate' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<FeeSchedule>[] = [
    { accessorKey: 'cptCode', header: 'CPT', cell: ({ row }) => <span className="font-mono text-sm font-semibold text-primary">{row.original.cptCode}</span> },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'provider', header: 'Provider' },
    { accessorKey: 'standardRate', header: 'Standard', cell: ({ row }) => formatCurrency(Number(row.original.standardRate)) },
    { accessorKey: 'negotiatedRate', header: 'Negotiated', cell: ({ row }) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(row.original.negotiatedRate))}</span> },
    { accessorKey: 'effectiveDate', header: 'Effective', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original.effectiveDate))}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const providers = Array.from(new Set(schedules.map((f) => f.provider)));

  return (
    <DashboardShell>
      <PageHeader
        title="Fee Schedule"
        description="Negotiated rates by provider and procedure code"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Fee Schedule' }]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Rate
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={schedules}
        searchKey="description"
        searchPlaceholder="Search fee schedule..."
        toolbar={
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Negotiated Fee Rate</DialogTitle>
            <DialogDescription>Set contracted payer rate for a procedure code.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRate} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>CPT Code</Label>
                <Input required value={formData.cptCode} onChange={(e) => setFormData({ ...formData, cptCode: e.target.value })} placeholder="99214" />
              </div>
              <div className="space-y-1">
                <Label>Insurance Payer</Label>
                <Input required value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} placeholder="Blue Cross" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Office visit" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label>Standard ($)</Label>
                <Input type="number" required value={formData.standardRate} onChange={(e) => setFormData({ ...formData, standardRate: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Negotiated ($)</Label>
                <Input type="number" required value={formData.negotiatedRate} onChange={(e) => setFormData({ ...formData, negotiatedRate: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Effective Date</Label>
                <Input type="date" required value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Rate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
