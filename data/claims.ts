import type { Claim, ClaimStatus, ClaimTimelineEvent } from '@/types';
import { patients } from './patients';
import { insuranceProviders } from './insurance';
import { procedureCodes, diagnosisCodes } from './charge-entry';

const claimStatuses: ClaimStatus[] = [
  'Submitted', 'Pending', 'Paid', 'Denied', 'Rejected',
];

const deniedReasons = [
  'Missing prior authorization',
  'Service not covered under plan',
  'Coding error - invalid CPT/ICD combination',
  'Timely filing limit exceeded',
  'Duplicate claim submission',
  'Eligibility terminated on date of service',
];

const providers = ['Dr. Sarah Chen', 'Dr. Michael Reyes', 'Dr. Emily Park', 'Dr. James Wilson', 'Dr. Olivia Brooks'];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const rng = seeded(7);
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

function makeTimeline(claimId: string, status: ClaimStatus, submissionDate: string): ClaimTimelineEvent[] {
  const events: ClaimTimelineEvent[] = [
    { id: `tl-${claimId}-1`, date: submissionDate, event: 'Claim Submitted', description: 'Claim submitted electronically to payer', actor: 'System', type: 'submission' },
    { id: `tl-${claimId}-2`, date: submissionDate, event: 'Acknowledgment Received', description: 'Payer acknowledged receipt of claim', actor: 'Payer', type: 'status' },
  ];
  if (status === 'Pending') {
    events.push({ id: `tl-${claimId}-3`, date: '2025-08-02', event: 'Adjudication In Progress', description: 'Claim is under review by the payer', actor: 'Payer', type: 'status' });
  }
  if (status === 'Paid') {
    events.push({ id: `tl-${claimId}-3`, date: '2025-07-28', event: 'Claim Adjudicated', description: 'Claim approved for payment', actor: 'Payer', type: 'status' });
    events.push({ id: `tl-${claimId}-4`, date: '2025-08-01', event: 'Payment Received', description: 'Payment posted to patient account', actor: 'Billing Team', type: 'payment' });
  }
  if (status === 'Denied' || status === 'Rejected') {
    events.push({ id: `tl-${claimId}-3`, date: '2025-08-01', event: 'Claim Denied', description: pick(deniedReasons), actor: 'Payer', type: 'denial' });
    events.push({ id: `tl-${claimId}-4`, date: '2025-08-02', event: 'Appeal Initiated', description: 'Billing team reviewing denial for appeal', actor: 'Billing Team', type: 'note' });
  }
  return events;
}

function buildClaims(): Claim[] {
  const claims: Claim[] = [];
  for (let i = 0; i < 64; i++) {
    const patient = patients[i % patients.length];
    const provider = pick(insuranceProviders);
    const status = i < 8 ? 'Submitted' : pick(claimStatuses);
    const cptCount = 1 + Math.floor(rng() * 3);
    const cpts: string[] = [];
    for (let j = 0; j < cptCount; j++) cpts.push(pick(procedureCodes).cptCode);
    const icdCount = 1 + Math.floor(rng() * 2);
    const icds: string[] = [];
    for (let j = 0; j < icdCount; j++) icds.push(pick(diagnosisCodes).icd10Code);
    const billedAmount = 150 + Math.floor(rng() * 2800);
    const paidAmount = status === 'Paid' ? Math.floor(billedAmount * (0.6 + rng() * 0.3)) : status === 'Pending' || status === 'Submitted' ? 0 : Math.floor(billedAmount * rng() * 0.2);
    const patientResponsibility = billedAmount - paidAmount;
    const submissionDay = 1 + Math.floor(rng() * 28);
    const submissionDate = `2025-0${1 + Math.floor(rng() * 7)}-${String(submissionDay).padStart(2, '0')}`;
    const serviceDate = `2025-0${1 + Math.floor(rng() * 7)}-${String(Math.max(1, submissionDay - 3)).padStart(2, '0')}`;
    const ageDays = 1 + Math.floor(rng() * 60);
    claims.push({
      id: `cl-${String(i + 1).padStart(4, '0')}`,
      claimNumber: `CLM-2025-${String(900001 + i).slice(-6)}`,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient.id,
      provider: pick(providers),
      insuranceProvider: provider.name,
      serviceDate,
      submissionDate,
      billedAmount,
      paidAmount,
      patientResponsibility,
      status,
      priority: rng() > 0.85 ? 'Urgent' : rng() > 0.95 ? 'Emergency' : 'Routine',
      cptCodes: Array.from(new Set(cpts)),
      icd10Codes: Array.from(new Set(icds)),
      deniedReason: status === 'Denied' || status === 'Rejected' ? pick(deniedReasons) : null,
      ageDays,
      timeline: makeTimeline(`cl-${String(i + 1).padStart(4, '0')}`, status, submissionDate),
    });
  }
  return claims;
}

export const claims: Claim[] = buildClaims();

export function getClaimById(id: string): Claim | undefined {
  return claims.find((c) => c.id === id);
}

export function getClaimsByPatient(patientId: string): Claim[] {
  return claims.filter((c) => c.patientId === patientId);
}

export const claimStatusCounts = claimStatuses.map((s) => ({
  status: s,
  count: claims.filter((c) => c.status === s).length,
}));

export const claimColors: Record<ClaimStatus, string> = {
  Submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Denied: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};
