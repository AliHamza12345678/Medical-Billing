'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Hash } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { procedureCodes as fallbackCPT, diagnosisCodes as fallbackICD } from '@/data/charge-entry';
import { formatCurrency } from '@/lib/format';
import type { ProcedureCode, DiagnosisCode } from '@/types';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';

export default function BillingCodesPage() {
  const [cptCodes, setCptCodes] = useState<ProcedureCode[]>([]);
  const [icdCodes, setIcdCodes] = useState<DiagnosisCode[]>([]);
  const [activeTab, setActiveTab] = useState<'cpt' | 'icd'>('cpt');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [cptForm, setCptForm] = useState({ cptCode: '', description: '', category: 'Evaluation', standardCharge: 150, medicareRate: 110, rvu: 2.5 });
  const [icdForm, setIcdForm] = useState({ icd10Code: '', description: '', category: 'General' });

  const fetchCodes = React.useCallback(async () => {
    try {
      const [cptRes, icdRes] = await Promise.all([
        fetch('/api/admin/billing-codes/cpt'),
        fetch('/api/admin/billing-codes/icd10'),
      ]);

      const cptData = await cptRes.json();
      const icdData = await icdRes.json();

      if (cptRes.ok && cptData.success && Array.isArray(cptData.data)) {
        setCptCodes(cptData.data);
      } else {
        setCptCodes(fallbackCPT);
      }

      if (icdRes.ok && icdData.success && Array.isArray(icdData.data)) {
        setIcdCodes(icdData.data);
      } else {
        setIcdCodes(fallbackICD);
      }
    } catch (err) {
      console.error('[FETCH_BILLING_CODES_ERROR]', err);
      setCptCodes(fallbackCPT);
      setIcdCodes(fallbackICD);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (activeTab === 'cpt') {
        const res = await fetch('/api/admin/billing-codes/cpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cptForm),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('CPT Code added');
          setIsModalOpen(false);
          setCptForm({ cptCode: '', description: '', category: 'Evaluation', standardCharge: 150, medicareRate: 110, rvu: 2.5 });
          fetchCodes();
        } else {
          toast.error('Failed to add CPT code', { description: data.error?.message });
        }
      } else {
        const res = await fetch('/api/admin/billing-codes/icd10', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(icdForm),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('ICD-10 Code added');
          setIsModalOpen(false);
          setIcdForm({ icd10Code: '', description: '', category: 'General' });
          fetchCodes();
        } else {
          toast.error('Failed to add ICD-10 code', { description: data.error?.message });
        }
      }
    } catch (err) {
      console.error('[SAVE_BILLING_CODE_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error adding code' });
    } finally {
      setSubmitting(false);
    }
  };

  const cptColumns: ColumnDef<ProcedureCode>[] = [
    { accessorKey: 'cptCode', header: 'CPT Code', cell: ({ row }) => <span className="font-mono text-sm font-semibold text-primary">{row.original.cptCode}</span> },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'standardCharge', header: 'Standard', cell: ({ row }) => formatCurrency(Number(row.original.standardCharge)) },
    { accessorKey: 'medicareRate', header: 'Medicare', cell: ({ row }) => formatCurrency(Number(row.original.medicareRate)) },
    { accessorKey: 'rvu', header: 'RVU', cell: ({ row }) => Number(row.original.rvu).toFixed(2) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const icdColumns: ColumnDef<DiagnosisCode>[] = [
    { accessorKey: 'icd10Code', header: 'ICD-10 Code', cell: ({ row }) => <span className="font-mono text-sm font-semibold text-primary">{row.original.icd10Code}</span> },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Billing Codes"
        description="Manage CPT and ICD-10 code libraries"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Billing Codes' }]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Code
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPT Codes</p>
              <p className="text-xl font-bold">{cptCodes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ICD-10 Codes</p>
              <p className="text-xl font-bold">{icdCodes.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="cpt" onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="cpt">CPT Codes</TabsTrigger>
          <TabsTrigger value="icd">ICD-10 Codes</TabsTrigger>
        </TabsList>
        <TabsContent value="cpt">
          <DataTable columns={cptColumns} data={cptCodes} searchKey="description" searchPlaceholder="Search CPT codes..." />
        </TabsContent>
        <TabsContent value="icd">
          <DataTable columns={icdColumns} data={icdCodes} searchKey="description" searchPlaceholder="Search ICD-10 codes..." />
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {activeTab === 'cpt' ? 'CPT Procedure' : 'ICD-10 Diagnosis'} Code</DialogTitle>
            <DialogDescription>Add a new standard billing code to the system directory.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCode} className="space-y-3 py-2">
            {activeTab === 'cpt' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>CPT Code</Label>
                    <Input required value={cptForm.cptCode} onChange={(e) => setCptForm({ ...cptForm, cptCode: e.target.value })} placeholder="99214" />
                  </div>
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Input required value={cptForm.category} onChange={(e) => setCptForm({ ...cptForm, category: e.target.value })} placeholder="Evaluation" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input required value={cptForm.description} onChange={(e) => setCptForm({ ...cptForm, description: e.target.value })} placeholder="Office visit, established patient, 30-39 min" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label>Standard ($)</Label>
                    <Input type="number" required value={cptForm.standardCharge} onChange={(e) => setCptForm({ ...cptForm, standardCharge: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Medicare ($)</Label>
                    <Input type="number" required value={cptForm.medicareRate} onChange={(e) => setCptForm({ ...cptForm, medicareRate: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label>RVU</Label>
                    <Input type="number" step="0.1" required value={cptForm.rvu} onChange={(e) => setCptForm({ ...cptForm, rvu: Number(e.target.value) })} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>ICD-10 Code</Label>
                    <Input required value={icdForm.icd10Code} onChange={(e) => setIcdForm({ ...icdForm, icd10Code: e.target.value })} placeholder="I10" />
                  </div>
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Input required value={icdForm.category} onChange={(e) => setIcdForm({ ...icdForm, category: e.target.value })} placeholder="Cardiovascular" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input required value={icdForm.description} onChange={(e) => setIcdForm({ ...icdForm, description: e.target.value })} placeholder="Essential (primary) hypertension" />
                </div>
              </>
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Code'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
