import type { DashboardStat } from '@/types';

export const dashboardData: DashboardStat[] = [
  { id: 'patients', label: 'Total Patients', value: '1,284', amount: 1284, change: 8.2, trend: 'up', icon: 'Users', color: 'primary' },
  { id: 'revenue', label: 'Total Revenue', value: '$284,750', amount: 284750, change: 12.5, trend: 'up', icon: 'DollarSign', color: 'success' },
  { id: 'outstanding', label: 'Outstanding Balance', value: '$92,340', amount: 92340, change: -3.1, trend: 'down', icon: 'AlertCircle', color: 'warning' },
  { id: 'claims-submitted', label: 'Claims Submitted', value: '1,842', amount: 1842, change: 5.4, trend: 'up', icon: 'FileText', color: 'info' },
  { id: 'paid-claims', label: 'Paid Claims', value: '1,683', amount: 1683, change: 9.7, trend: 'up', icon: 'CheckCircle', color: 'success' },
  { id: 'pending-claims', label: 'Pending Claims', value: '127', amount: 127, change: -2.4, trend: 'down', icon: 'Clock', color: 'warning' },
  { id: 'denied-claims', label: 'Denied Claims', value: '32', amount: 32, change: 1.8, trend: 'up', icon: 'XCircle', color: 'destructive' },
];

export const portalStats: DashboardStat[] = [
  { id: 'balance', label: 'Current Balance', value: '$485.00', amount: 485, change: -12.4, trend: 'down', icon: 'Wallet', color: 'warning' },
  { id: 'paid', label: 'Total Paid (YTD)', value: '$3,240.00', amount: 3240, change: 0, trend: 'flat', icon: 'CheckCircle', color: 'success' },
  { id: 'invoices', label: 'Open Invoices', value: '3', amount: 3, change: 0, trend: 'flat', icon: 'FileText', color: 'info' },
  { id: 'next-due', label: 'Next Payment Due', value: 'Aug 15', amount: 0, change: 0, trend: 'flat', icon: 'CalendarClock', color: 'primary' },
];

export const portalInvoices = [
  { id: 'pinv-1', number: 'INV-2025-700008', date: '2025-08-01', amount: 480, balance: 180, status: 'Partial' as const },
  { id: 'pinv-2', number: 'INV-2025-700012', date: '2025-07-15', amount: 320, balance: 320, status: 'Pending' as const },
  { id: 'pinv-3', number: 'INV-2025-700015', date: '2025-07-02', amount: 240, balance: 0, status: 'Paid' as const },
  { id: 'pinv-4', number: 'INV-2025-700018', date: '2025-06-18', amount: 680, balance: 0, status: 'Paid' as const },
  { id: 'pinv-5', number: 'INV-2025-700021', date: '2025-06-01', amount: 195, balance: 0, status: 'Paid' as const },
];

export const portalPayments = [
  { id: 'ppay-1', date: '2025-08-01', amount: 300, method: 'Credit Card', invoice: 'INV-2025-700008', status: 'Paid' as const },
  { id: 'ppay-2', date: '2025-07-02', amount: 240, method: 'Credit Card', invoice: 'INV-2025-700015', status: 'Paid' as const },
  { id: 'ppay-3', date: '2025-06-18', amount: 680, method: 'HSA', invoice: 'INV-2025-700018', status: 'Paid' as const },
  { id: 'ppay-4', date: '2025-06-01', amount: 195, method: 'Credit Card', invoice: 'INV-2025-700021', status: 'Paid' as const },
  { id: 'ppay-5', date: '2025-05-15', amount: 420, method: 'Check', invoice: 'INV-2025-700025', status: 'Paid' as const },
];

export const portalStatements = [
  { id: 'ps-1', period: 'July 2025', date: '2025-07-31', charges: 920, payments: 540, balance: 380, status: 'Open' as const },
  { id: 'ps-2', period: 'June 2025', date: '2025-06-30', charges: 875, payments: 875, balance: 0, status: 'Closed' as const },
  { id: 'ps-3', period: 'May 2025', date: '2025-05-31', charges: 615, payments: 615, balance: 0, status: 'Closed' as const },
  { id: 'ps-4', period: 'April 2025', date: '2025-04-30', charges: 540, payments: 540, balance: 0, status: 'Closed' as const },
];
