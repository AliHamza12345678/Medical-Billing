'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Calculator, DollarSign } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { chargeEntries as fallbackCharges } from '@/data/charge-entry';
import { formatCurrency, formatDate } from '@/lib/format';
import type { ChargeEntry } from '@/types';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ChargeEntryPage() {
  const [charges, setCharges] = useState<ChargeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    cptCode: '99214',
    cptDescription: 'Office visit, established patient',
    icd10Code: 'E11.9',
    provider: 'Dr. Sarah Jenkins',
    serviceDate: new Date().toISOString().split('T')[0],
    quantity: '1',
    unitCharge: '150.00',
  });

  const fetchCharges = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/charges');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setCharges(data.data);
      } else {
        setCharges(fallbackCharges);
      }
    } catch (err) {
      console.error('[FETCH_CHARGES_ERROR]', err);
      setCharges(fallbackCharges);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity, 10),
          unitCharge: parseFloat(formData.unitCharge),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Charge Recorded Successfully');
        setIsModalOpen(false);
        fetchCharges();
      } else {
        toast.error('Failed to Record Charge', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[CREATE_CHARGE_ERROR]', err);
      toast.error('Error', { description: 'Failed to connect to backend service' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<ChargeEntry>[] = [
    { accessorKey: 'patientName', header: 'Patient', cell: ({ row }) => <span className="font-medium">{row.original.patientName}</span> },
    { accessorKey: 'cptCode', header: 'CPT', cell: ({ row }) => <span className="font-mono text-xs font-semibold text-primary">{row.original.cptCode}</span> },
    { accessorKey: 'cptDescription', header: 'Procedure', cell: ({ row }) => <span className="text-sm">{row.original.cptDescription}</span> },
    { accessorKey: 'icd10Code', header: 'ICD-10', cell: ({ row }) => <span className="font-mono text-xs">{row.original.icd10Code}</span> },
    { accessorKey: 'provider', header: 'Provider' },
    { accessorKey: 'serviceDate', header: 'Service Date', cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(String(row.original.serviceDate))}</span> },
    { accessorKey: 'quantity', header: 'Qty' },
    { accessorKey: 'unitCharge', header: 'Unit', cell: ({ row }) => formatCurrency(Number(row.original.unitCharge)) },
    { accessorKey: 'totalCharge', header: 'Total', cell: ({ row }) => <span className="font-semibold">{formatCurrency(Number(row.original.totalCharge))}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const totalChargesValue = charges.reduce((s, c) => s + Number(c.totalCharge || 0), 0);

  return (
    <DashboardShell>
      <PageHeader
        title="Charge Entry"
        description="Record charges for procedures and services rendered"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Charge Entry' }]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Charge
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Charges</p>
              <p className="text-xl font-bold">{charges.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl font-bold">{formatCurrency(totalChargesValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Draft Charges</p>
              <p className="text-xl font-bold">{charges.filter((c) => c.status === 'Draft').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={charges} searchKey="patientName" searchPlaceholder="Search charges..." pageSize={10} />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateCharge}>
            <DialogHeader>
              <DialogTitle>New Charge Entry</DialogTitle>
              <DialogDescription>Record procedure charge details for billing validation.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid gap-2">
                <Label>Patient Name</Label>
                <Input required value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} placeholder="e.g. Eleanor Vance" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>CPT Code</Label>
                  <Input required value={formData.cptCode} onChange={(e) => setFormData({ ...formData, cptCode: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>ICD-10 Code</Label>
                  <Input required value={formData.icd10Code} onChange={(e) => setFormData({ ...formData, icd10Code: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Quantity</Label>
                  <Input type="number" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Unit Charge ($)</Label>
                  <Input type="number" step="0.01" required value={formData.unitCharge} onChange={(e) => setFormData({ ...formData, unitCharge: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Record Charge'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
