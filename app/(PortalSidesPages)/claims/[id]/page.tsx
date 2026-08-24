'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Send, CheckCircle2, DollarSign, XCircle, Clock,
  Calendar, User, ShieldCheck, Printer, Download, Sparkles,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { StatusChip } from '@/components/features/status-chip';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getClaimById } from '@/data/claims';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import type { Claim, ClaimTimelineEvent } from '@/types';

import { toast } from 'sonner';

const timelineIconMap: Record<ClaimTimelineEvent['type'], { icon: typeof Send; color: string }> = {
  submission: { icon: Send, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  status: { icon: Clock, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  payment: { icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  note: { icon: FileText, color: 'bg-secondary text-secondary-foreground' },
  denial: { icon: XCircle, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
};

export default function ClaimDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [claim, setClaim] = useState<Claim | null>(() => getClaimById(params.id) || null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const fetchClaimDetails = async () => {
    try {
      const res = await fetch(`/api/claims/${params.id}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setClaim(data.data);
      }
    } catch (err) {
      console.error('[FETCH_CLAIM_DETAILS_ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimDetails();
  }, [params.id]);

  const handleMarkPaid = async () => {
    if (!claim) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/claims/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paid', paidAmount: Number(claim.billedAmount) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Claim updated', { description: 'Claim has been marked as Paid.' });
        fetchClaimDetails();
      } else {
        toast.error('Failed to update claim', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[MARK_PAID_ERROR]', err);
      toast.error('Error', { description: 'Failed to update claim status' });
    } finally {
      setProcessing(false);
    }
  };

  const handleResubmit = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/claims/${params.id}/resubmit`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Claim resubmitted', { description: 'Claim has been resubmitted to clearinghouse.' });
        fetchClaimDetails();
      } else {
        toast.error('Resubmission failed', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[RESUBMIT_ERROR]', err);
      toast.error('Error', { description: 'Resubmission failed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleAppeal = async () => {
    const reason = prompt('Enter appeal reason:', 'Disputing denial code CO-45 based on clinical medical necessity.');
    if (!reason) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/claims/${params.id}/appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appealReason: reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Appeal initiated', { description: 'Claim status updated to Pending Appeal.' });
        fetchClaimDetails();
      } else {
        toast.error('Appeal failed', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[APPEAL_ERROR]', err);
      toast.error('Error', { description: 'Appeal request failed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleExportEDI = async () => {
    try {
      const res = await fetch(`/api/claims/${params.id}/edi837`);
      if (!res.ok) throw new Error('Failed to fetch EDI payload');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `claim_${claim?.claimNumber || params.id}_837P.edi`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('EDI 837 Exported', { description: 'ANSI X12 837P file downloaded successfully.' });
    } catch (err) {
      console.error('[EXPORT_EDI_ERROR]', err);
      toast.error('Export Error', { description: 'Could not export EDI file.' });
    }
  };

  if (!claim && !loading) {
    return (
      <DashboardShell>
        <PageHeader title="Claim Not Found" breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Claims', href: '/claims' }]} />
        <p className="text-muted-foreground">This claim does not exist.</p>
      </DashboardShell>
    );
  }

  if (!claim) return null;

  return (
    <DashboardShell>
      <PageHeader
        title={claim.claimNumber}
        description={`${claim.patientName} · ${claim.insuranceProvider}`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Claims', href: '/claims' }, { label: claim.claimNumber }]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push('/claims')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            <Button onClick={handleExportEDI}><Download className="mr-2 h-4 w-4" /> Export EDI</Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Billed Amount" value={formatCurrency(Number(claim.billedAmount))} />
        <StatBox label="Paid Amount" value={formatCurrency(Number(claim.paidAmount))} valueClass="text-emerald-600 dark:text-emerald-400" />
        <StatBox label="Patient Responsibility" value={formatCurrency(Number(claim.patientResponsibility))} valueClass="text-amber-600 dark:text-amber-400" />
        <StatBox label="Age" value={`${claim.ageDays || 0} days`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Claim Details</CardTitle><CardDescription>Service and submission information</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow icon={User} label="Patient" value={claim.patientName} />
              <DetailRow icon={ShieldCheck} label="Insurance" value={claim.insuranceProvider} />
              <DetailRow icon={Calendar} label="Service Date" value={formatDate(String(claim.serviceDate))} />
              <DetailRow icon={Calendar} label="Submission Date" value={formatDate(String(claim.submissionDate))} />
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
                  {claim.cptCodes?.map((c) => (
                    <span key={c} className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">ICD-10 Codes</p>
                <div className="flex flex-wrap gap-2">
                  {claim.icd10Codes?.map((c) => (
                    <span key={c} className="rounded-md bg-secondary px-2.5 py-1 font-mono text-xs font-semibold">{c}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Billing Copilot
                </CardTitle>
                <CardDescription>Intelligent claim scrubbing, issue explanations & recommendations</CardDescription>
              </div>
              <Button size="sm" onClick={async () => {
                setAiAnalyzing(true);
                try {
                  const res = await fetch('/api/ai/analyze-claim', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ claimId: claim.id }),
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    setAiAnalysis(data.data);
                    toast.success('AI Analysis Complete');
                  } else {
                    toast.error('AI Analysis failed', { description: data.error?.message });
                  }
                } catch (err) {
                  console.error('[AI_ANALYSIS_ERROR]', err);
                  toast.error('Error', { description: 'Failed to run AI analysis' });
                } finally {
                  setAiAnalyzing(false);
                }
              }} disabled={aiAnalyzing}>
                {aiAnalyzing ? 'Analyzing...' : 'Run AI Audit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!aiAnalysis ? (
                <p className="text-xs text-muted-foreground">Click &apos;Run AI Audit&apos; to scrub codes, predict denial risks, and get corrective action recommendations.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-background p-3 border">
                    <span className="text-xs font-medium">Scrubbing Status: <strong className={aiAnalysis.status === 'CLEAN' ? 'text-emerald-600' : 'text-rose-600'}>{aiAnalysis.status}</strong></span>
                    <span className="text-xs font-medium">Risk Score: <strong className="font-bold">{aiAnalysis.riskScore}/100</strong></span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{aiAnalysis.summary}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{aiAnalysis.explanation}</p>
                  {aiAnalysis.recommendations?.map((rec: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                      <p className="font-semibold text-primary">{rec.title}</p>
                      <p className="text-muted-foreground">{rec.description}</p>
                      <p className="font-mono text-[11px] text-amber-600 dark:text-amber-400">Action: {rec.actionRequired}</p>
                    </div>
                  ))}
                </div>
              )}
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
                  <Button variant="outline" size="sm" onClick={handleAppeal} disabled={processing}>Initiate Appeal</Button>
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
                <Button size="sm" className="flex-1" onClick={handleMarkPaid} disabled={processing || claim.status === 'Paid'}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark Paid</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={handleResubmit} disabled={processing}>Resubmit</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Claim Timeline</CardTitle><CardDescription>History of this claim</CardDescription></CardHeader>
            <CardContent>
              <ol className="relative space-y-5 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
                {claim.timeline?.map((event) => {
                  const { icon: Icon, color } = timelineIconMap[event.type] || timelineIconMap.status;
                  return (
                    <li key={event.id} className="relative flex gap-4">
                      <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium">{event.event}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatDateTime(String(event.date))} · {event.actor}
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
