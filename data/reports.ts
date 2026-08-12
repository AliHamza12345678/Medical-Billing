import type {
  DashboardStat,
  MonthlyRevenuePoint,
  ClaimStatusBreakdown,
  RevenueTrendPoint,
  OutstandingBucket,
  ActivityItem,
  AgingRow,
  ProviderReportRow,
  InsuranceReportRow,
} from '@/types';
import { claims } from './claims';
import { payments } from './payments';
import { patients } from './patients';
import { insuranceProviders } from './insurance';

export const dashboardStats: DashboardStat[] = [
  { id: 'patients', label: 'Total Patients', value: '1,284', amount: patients.length * 27, change: 8.2, trend: 'up', icon: 'Users', color: 'primary' },
  { id: 'revenue', label: 'Total Revenue', value: '$284,750', amount: 284750, change: 12.5, trend: 'up', icon: 'DollarSign', color: 'success' },
  { id: 'outstanding', label: 'Outstanding Balance', value: '$92,340', amount: 92340, change: -3.1, trend: 'down', icon: 'AlertCircle', color: 'warning' },
  { id: 'claims-submitted', label: 'Claims Submitted', value: '1,842', amount: 1842, change: 5.4, trend: 'up', icon: 'FileText', color: 'info' },
  { id: 'paid-claims', label: 'Paid Claims', value: '1,683', amount: 1683, change: 9.7, trend: 'up', icon: 'CheckCircle', color: 'success' },
  { id: 'pending-claims', label: 'Pending Claims', value: '127', amount: 127, change: -2.4, trend: 'down', icon: 'Clock', color: 'warning' },
  { id: 'denied-claims', label: 'Denied Claims', value: '32', amount: 32, change: 1.8, trend: 'up', icon: 'XCircle', color: 'destructive' },
];

export const monthlyRevenue: MonthlyRevenuePoint[] = [
  { month: 'Jan', revenue: 182000, claims: 142, paid: 128 },
  { month: 'Feb', revenue: 195500, claims: 151, paid: 139 },
  { month: 'Mar', revenue: 210300, claims: 168, paid: 152 },
  { month: 'Apr', revenue: 204800, claims: 159, paid: 141 },
  { month: 'May', revenue: 228700, claims: 174, paid: 161 },
  { month: 'Jun', revenue: 241200, claims: 182, paid: 170 },
  { month: 'Jul', revenue: 257900, claims: 195, paid: 183 },
  { month: 'Aug', revenue: 284750, claims: 212, paid: 196 },
];

export const claimStatusBreakdown: ClaimStatusBreakdown[] = [
  { name: 'Paid', value: 1683, color: 'hsl(var(--chart-2))' },
  { name: 'Pending', value: 127, color: 'hsl(var(--chart-3))' },
  { name: 'Submitted', value: 89, color: 'hsl(var(--chart-1))' },
  { name: 'Denied', value: 32, color: 'hsl(var(--chart-4))' },
  { name: 'Rejected', value: 11, color: 'hsl(var(--chart-5))' },
];

export const revenueTrend: RevenueTrendPoint[] = [
  { month: 'Jan', revenue: 182000, target: 190000 },
  { month: 'Feb', revenue: 195500, target: 195000 },
  { month: 'Mar', revenue: 210300, target: 200000 },
  { month: 'Apr', revenue: 204800, target: 210000 },
  { month: 'May', revenue: 228700, target: 220000 },
  { month: 'Jun', revenue: 241200, target: 230000 },
  { month: 'Jul', revenue: 257900, target: 245000 },
  { month: 'Aug', revenue: 284750, target: 260000 },
];

export const outstandingBuckets: OutstandingBucket[] = [
  { bucket: '0-30', amount: 28400, claims: 42 },
  { bucket: '31-60', amount: 22100, claims: 31 },
  { bucket: '61-90', amount: 18900, claims: 24 },
  { bucket: '91-120', amount: 12400, claims: 17 },
  { bucket: '120+', amount: 10540, claims: 13 },
];

