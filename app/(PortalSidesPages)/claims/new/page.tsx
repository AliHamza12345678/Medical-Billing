'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Calculator, Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { patients as fallbackPatients } from '@/data/patients';
import { procedureCodes as fallbackCPT, diagnosisCodes as fallbackICD } from '@/data/charge-entry';
import { insuranceProviders as fallbackInsurance } from '@/data/insurance';
import { formatCurrency } from '@/lib/format';
import type { Patient, InsuranceProvider, ProcedureCode, DiagnosisCode } from '@/types';

const schema = z.object({
  patientId: z.string().min(1, 'Select a patient'),
  insuranceProvider: z.string().min(1, 'Select insurance'),
  serviceDate: z.string().min(1, 'Required'),
  priority: z.enum(['Routine', 'Urgent', 'Emergency']),
  lines: z
    .array(
      z.object({
        cptCode: z.string().min(1, 'Required'),
        icd10Code: z.string().min(1, 'Required'),
        quantity: z.coerce.number().min(1),
        unitCharge: z.coerce.number().min(0),
      })
    )
    .min(1, 'Add at least one charge line'),
});

type FormValues = z.infer<typeof schema>;

export default function CreateClaimPage() {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [patientList, setPatientList] = useState<Patient[]>(fallbackPatients);
  const [insuranceList, setInsuranceList] = useState<InsuranceProvider[]>(fallbackInsurance);
  const [cptList, setCptList] = useState<ProcedureCode[]>(fallbackCPT);
  const [icdList, setIcdList] = useState<DiagnosisCode[]>(fallbackICD);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDropdownData = React.useCallback(async () => {
    try {
      const [ptRes, insRes, cptRes, icdRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/admin/insurance-providers'),
        fetch('/api/admin/billing-codes/cpt'),
        fetch('/api/admin/billing-codes/icd10'),
      ]);

      const [ptData, insData, cptData, icdData] = await Promise.all([
        ptRes.json(),
        insRes.json(),
        cptRes.json(),
        icdRes.json(),
      ]);

      if (ptRes.ok && ptData.success && Array.isArray(ptData.data)) setPatientList(ptData.data);
      if (insRes.ok && insData.success && Array.isArray(insData.data)) setInsuranceList(insData.data);
      if (cptRes.ok && cptData.success && Array.isArray(cptData.data)) setCptList(cptData.data);
      if (icdRes.ok && icdData.success && Array.isArray(icdData.data)) setIcdList(icdData.data);
    } catch (err) {
      console.error('[FETCH_DROPDOWNS_ERROR]', err);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: '',
      insuranceProvider: '',
      serviceDate: new Date().toISOString().split('T')[0],
      priority: 'Routine',
      lines: [{ cptCode: '', icd10Code: '', quantity: 1, unitCharge: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const lines = watch('lines');

  useEffect(() => {
    const sum = (lines ?? []).reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitCharge) || 0), 0);
    setTotal(sum);
  }, [lines]);

  const onSubmit = async (data: FormValues) => {
    setErrorMessage(null);
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setErrorMessage(resData.error?.message || 'Failed to create claim');
        return;
      }

      toast.success('Claim created', { description: `Claim total: ${formatCurrency(total)}` });
      router.push('/claims');
    } catch (err) {
      console.error('[CREATE_CLAIM_ERROR]', err);
      setErrorMessage('An unexpected error occurred while creating the claim.');
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Create Claim"
        description="Build a new insurance claim with charge lines"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Claims', href: '/claims' }, { label: 'Create' }]}
      />

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Claim Information</CardTitle><CardDescription>Select the patient and insurance details</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Patient</Label>
              <Controller control={control} name="patientId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>
                    {patientList.slice(0, 50).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.mrn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
              {errors.patientId && <p className="text-xs text-destructive">{errors.patientId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Insurance Provider</Label>
              <Controller control={control} name="insuranceProvider" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select insurer" /></SelectTrigger>
                  <SelectContent>
                    {insuranceList.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {errors.insuranceProvider && <p className="text-xs text-destructive">{errors.insuranceProvider.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Service Date</Label>
              <Input type="date" {...register('serviceDate')} />
              {errors.serviceDate && <p className="text-xs text-destructive">{errors.serviceDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Controller control={control} name="priority" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle className="flex items-center gap-2 text-base"><Calculator className="h-4 w-4 text-primary" /> Charge Lines</CardTitle><CardDescription>Add procedures and diagnoses</CardDescription></div>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ cptCode: '', icd10Code: '', quantity: 1, unitCharge: 0 })}>
              <Plus className="mr-2 h-4 w-4" /> Add Line
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Line {idx + 1}</span>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">CPT Code</Label>
                    <Controller control={control} name={`lines.${idx}.cptCode`} render={({ field: f }) => (
                      <Select value={f.value} onValueChange={(v) => {
                        f.onChange(v);
                        const cpt = cptList.find((c) => c.cptCode === v);
                        if (cpt) {
                          setValueLines(idx, 'unitCharge', Number(cpt.standardCharge));
                        }
                      }}>
                        <SelectTrigger><SelectValue placeholder="Select CPT" /></SelectTrigger>
                        <SelectContent>
                          {cptList.map((c) => <SelectItem key={c.id} value={c.cptCode}>{c.cptCode} — {c.description.slice(0, 30)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">ICD-10 Code</Label>
                    <Controller control={control} name={`lines.${idx}.icd10Code`} render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select ICD-10" /></SelectTrigger>
                        <SelectContent>
                          {icdList.map((c) => <SelectItem key={c.id} value={c.icd10Code}>{c.icd10Code} — {c.description.slice(0, 30)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Quantity</Label>
                    <Input type="number" min={1} {...register(`lines.${idx}.quantity`)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Unit Charge ($)</Label>
                    <Input type="number" step="0.01" {...register(`lines.${idx}.unitCharge`)} />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <span className="text-sm font-semibold">
                    Line total: {formatCurrency((Number(lines?.[idx]?.quantity) || 0) * (Number(lines?.[idx]?.unitCharge) || 0))}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="text-sm text-muted-foreground">Calculated Total</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/claims')}><X className="mr-2 h-4 w-4" /> Cancel</Button>
              <Button type="submit" disabled={isSubmitting}><Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Saving...' : 'Submit Claim'}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </DashboardShell>
  );
}

function setValueLines(idx: number, key: string, value: any) {
  const event = new Event('input', { bubbles: true });
  const input = document.querySelector(`input[name="lines.${idx}.${key}"]`) as HTMLInputElement;
  if (input) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeInputValueSetter?.call(input, String(value));
    input.dispatchEvent(event);
  }
}
