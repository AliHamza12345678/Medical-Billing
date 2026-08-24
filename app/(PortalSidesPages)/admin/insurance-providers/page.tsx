'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Building2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Button } from '@/components/ui/button';
import { insuranceProviders as fallbackProviders } from '@/data/insurance';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { InsuranceProvider } from '@/types';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminInsuranceProvidersPage() {
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', payerId: '', type: 'Commercial', phone: '', email: '', address: '', city: '', state: '', zip: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProviders = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/insurance-providers');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setProviders(data.data);
      } else {
        setProviders(fallbackProviders);
      }
    } catch (err) {
      console.error('[FETCH_INSURANCE_PROVIDERS_ERROR]', err);
      setProviders(fallbackProviders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/insurance-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Insurance provider created');
        setIsModalOpen(false);
        setFormData({ name: '', payerId: '', type: 'Commercial', phone: '', email: '', address: '', city: '', state: '', zip: '' });
        fetchProviders();
      } else {
        toast.error('Creation failed', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[CREATE_PROVIDER_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error adding provider' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<InsuranceProvider>[] = [
    {
      accessorKey: 'name',
      header: 'Provider',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${row.original.logoColor || 'bg-blue-600'} text-white`}>
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.payerId}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'claimsSubmitted', header: 'Claims', cell: ({ row }) => formatNumber(row.original.claimsSubmitted || 0) },
    { accessorKey: 'avgProcessingDays', header: 'Avg Days', cell: ({ row }) => String(row.original.avgProcessingDays || 14) },
    { accessorKey: 'totalRevenue', header: 'Revenue', cell: ({ row }) => formatCurrency(Number(row.original.totalRevenue || 0)) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Insurance Providers"
        description="Administrative management of payer relationships"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Insurance Providers' }]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Provider
          </Button>
        }
      />
      <DataTable columns={columns} data={providers} searchKey="name" searchPlaceholder="Search providers..." />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Insurance Provider</DialogTitle>
            <DialogDescription>Register a new payer relationship.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProvider} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Payer Name</Label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Blue Cross" />
              </div>
              <div className="space-y-1">
                <Label>Payer ID</Label>
                <Input required value={formData.payerId} onChange={(e) => setFormData({ ...formData, payerId: e.target.value })} placeholder="BCBS01" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Medicare">Medicare</SelectItem>
                    <SelectItem value="Medicaid">Medicaid</SelectItem>
                    <SelectItem value="TRICARE">TRICARE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(800) 555-0199" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="claims@bcbs.com" />
            </div>
            <div className="space-y-1">
              <Label>Street Address</Label>
              <Input required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="100 Health Way" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label>City</Label>
                <Input required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Boston" />
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <Input required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="MA" />
              </div>
              <div className="space-y-1">
                <Label>ZIP</Label>
                <Input required value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} placeholder="02108" />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Provider'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
