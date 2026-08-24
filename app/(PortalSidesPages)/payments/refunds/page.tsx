'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { RotateCcw, Plus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { payments as fallbackPayments } from '@/data/payments';
import { formatCurrency, formatDate } from '@/lib/format';

export interface RefundRecord {
  id: string;
  refundNumber: string;
  patientName: string;
  date: string;
  method: string;
  reason: string;
  amount: number;
  status: string;
}

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';

export default function RefundsPage() {
  const fallbackRefunds: RefundRecord[] = fallbackPayments
    .filter((p) => p.status === 'Refunded' || p.type === 'Refund')
    .map((p) => ({
      id: p.id,
      refundNumber: p.paymentNumber,
      patientName: p.patientName,
      date: String(p.date),
      method: p.method,
      reason: p.appliedTo || 'Patient requested refund',
      amount: Number(p.amount),
      status: p.status,
    }));

  const [refundList, setRefundList] = useState<RefundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', amount: 75, method: 'CreditCard', reason: 'Patient overpayment refund'
  });

  const fetchRefunds = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/refunds');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setRefundList(data.data);
      } else {
        setRefundList(fallbackRefunds);
      }
    } catch (err) {
      console.error('[FETCH_REFUNDS_ERROR]', err);
      setRefundList(fallbackRefunds);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Refund processed', { description: `Refund ${data.data.refundNumber || data.data.paymentNumber} created.` });
        setIsModalOpen(false);
        fetchRefunds();
      } else {
        toast.error('Refund failed', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[PROCESS_REFUND_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error processing refund' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<RefundRecord>[] = [
    { accessorKey: 'refundNumber', header: 'Refund #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.refundNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original.date))}</span> },
    { accessorKey: 'method', header: 'Method' },
    { accessorKey: 'reason', header: 'Reason', cell: ({ row }) => <span className="text-sm">{row.original.reason}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(Number(row.original.amount))}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const total = refundList.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <DashboardShell>
      <PageHeader
        title="Refunds"
        description="Process and track patient refunds"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Payments', href: '/payments' }, { label: 'Refunds' }]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Process Refund
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Refunds</p>
              <p className="text-xl font-bold">{refundList.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Refund Amount</p>
              <p className="text-xl font-bold">{formatCurrency(total)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Refund</p>
              <p className="text-xl font-bold">{formatCurrency(refundList.length ? total / refundList.length : 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={refundList} searchKey="patientName" searchPlaceholder="Search refunds..." />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Patient Refund</DialogTitle>
            <DialogDescription>Issue a refund to a patient and update financial ledgers.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProcessRefund} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Patient ID</Label>
              <Input required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} placeholder="Enter Patient ID" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Amount ($)</Label>
                <Input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Payment Method</Label>
                <Select value={formData.method} onValueChange={(val) => setFormData({ ...formData, method: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CreditCard">Credit Card</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="ACH">ACH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Reason Details</Label>
              <Input required value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Overpayment refund" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Processing...' : 'Process Refund'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