export const recentActivity: ActivityItem[] = [
  { id: 'a1', type: 'payment', title: 'Payment received from Blue Cross Blue Shield', description: 'CLM-2025-900042 — Insurance payment posted', amount: 1240, timestamp: '2025-08-03T09:24:00', actor: 'System', status: 'Paid' },
  { id: 'a2', type: 'claim', title: 'New claim submitted for Mary Johnson', description: 'CLM-2025-900064 — Submitted to Aetna', amount: 480, timestamp: '2025-08-03T08:51:00', actor: 'Sarah Chen', status: 'Submitted' },
  { id: 'a3', type: 'denial', title: 'Claim denied by UnitedHealthcare', description: 'CLM-2025-900038 — Missing prior authorization', amount: 720, timestamp: '2025-08-02T16:32:00', actor: 'Payer', status: 'Denied' },
  { id: 'a4', type: 'patient', title: 'New patient registered: David Rodriguez', description: 'PT-0009 — Insurance eligibility verified', timestamp: '2025-08-02T14:18:00', actor: 'Front Desk' },
  { id: 'a5', type: 'authorization', title: 'Authorization approved for MRI Lumbar Spine', description: 'AUTH-2025-77821 — James Smith, 3 visits approved', timestamp: '2025-08-02T11:05:00', actor: 'Blue Cross Blue Shield' },
  { id: 'a6', type: 'payment', title: 'Patient payment received from Patricia Brown', description: 'Copay collected — $25.00', amount: 25, timestamp: '2025-08-02T10:42:00', actor: 'Front Desk', status: 'Paid' },
  { id: 'a7', type: 'claim', title: 'Claim paid by Medicare', description: 'CLM-2025-900021 — Payment posted', amount: 980, timestamp: '2025-08-01T15:28:00', actor: 'System', status: 'Paid' },
  { id: 'a8', type: 'denial', title: 'Claim rejected by Cigna', description: 'CLM-2025-900015 — Timely filing limit exceeded', amount: 320, timestamp: '2025-08-01T13:14:00', actor: 'Payer', status: 'Rejected' },
];

export const agingReport: AgingRow[] = [
  { bucket: '0-30 days', claims: 42, amount: 28400, percent: 30.8 },
  { bucket: '31-60 days', claims: 31, amount: 22100, percent: 23.9 },
  { bucket: '61-90 days', claims: 24, amount: 18900, percent: 20.5 },
  { bucket: '91-120 days', claims: 17, amount: 12400, percent: 13.4 },
  { bucket: '120+ days', claims: 13, amount: 10540, percent: 11.4 },
];

export const providerReport: ProviderReportRow[] = [
  { provider: 'Dr. Sarah Chen', patients: 412, claims: 524, submitted: 498, paid: 461, denied: 18, revenue: 98240, collectionRate: 92.6 },
  { provider: 'Dr. Michael Reyes', patients: 368, claims: 471, submitted: 445, paid: 408, denied: 22, revenue: 84120, collectionRate: 91.7 },
  { provider: 'Dr. Emily Park', patients: 284, claims: 392, submitted: 371, paid: 342, denied: 15, revenue: 76310, collectionRate: 92.2 },
  { provider: 'Dr. James Wilson', patients: 142, claims: 231, submitted: 218, paid: 198, denied: 12, revenue: 52840, collectionRate: 90.8 },
  { provider: 'Dr. Olivia Brooks', patients: 78, claims: 142, submitted: 131, paid: 119, denied: 8, revenue: 38120, collectionRate: 90.8 },
];

export const insuranceReport: InsuranceReportRow[] = insuranceProviders
  .filter((p) => p.status === 'Active')
  .map((p) => ({
    provider: p.name,
    claims: p.claimsSubmitted,
    paid: p.claimsPaid,
    denied: p.claimsSubmitted - p.claimsPaid - Math.floor(p.claimsSubmitted * 0.02),
    revenue: p.totalRevenue,
    avgDays: p.avgProcessingDays,
    denialRate: Number(((1 - p.claimsPaid / p.claimsSubmitted) * 100).toFixed(1)),
  }));

export { claims, payments, patients };
