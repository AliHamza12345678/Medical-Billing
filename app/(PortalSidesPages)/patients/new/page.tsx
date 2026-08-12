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
        onSubmit={() => {
          toast.success('Patient registered', {
            description: 'The new patient has been added successfully.',
          });
          router.push('/patients');
        }}
        onCancel={() => router.push('/patients')}
        submitLabel="Register Patient"
      />
    </DashboardShell>
  );
}
