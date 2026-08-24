'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Download, Eye } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { invoices as fallbackInvoices } from '@/data/payments';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Invoice } from '@/types';

import { Plus } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(fallbackInvoices);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Office Visit & Consultation',
    cptCode: '99214',
    unitPrice: 150,
    quantity: 1,
    notes: 'Payment due within 30 days.',
  });

  const fetchInvoices = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'all' ? `/api/payments/invoices?status=${statusFilter}` : '/api/payments/invoices';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setInvoiceList(data.data);
      } else {
        setInvoiceList(fallbackInvoices);
      }
    } catch (err) {
      console.error('[FETCH_INVOICES_ERROR]', err);
      setInvoiceList(fallbackInvoices);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: formData.patientId,
          dueDate: formData.dueDate,
          notes: formData.notes,
          items: [
            {
              description: formData.description,
              cptCode: formData.cptCode,
              quantity: formData.quantity,
              unitPrice: formData.unitPrice,
            },
          ],
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Invoice created', { description: `Invoice ${data.data.invoiceNumber} generated.` });
        setIsModalOpen(false);
        fetchInvoices();
      } else {
        toast.error('Failed to create invoice', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[CREATE_INVOICE_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error creating invoice' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'invoiceNumber', header: 'Invoice #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.invoiceNumber}</span> },
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'issueDate', header: 'Issued', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original.issueDate))}</span> },
    { accessorKey: 'dueDate', header: 'Due', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original.dueDate))}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(Number(row.original.amount)) },
    { accessorKey: 'paidAmount', header: 'Paid', cell: ({ row }) => <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(row.original.paidAmount))}</span> },
    { accessorKey: 'balance', header: 'Balance', cell: ({ row }) => <span className={Number(row.original.balance) > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-medium'}>{formatCurrency(Number(row.original.balance))}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/payments/invoices/${row.original.id}`); }}>
          <Eye className="mr-1.5 h-3.5 w-3.5" /> View
        </Button>
      ),
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Invoices"
        description={`${invoiceList.length} invoices generated`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Payments', href: '/payments' }, { label: 'Invoices' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button onClick={() => setIsModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create Invoice</Button>
          </div>
        }
      />
      <DataTable
        columns={columns}
        data={invoiceList}
        searchKey="patientName"
        searchPlaceholder="Search invoices..."
        onRowClick={(inv) => router.push(`/payments/invoices/${inv.id}`)}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Generate a patient statement invoice.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Patient ID</Label>
                <Input required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} placeholder="Enter Patient ID" />
              </div>
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input type="date" required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>CPT Code</Label>
                <Input required value={formData.cptCode} onChange={(e) => setFormData({ ...formData, cptCode: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Unit Price ($)</Label>
                <Input type="number" step="0.01" required value={formData.unitPrice} onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Generating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
