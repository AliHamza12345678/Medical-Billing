'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Send, CheckCircle2, DollarSign, XCircle, Clock, StickyNote,
  Calendar, User, ShieldCheck, Printer, Mail, Download,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { StatusChip } from '@/components/features/status-chip';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getClaimById } from '@/data/claims';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import type { ClaimTimelineEvent } from '@/types';

const timelineIconMap: Record<ClaimTimelineEvent['type'], { icon: typeof Send; color: string }> = {
  submission: { icon: Send, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  status: { icon: Clock, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  payment: { icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  note: { icon: FileText, color: 'bg-secondary text-secondary-foreground' },
  denial: { icon: XCircle, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
};

export default function ClaimDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const claim = getClaimById(params.id);

  if (!claim) {
    return (
      <DashboardShell>
        <PageHeader title="Claim Not Found" breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Claims', href: '/claims' }]} />
        <p className="text-muted-foreground">This claim does not exist.</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        title={claim.claimNumber}
        description={`${claim.patientName} · ${claim.insuranceProvider}`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Claims', href: '/claims' }, { label: claim.claimNumber }]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push('/claims')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>
            <Button><Download className="mr-2 h-4 w-4" /> Export</Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Billed Amount" value={formatCurrency(claim.billedAmount)} />
        <StatBox label="Paid Amount" value={formatCurrency(claim.paidAmount)} valueClass="text-emerald-600 dark:text-emerald-400" />
        <StatBox label="Patient Responsibility" value={formatCurrency(claim.patientResponsibility)} valueClass="text-amber-600 dark:text-amber-400" />
        <StatBox label="Age" value={`${claim.ageDays} days`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Claim Details</CardTitle><CardDescription>Service and submission information</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow icon={User} label="Patient" value={claim.patientName} />
              <DetailRow icon={ShieldCheck} label="Insurance" value={claim.insuranceProvider} />
              <DetailRow icon={Calendar} label="Service Date" value={formatDate(claim.serviceDate)} />
              <DetailRow icon={Calendar} label="Submission Date" value={formatDate(claim.submissionDate)} />
              <DetailRow icon={User} label="Provider" value={claim.provider} />
              <DetailRow icon={FileText} label="Priority" value={claim.priority} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Codes</CardTitle><CardDescription>Procedure and diagnosis codes on this claim</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">CPT Codes</p>
                <div className="flex flex-wrap gap-2">
                  {claim.cptCodes.map((c) => (
                    <span key={c} className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">ICD-10 Codes</p>
                <div className="flex flex-wrap gap-2">
                  {claim.icd10Codes.map((c) => (
                    <span key={c} className="rounded-md bg-secondary px-2.5 py-1 font-mono text-xs font-semibold">{c}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {(claim.deniedReason || claim.status === 'Denied' || claim.status === 'Rejected') && (
            <Card className="border-destructive/30">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base text-destructive"><XCircle className="h-4 w-4" /> Denial Information</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg bg-destructive/5 p-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Denial Reason</p>
                    <p className="mt-1 text-sm font-medium">{claim.deniedReason ?? 'Not specified'}</p>
                  </div>
                  <Button variant="outline" size="sm">Initiate Appeal</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Status</CardTitle>
              <StatusChip status={claim.status} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button size="sm" className="flex-1"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark Paid</Button>
                <Button size="sm" variant="outline" className="flex-1">Resubmit</Button>
              </div>
              <Button variant="outline" size="sm" className="w-full"><Mail className="mr-2 h-3.5 w-3.5" /> Email Patient</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Claim Timeline</CardTitle><CardDescription>History of this claim</CardDescription></CardHeader>
            <CardContent>
              <ol className="relative space-y-5 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
                {claim.timeline.map((event) => {
                  const { icon: Icon, color } = timelineIconMap[event.type];
                  return (
                    <li key={event.id} className="relative flex gap-4">
                      <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium">{event.event}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatDateTime(event.date)} · {event.actor}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatBox({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <Card><CardContent className="py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-bold ${valueClass ?? ''}`}>{value}</p>
    </CardContent></Card>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
