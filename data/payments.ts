import type { Payment, Invoice, Adjustment, PaymentMethod, PaymentStatus } from '@/types';
import { patients } from './patients';

const methods: PaymentMethod[] = ['Insurance', 'Credit Card', 'Cash', 'Check', 'ACH', 'HSA'];
const payStatuses: PaymentStatus[] = ['Paid', 'Paid', 'Paid', 'Pending', 'Failed', 'Refunded', 'Partial'];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
const rng = seeded(11);
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

export const payments: Payment[] = Array.from({ length: 52 }, (_, i) => {
  const patient = patients[i % patients.length];
  const amount = 50 + Math.floor(rng() * 1800);
  const status = pick(payStatuses);
  const type = rng() > 0.55 ? 'Insurance Payment' : rng() > 0.4 ? 'Patient Payment' : rng() > 0.6 ? 'Adjustment' : 'Refund';
  return {
    id: `pay-${String(i + 1).padStart(4, '0')}`,
    paymentNumber: `PAY-2025-${String(500001 + i).slice(-6)}`,
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientId: patient.id,
    amount,
    method: type === 'Insurance Payment' ? 'Insurance' : pick(methods.filter((m) => m !== 'Insurance')),
    status,
    date: `2025-0${1 + Math.floor(rng() * 7)}-${String(1 + Math.floor(rng() * 28)).padStart(2, '0')}`,
    appliedTo: `CLM-2025-${String(900001 + (i % 64)).slice(-6)}`,
    reference: `REF-${String(80000 + i * 13).slice(-5)}`,
    type,
  };
});

export function getPaymentsByPatient(patientId: string): Payment[] {
  return payments.filter((p) => p.patientId === patientId);
}

export const adjustments: Adjustment[] = Array.from({ length: 18 }, (_, i) => {
  const patient = patients[i % patients.length];
  const types: Adjustment['type'][] = ['Contractual Adjustment', 'Write-off', 'Refund', 'Administrative', 'Coding Correction'];
  return {
    id: `adj-${String(i + 1).padStart(4, '0')}`,
    adjustmentNumber: `ADJ-2025-${String(300001 + i).slice(-6)}`,
    patientName: `${patient.firstName} ${patient.lastName}`,
    claimNumber: `CLM-2025-${String(900001 + (i % 64)).slice(-6)}`,
    amount: 25 + Math.floor(rng() * 450),
    type: pick(types),
    reason: pick([
      'Contractual write-off per payer agreement',
      'Duplicate charge correction',
      'Patient refund for overpayment',
      'Coding correction - downcode by payer',
      'Administrative adjustment - bad debt',
    ]),
    date: `2025-0${1 + Math.floor(rng() * 7)}-${String(1 + Math.floor(rng() * 28)).padStart(2, '0')}`,
    postedBy: pick(['Sarah Chen', 'Michael Reyes', 'Emily Park', 'James Wilson']),
  };
});

export function getAdjustmentsByPatient(patientId: string): Adjustment[] {
  return adjustments.filter((a) => a.patientName.includes(patients.find((p) => p.id === patientId)?.firstName ?? ''));
}

export const invoices: Invoice[] = Array.from({ length: 40 }, (_, i) => {
  const patient = patients[i % patients.length];
  const amount = 120 + Math.floor(rng() * 2200);
  const paid = rng() > 0.5 ? amount : rng() > 0.5 ? Math.floor(amount * 0.5) : 0;
  const balance = amount - paid;
  const statuses: Invoice['status'][] = balance === 0 ? ['Paid'] : paid > 0 ? ['Partial'] : ['Pending', 'Overdue', 'Draft'];
  const codes = [
    { code: '99213', desc: 'Office visit, established patient', price: 110 },
    { code: '99214', desc: 'Office visit, established patient, moderate', price: 165 },
    { code: '93000', desc: 'Electrocardiogram, complete', price: 95 },
    { code: '80053', desc: 'Comprehensive metabolic panel', price: 45 },
    { code: '71045', desc: 'X-ray, chest, single view', price: 75 },
    { code: '85025', desc: 'Complete blood count with differential', price: 32 },
  ];
  const itemCount = 2 + Math.floor(rng() * 3);
  const items = Array.from({ length: itemCount }, (_, j) => {
    const c = pick(codes);
    const qty = 1 + Math.floor(rng() * 2);
    return { id: `li-${i}-${j}`, description: c.desc, cptCode: c.code, quantity: qty, unitPrice: c.price, total: qty * c.price };
  });
  const total = items.reduce((s, it) => s + it.total, 0);
  return {
    id: `inv-${String(i + 1).padStart(4, '0')}`,
    invoiceNumber: `INV-2025-${String(700001 + i).slice(-6)}`,
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientId: patient.id,
    issueDate: `2025-0${1 + Math.floor(rng() * 7)}-${String(1 + Math.floor(rng() * 28)).padStart(2, '0')}`,
    dueDate: `2025-0${1 + Math.floor(rng() * 7)}-${String(1 + Math.floor(rng() * 28)).padStart(2, '0')}`,
    amount: total,
    paidAmount: paid,
    balance: total - paid,
    status: pick(statuses),
    items,
    notes: 'Thank you for your payment. Please remit balance by the due date.',
  };
});

export function getInvoiceById(id: string): Invoice | undefined {
  return invoices.find((inv) => inv.id === id);
}

export function getInvoicesByPatient(patientId: string): Invoice[] {
  return invoices.filter((inv) => inv.patientId === patientId);
}
