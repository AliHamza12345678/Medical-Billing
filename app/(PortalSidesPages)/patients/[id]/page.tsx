'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Edit,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  Upload,
  ShieldCheck,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip, GenericBadge } from '@/components/features/status-chip';
import { FileUpload } from '@/components/features/file-upload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { getPatientById } from '@/data/patients';
import { patientInitials } from '@/data/patients';
import { getClaimsByPatient } from '@/data/claims';
import { getPaymentsByPatient } from '@/data/payments';
import { getEligibilityByPatient, getAuthorizationsByPatient } from '@/data/insurance';
import { formatCurrency, formatDate, age } from '@/lib/format';
import type { Claim, Payment } from '@/types';

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const patient = getPatientById(params.id);

  if (!patient) {
    return (
      <DashboardShell>
        <PageHeader title="Patient Not Found" breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Patients', href: '/patients' }]} />
        <p className="text-muted-foreground">This patient does not exist.</p>
      </DashboardShell>
    );
  }

  const claims = getClaimsByPatient(patient.id);
  const payments = getPaymentsByPatient(patient.id);
  const eligibility = getEligibilityByPatient(patient.id);
  const authorizations = getAuthorizationsByPatient(patient.id);

  const claimColumns: ColumnDef<Claim>[] = [
    { accessorKey: 'claimNumber', header: 'Claim #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.claimNumber}</span> },
    { accessorKey: 'serviceDate', header: 'Service Date', cell: ({ row }) => <span className="text-sm">{formatDate(row.original.serviceDate)}</span> },
    { accessorKey: 'insuranceProvider', header: 'Insurer' },
    { accessorKey: 'billedAmount', header: 'Billed', cell: ({ row }) => formatCurrency(row.original.billedAmount) },
    { accessorKey: 'paidAmount', header: 'Paid', cell: ({ row }) => <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(row.original.paidAmount)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  const paymentColumns: ColumnDef<Payment>[] = [
    { accessorKey: 'paymentNumber', header: 'Payment #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.paymentNumber}</span> },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-sm">{formatDate(row.original.date)}</span> },
    { accessorKey: 'method', header: 'Method' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.amount)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        description={`${patient.mrn} · ${age(patient.dateOfBirth)} yrs · ${patient.gender}`}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Patients', href: '/patients' },
          { label: `${patient.firstName} ${patient.lastName}` },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(`/patients/${patient.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" /> New Claim
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20">
                <AvatarFallback className={`${patient.avatarColor} text-xl font-bold text-white`}>
                  {patientInitials(patient)}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-lg font-bold">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{patient.mrn}</p>
              <div className="mt-3">
                <StatusChip status={patient.status} />
              </div>
            </div>

            <Separator className="my-5" />

            <div className="space-y-3">
              <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(patient.dateOfBirth)} />
              <InfoRow icon={Phone} label="Phone" value={patient.phone} />
              <InfoRow icon={Mail} label="Email" value={patient.email} />
              <InfoRow icon={MapPin} label="Address" value={`${patient.address}, ${patient.city}, ${patient.state} ${patient.zip}`} />
              <InfoRow icon={Calendar} label="Registered" value={formatDate(patient.registeredOn)} />
              <InfoRow icon={Calendar} label="Last Visit" value={formatDate(patient.lastVisit)} />
            </div>

            <Separator className="my-5" />

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs font-medium text-muted-foreground">Outstanding Balance</p>
              <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(patient.balance)}
              </p>
              <Button className="mt-3 w-full" size="sm">
                <CreditCard className="mr-2 h-4 w-4" /> Collect Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="insurance">
            <TabsList className="mb-4 w-full justify-start overflow-x-auto">
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
              <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              <TabsTrigger value="auths">Authorizations</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="insurance" className="space-y-4">
              {patient.insurance.map((ins, i) => (
                <Card key={ins.id}>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        {ins.provider}
                      </CardTitle>
                      <CardDescription>{ins.planName}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <GenericBadge variant={ins.priority === 'Primary' ? 'info' : 'neutral'}>
                        {ins.priority}
                      </GenericBadge>
                      <StatusChip status={ins.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <DetailItem label="Member ID" value={ins.memberId} />
                      <DetailItem label="Group #" value={ins.groupNumber} />
                      <DetailItem label="Copay" value={formatCurrency(ins.copay)} />
                      <DetailItem label="Coverage" value={`${ins.coveragePercent}%`} />
                    </div>
                    <Separator className="my-4" />
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Deductible</span>
                        <span className="font-medium">
                          {formatCurrency(ins.deductibleMet)} / {formatCurrency(ins.deductible)}
                        </span>
                      </div>
                      <Progress value={(ins.deductibleMet / ins.deductible) * 100} className="h-2" />
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                      <span>Effective: {formatDate(ins.effectiveDate)}</span>
                      <span>Expires: {formatDate(ins.expiryDate)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="claims">
              <Card>
                <CardContent className="pt-6">
                  <DataTable columns={claimColumns} data={claims} pageSize={5} searchKey="claimNumber" searchPlaceholder="Search claims..." />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardContent className="pt-6">
                  <DataTable columns={paymentColumns} data={payments} pageSize={5} searchKey="paymentNumber" searchPlaceholder="Search payments..." />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="eligibility" className="space-y-3">
              {eligibility.length === 0 ? (
                <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No eligibility verifications on file.</CardContent></Card>
              ) : (
                eligibility.map((ev) => (
                  <Card key={ev.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-sm font-medium">{ev.provider} — {ev.planName}</p>
                        <p className="text-xs text-muted-foreground">Verified {formatDate(ev.verificationDate)} · Member {ev.memberId}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p>Copay: <span className="font-medium">{formatCurrency(ev.copay)}</span></p>
                          <p className="text-xs text-muted-foreground">Deductible left: {formatCurrency(ev.deductibleRemaining)}</p>
                        </div>
                        <StatusChip status={ev.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="auths" className="space-y-3">
              {authorizations.length === 0 ? (
                <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No authorizations on file.</CardContent></Card>
              ) : (
                authorizations.map((auth) => (
                  <Card key={auth.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-medium">
                            <Stethoscope className="h-4 w-4 text-primary" />
                            {auth.procedure}
                          </p>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">{auth.authorizationNumber}</p>
                        </div>
                        <StatusChip status={auth.status} />
                      </div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                        <DetailItem label="Visits" value={`${auth.visitsUsed}/${auth.visitsApproved}`} />
                        <DetailItem label="Valid From" value={formatDate(auth.validFrom)} />
                        <DetailItem label="Valid To" value={formatDate(auth.validTo)} />
                        <DetailItem label="Provider" value={auth.provider} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="space-y-2">
                {patient.documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} · {doc.size} · {formatDate(doc.uploadedOn)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <FileUpload label="Upload new document" hint="PDF, PNG, JPG up to 10MB" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
