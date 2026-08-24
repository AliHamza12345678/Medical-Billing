'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { GenericBadge } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { adjustments as fallbackAdjustments } from '@/data/payments';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Adjustment, AdjustmentType } from '@/types';

const typeVariant: Record<AdjustmentType, 'info' | 'warning' | 'destructive' | 'success' | 'neutral'> = {
  'Contractual Adjustment': 'info',
  'Write-off': 'warning',
  Refund: 'destructive',
  Administrative: 'neutral',
  'Coding Correction': 'success',
};

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdjustmentsPage() {
  const [records, setRecords] = useState<Adjustment[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', claimNumber: 'CLM-98231', amount: 50, type: 'Contractual Adjustment' as AdjustmentType, reason: 'Payer fee schedule contracted rate adjustment'
  });

  const fetchAdjustments = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = typeFilter !== 'all' ? `/api/payments/adjustments?type=${typeFilter}` : '/api/payments/adjustments';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setRecords(data.data);
      } else {
        setRecords(fallbackAdjustments);
      }
    } catch (err) {
      console.error('[FETCH_ADJUSTMENTS_ERROR]', err);
      setRecords(fallbackAdjustments);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const handlePostAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Adjustment posted', { description: `Adjustment ${data.data.adjustmentNumber} recorded.` });
        setIsModalOpen(false);
        fetchAdjustments();
      } else {
        toast.error('Posting failed', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[POST_ADJUSTMENT_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error posting adjustment' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<Adjustment>[] = [
    { accessorKey: 'adjustmentNumber', header: 'Adj #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.adjustmentNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'claimNumber', header: 'Claim', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.claimNumber}</span> },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <GenericBadge variant={typeVariant[row.original.type] || 'neutral'}>{row.original.type}</GenericBadge> },
    { accessorKey: 'reason', header: 'Reason', cell: ({ row }) => <span className="text-sm">{row.original.reason}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className={row.original.type === 'Refund' ? 'font-semibold text-rose-600 dark:text-rose-400' : 'font-semibold'}>{formatCurrency(Number(row.original.amount))}</span> },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original.date))}</span> },
    { accessorKey: 'postedBy', header: 'Posted By' },
  ];

  const types = Array.from(new Set(records.map((a) => a.type)));
  const total = records.reduce((s, a) => s + Number(a.amount), 0);

  return (
    <DashboardShell>
      <PageHeader
        title="Adjustments"
        description="Contractual write-offs, corrections, and administrative adjustments"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Payments', href: '/payments' }, { label: 'Adjustments' }]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Adjustment
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Adjustments</p>
              <p className="text-xl font-bold">{records.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold">{formatCurrency(total)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Adjustment</p>
              <p className="text-xl font-bold">{formatCurrency(records.length ? total / records.length : 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <DataTable
        columns={columns}
        data={records}
        searchKey="patientName"
        searchPlaceholder="Search adjustments..."
        toolbar={
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Financial Adjustment</DialogTitle>
            <DialogDescription>Record a write-off or contractual adjustment for a claim.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePostAdjustment} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Patient ID</Label>
              <Input required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} placeholder="Enter Patient ID" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Claim #</Label>
                <Input required value={formData.claimNumber} onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })} placeholder="CLM-98231" />
              </div>
              <div className="space-y-1">
                <Label>Adjustment Type</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as AdjustmentType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contractual Adjustment">Contractual Adjustment</SelectItem>
                    <SelectItem value="Write-off">Write-off</SelectItem>
                    <SelectItem value="Refund">Refund</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                    <SelectItem value="Coding Correction">Coding Correction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Amount ($)</Label>
              <Input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label>Reason Details</Label>
              <Input required value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Write-off uncollectible balance" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Adjustment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
