import type { AppNotification } from '@/types';

export const notifications: AppNotification[] = [
  { id: 'n1', type: 'payment_due', title: 'Payment Due', message: 'Invoice INV-2025-700008 for Mary Johnson is due in 3 days ($180.00)', timestamp: '2025-08-03T09:00:00', read: false, priority: 'high', actionUrl: '/payments/invoices' },
  { id: 'n2', type: 'claim_approved', title: 'Claim Approved', message: 'CLM-2025-900042 approved by Blue Cross Blue Shield for $1,240.00', timestamp: '2025-08-03T08:15:00', read: false, priority: 'medium', actionUrl: '/claims' },
  { id: 'n3', type: 'claim_rejected', title: 'Claim Rejected', message: 'CLM-2025-900015 rejected by Cigna — timely filing limit exceeded', timestamp: '2025-08-02T16:30:00', read: false, priority: 'high', actionUrl: '/claims' },
  { id: 'n4', type: 'invoice_generated', title: 'Invoice Generated', message: 'Invoice INV-2025-700064 generated for James Smith ($480.00)', timestamp: '2025-08-02T14:00:00', read: true, priority: 'low', actionUrl: '/payments/invoices' },
  { id: 'n5', type: 'eligibility_verified', title: 'Eligibility Verified', message: 'Insurance eligibility confirmed for Patricia Brown (UHC Choice Plus)', timestamp: '2025-08-02T11:20:00', read: true, priority: 'low', actionUrl: '/insurance/eligibility' },
  { id: 'n6', type: 'authorization_required', title: 'Authorization Required', message: 'Prior authorization needed for MRI Lumbar Spine — Robert Williams', timestamp: '2025-08-02T10:45:00', read: true, priority: 'medium', actionUrl: '/insurance/authorizations' },
  { id: 'n7', type: 'denial_received', title: 'Denial Received', message: 'CLM-2025-900038 denied by UnitedHealthcare — missing prior authorization', timestamp: '2025-08-02T09:30:00', read: true, priority: 'high', actionUrl: '/claims' },
  { id: 'n8', type: 'payment_due', title: 'Payment Due', message: 'Invoice INV-2025-700012 for Patricia Brown is overdue ($320.00)', timestamp: '2025-08-01T15:00:00', read: true, priority: 'high', actionUrl: '/payments/invoices' },
  { id: 'n9', type: 'claim_approved', title: 'Claim Approved', message: 'CLM-2025-900021 paid by Medicare for $980.00', timestamp: '2025-08-01T12:15:00', read: true, priority: 'medium', actionUrl: '/claims' },
  { id: 'n10', type: 'invoice_generated', title: 'Invoice Generated', message: 'Batch invoice run completed — 24 invoices generated', timestamp: '2025-08-01T08:00:00', read: true, priority: 'low', actionUrl: '/payments/invoices' },
];

export function unreadNotificationCount(): number {
  return notifications.filter((n) => !n.read).length;
}
