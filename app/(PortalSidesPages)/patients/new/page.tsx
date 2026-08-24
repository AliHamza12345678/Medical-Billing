'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { PatientForm } from '@/components/features/patient-form';

export default function AddPatientPage() {
  const router = useRouter();
  return (
    <DashboardShell>
      <PageHeader
        title="Add New Patient"
        description="Register a new patient with their insurance and contact details"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Patients', href: '/patients' },
          { label: 'Add Patient' },
        ]}
      />
      <PatientForm
        onSubmit={async (formData) => {
          try {
            const res = await fetch('/api/patients', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok && data.success) {
              toast.success('Patient registered', {
                description: `Patient ${formData.firstName} ${formData.lastName} has been added.`,
              });
              router.push('/patients');
            } else {
              toast.error('Registration failed', {
                description: data.error?.message || 'Failed to save patient record',
              });
            }
          } catch (err) {
            console.error('[CREATE_PATIENT_ERROR]', err);
            toast.error('Error', { description: 'Unexpected network error' });
          }
        }}
        onCancel={() => router.push('/patients')}
        submitLabel="Register Patient"
      />
    </DashboardShell>
  );
}
