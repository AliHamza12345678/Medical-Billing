'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { PatientForm } from '@/components/features/patient-form';
import { getPatientById } from '@/data/patients';
import type { Patient } from '@/types';

export default function EditPatientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(() => getPatientById(params.id) || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatient() {
      try {
        const res = await fetch(`/api/patients/${params.id}`);
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setPatient(data.data);
        }
      } catch (err) {
        console.error('[FETCH_PATIENT_ERROR]', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [params.id]);

  if (!patient && !loading) {
    return (
      <DashboardShell>
        <PageHeader title="Patient Not Found" breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Patients', href: '/patients' }, { label: 'Edit' }]} />
        <p className="text-muted-foreground">The patient you are looking for does not exist.</p>
      </DashboardShell>
    );
  }

  if (!patient) return null;

  return (
    <DashboardShell>
      <PageHeader
        title={`Edit: ${patient.firstName} ${patient.lastName}`}
        description="Update patient information and insurance details"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Patients', href: '/patients' },
          { label: `${patient.firstName} ${patient.lastName}`, href: `/patients/${patient.id}` },
          { label: 'Edit' },
        ]}
      />
      <PatientForm
        defaultValues={{
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: String(patient.dateOfBirth).split('T')[0],
          gender: patient.gender,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          city: patient.city,
          state: patient.state,
          zip: patient.zip,
          insurance: patient.insurance?.map((i) => ({
            provider: i.provider || '',
            memberId: i.memberId,
            groupNumber: i.groupNumber,
            planName: i.planName,
            priority: (i.priority as any) || 'Primary',
            copay: Number(i.copay) || 0,
            deductible: Number(i.deductible) || 0,
            coveragePercent: Number(i.coveragePercent) || 80,
            effectiveDate: i.effectiveDate ? String(i.effectiveDate).split('T')[0] : '',
            expiryDate: i.expiryDate ? String(i.expiryDate).split('T')[0] : '',
          })) || [],
        }}
        onSubmit={async (formData) => {
          try {
            const res = await fetch(`/api/patients/${params.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok && data.success) {
              toast.success('Patient updated', {
                description: `${patient.firstName} ${patient.lastName}'s information has been saved.`,
              });
              router.push(`/patients/${patient.id}`);
            } else {
              toast.error('Update failed', {
                description: data.error?.message || 'Failed to update patient record',
              });
            }
          } catch (err) {
            console.error('[UPDATE_PATIENT_ERROR]', err);
            toast.error('Error', { description: 'Unexpected network error' });
          }
        }}
        onCancel={() => router.push(`/patients/${patient.id}`)}
        submitLabel="Save Changes"
      />
    </DashboardShell>
  );
}
