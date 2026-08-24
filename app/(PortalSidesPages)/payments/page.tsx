'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Download, CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Payment } from '@/types';

import { Plus } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PaymentHistoryPage() {
  const [paymentList, setPaymentList] = useState<Payment[]>([]);
  const [methodFilter, setMethodFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', amount: 150, method: 'CreditCard', type: 'Patient Payment', reference: 'PAY-REF-001', appliedTo: 'Statement'
  });

  const fetchPayments = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = methodFilter !== 'all' ? `/api/payments?method=${methodFilter}` : '/api/payments';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setPaymentList(data.data);
      } else {
        setPaymentList([]);
      }
    } catch (err) {
      console.error('[FETCH_PAYMENTS_ERROR]', err);
      setPaymentList([]);
    } finally {
      setLoading(false);
    }
  }, [methodFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Payment recorded', { description: `Payment ${data.data.paymentNumber} has been logged.` });
        setIsModalOpen(false);
        fetchPayments();
      } else {
        toast.error('Failed to record payment', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[RECORD_PAYMENT_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error logging payment' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<Payment>[] = [
    { accessorKey: 'paymentNumber', header: 'Payment #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.paymentNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original.date))}</span> },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'method', header: 'Method' },
    { accessorKey: 'appliedTo', header: 'Applied To', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.appliedTo}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-semibold">{formatCurrency(Number(row.original.amount))}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const totalPaid = paymentList.filter((p) => p.status === 'Paid').reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = paymentList.filter((p) => p.status === 'Pending').reduce((s, p) => s + Number(p.amount), 0);
  const totalRefunded = paymentList.filter((p) => p.status === 'Refunded').reduce((s, p) => s + Number(p.amount), 0);

  const methods = Array.from(new Set(paymentList.map((p) => p.method)));

  return (
    <DashboardShell>
      <PageHeader
        title="Payment History"
        description={`${paymentList.length} payments recorded`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Payments' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button onClick={() => setIsModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Record Payment</Button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-xl font-bold">{formatCurrency(totalPaid)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold">{formatCurrency(totalPending)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Refunded</p>
              <p className="text-xl font-bold">{formatCurrency(totalRefunded)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={paymentList}
        searchKey="patientName"
        searchPlaceholder="Search payments..."
        toolbar={
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {methods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Log a patient or insurance payment transaction.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Patient ID</Label>
              <Input required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} placeholder="Enter Patient ID (or UUID)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Amount ($)</Label>
                <Input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Method</Label>
                <Select value={formData.method} onValueChange={(val) => setFormData({ ...formData, method: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CreditCard">Credit Card</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="ACH">ACH</SelectItem>
                    <SelectItem value="HSA">HSA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Payment Type</Label>
                <Input required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="Patient Copay" />
              </div>
              <div className="space-y-1">
                <Label>Reference #</Label>
                <Input required value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} placeholder="TXN-982341" />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
