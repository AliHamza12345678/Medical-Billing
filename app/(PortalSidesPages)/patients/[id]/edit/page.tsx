'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { PatientForm } from '@/components/features/patient-form';
import { patients, getPatientById } from '@/data/patients';

export default function EditPatientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const patient = getPatientById(params.id);

  if (!patient) {
    return (
      <DashboardShell>
        <PageHeader title="Patient Not Found" breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Patients', href: '/patients' }, { label: 'Edit' }]} />
        <p className="text-muted-foreground">The patient you are looking for does not exist.</p>
      </DashboardShell>
    );
  }

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
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          city: patient.city,
          state: patient.state,
          zip: patient.zip,
          insurance: patient.insurance.map((i) => ({
            provider: i.provider,
            memberId: i.memberId,
            groupNumber: i.groupNumber,
            planName: i.planName,
            priority: i.priority,
            copay: i.copay,
            deductible: i.deductible,
            coveragePercent: i.coveragePercent,
            effectiveDate: i.effectiveDate,
            expiryDate: i.expiryDate,
          })),
        }}
        onSubmit={() => {
          toast.success('Patient updated', {
            description: `${patient.firstName} ${patient.lastName}'s information has been saved.`,
          });
          router.push(`/patients/${patient.id}`);
        }}
        onCancel={() => router.push(`/patients/${patient.id}`)}
        submitLabel="Save Changes"
      />
    </DashboardShell>
  );
}
