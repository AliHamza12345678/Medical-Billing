import type { User, Role } from '@/types';

export const users: User[] = [
  { id: 'usr-001', name: 'Sarah Chen', email: 'sarah.chen@medibill.com', role: 'Administrator', status: 'Active', lastLogin: '2025-08-03T08:12:00', createdOn: '2024-01-15', avatarColor: 'bg-blue-500', permissions: ['all'] },
  { id: 'usr-002', name: 'Michael Reyes', email: 'michael.reyes@medibill.com', role: 'Billing Manager', status: 'Active', lastLogin: '2025-08-03T07:45:00', createdOn: '2024-02-20', avatarColor: 'bg-emerald-500', permissions: ['claims.view', 'claims.edit', 'payments.view', 'payments.edit', 'reports.view', 'patients.view'] },
  { id: 'usr-003', name: 'Emily Park', email: 'emily.park@medibill.com', role: 'Coder', status: 'Active', lastLogin: '2025-08-02T17:33:00', createdOn: '2024-03-10', avatarColor: 'bg-amber-500', permissions: ['charges.view', 'charges.edit', 'claims.view'] },
  { id: 'usr-004', name: 'James Wilson', email: 'james.wilson@medibill.com', role: 'Front Desk', status: 'Active', lastLogin: '2025-08-03T08:01:00', createdOn: '2024-04-05', avatarColor: 'bg-rose-500', permissions: ['patients.view', 'patients.edit', 'eligibility.view'] },
  { id: 'usr-005', name: 'Olivia Brooks', email: 'olivia.brooks@medibill.com', role: 'Provider', status: 'Active', lastLogin: '2025-08-02T19:22:00', createdOn: '2024-05-12', avatarColor: 'bg-violet-500', permissions: ['claims.view', 'charges.view', 'patients.view'] },
  { id: 'usr-006', name: 'Daniel Foster', email: 'daniel.foster@medibill.com', role: 'Billing Manager', status: 'Inactive', lastLogin: '2025-07-15T14:10:00', createdOn: '2024-06-01', avatarColor: 'bg-cyan-500', permissions: ['claims.view', 'claims.edit', 'payments.view', 'reports.view'] },
  { id: 'usr-007', name: 'Rachel Kim', email: 'rachel.kim@medibill.com', role: 'Coder', status: 'Active', lastLogin: '2025-08-01T11:28:00', createdOn: '2024-07-18', avatarColor: 'bg-orange-500', permissions: ['charges.view', 'charges.edit', 'claims.view'] },
  { id: 'usr-008', name: 'Thomas Wright', email: 'thomas.wright@medibill.com', role: 'Front Desk', status: 'Suspended', lastLogin: '2025-06-28T09:15:00', createdOn: '2024-08-22', avatarColor: 'bg-teal-500', permissions: ['patients.view', 'patients.edit'] },
  { id: 'usr-009', name: 'Nina Patel', email: 'nina.patel@medibill.com', role: 'Administrator', status: 'Active', lastLogin: '2025-08-03T06:50:00', createdOn: '2024-09-30', avatarColor: 'bg-indigo-500', permissions: ['all'] },
  { id: 'usr-010', name: 'Carlos Mendoza', email: 'carlos.mendoza@medibill.com', role: 'Provider', status: 'Active', lastLogin: '2025-08-02T16:44:00', createdOn: '2024-10-14', avatarColor: 'bg-blue-600', permissions: ['claims.view', 'charges.view', 'patients.view'] },
];

export const roles: Role[] = [
  { id: 'role-1', name: 'Administrator', description: 'Full system access with all administrative privileges', usersCount: 2, permissions: ['all'], system: true },
  { id: 'role-2', name: 'Billing Manager', description: 'Manage claims, payments, and view reports', usersCount: 2, permissions: ['claims.view', 'claims.edit', 'claims.delete', 'payments.view', 'payments.edit', 'reports.view', 'patients.view', 'patients.edit'], system: false },
  { id: 'role-3', name: 'Coder', description: 'Charge entry and coding workflows', usersCount: 2, permissions: ['charges.view', 'charges.edit', 'claims.view'], system: false },
  { id: 'role-4', name: 'Front Desk', description: 'Patient registration and eligibility checks', usersCount: 2, permissions: ['patients.view', 'patients.edit', 'eligibility.view'], system: false },
  { id: 'role-5', name: 'Provider', description: 'View claims, charges, and patient information', usersCount: 2, permissions: ['claims.view', 'charges.view', 'patients.view'], system: false },
];

export const permissionGroups = [
  { module: 'Dashboard', permissions: ['dashboard.view'] },
  { module: 'Patients', permissions: ['patients.view', 'patients.edit', 'patients.delete'] },
  { module: 'Claims', permissions: ['claims.view', 'claims.edit', 'claims.delete', 'claims.submit'] },
  { module: 'Payments', permissions: ['payments.view', 'payments.edit', 'payments.refund'] },
  { module: 'Charges', permissions: ['charges.view', 'charges.edit'] },
  { module: 'Insurance', permissions: ['insurance.view', 'insurance.edit', 'eligibility.view'] },
  { module: 'Reports', permissions: ['reports.view', 'reports.export'] },
  { module: 'Admin', permissions: ['admin.users', 'admin.roles', 'admin.audit', 'admin.settings'] },
];

export const feeSchedule = [
  { id: 'fs-1', cptCode: '99213', description: 'Office visit, established patient, low complexity', provider: 'Blue Cross Blue Shield', standardRate: 110, negotiatedRate: 92, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-2', cptCode: '99214', description: 'Office visit, established patient, moderate complexity', provider: 'Blue Cross Blue Shield', standardRate: 165, negotiatedRate: 138, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-3', cptCode: '99213', description: 'Office visit, established patient, low complexity', provider: 'Aetna', standardRate: 110, negotiatedRate: 88, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-4', cptCode: '99214', description: 'Office visit, established patient, moderate complexity', provider: 'Aetna', standardRate: 165, negotiatedRate: 131, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-5', cptCode: '93000', description: 'Electrocardiogram, complete', provider: 'Cigna', standardRate: 95, negotiatedRate: 76, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-6', cptCode: '71045', description: 'X-ray, chest, single view', provider: 'UnitedHealthcare', standardRate: 75, negotiatedRate: 58, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-7', cptCode: '80053', description: 'Comprehensive metabolic panel', provider: 'Medicare', standardRate: 45, negotiatedRate: 31, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-8', cptCode: '85025', description: 'Complete blood count with differential', provider: 'Medicare', standardRate: 32, negotiatedRate: 22, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-9', cptCode: '72148', description: 'MRI lumbar spine without contrast', provider: 'Blue Cross Blue Shield', standardRate: 680, negotiatedRate: 485, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-10', cptCode: '93306', description: 'Echocardiogram, transthoracic, complete', provider: 'Humana', standardRate: 320, negotiatedRate: 243, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-11', cptCode: '99213', description: 'Office visit, established patient, low complexity', provider: 'Medicare', standardRate: 110, negotiatedRate: 92, effectiveDate: '2025-01-01', status: 'Active' as const },
  { id: 'fs-12', cptCode: '45378', description: 'Colonoscopy, diagnostic', provider: 'Anthem', standardRate: 980, negotiatedRate: 742, effectiveDate: '2025-01-01', status: 'Expired' as const },
];

export const auditLogs = [
  { id: 'log-001', timestamp: '2025-08-03T09:24:12', user: 'Sarah Chen', action: 'Update' as const, module: 'Claims', resource: 'CLM-2025-900042', details: 'Updated claim status from Pending to Paid', ipAddress: '192.168.1.24' },
  { id: 'log-002', timestamp: '2025-08-03T08:51:33', user: 'Michael Reyes', action: 'Create' as const, module: 'Claims', resource: 'CLM-2025-900064', details: 'Created new claim for Mary Johnson', ipAddress: '192.168.1.31' },
  { id: 'log-003', timestamp: '2025-08-03T08:12:05', user: 'Sarah Chen', action: 'Login' as const, module: 'Auth', resource: 'Session', details: 'User logged in successfully', ipAddress: '192.168.1.24' },
  { id: 'log-004', timestamp: '2025-08-03T07:45:18', user: 'Michael Reyes', action: 'Login' as const, module: 'Auth', resource: 'Session', details: 'User logged in successfully', ipAddress: '192.168.1.31' },
  { id: 'log-005', timestamp: '2025-08-02T17:33:44', user: 'Emily Park', action: 'Create' as const, module: 'Charges', resource: 'CE-0012', details: 'Created charge entry for Barbara Lopez', ipAddress: '192.168.1.45' },
  { id: 'log-006', timestamp: '2025-08-02T16:32:09', user: 'System', action: 'Update' as const, module: 'Claims', resource: 'CLM-2025-900038', details: 'Claim denied by UnitedHealthcare - missing prior authorization', ipAddress: '10.0.0.1' },
  { id: 'log-007', timestamp: '2025-08-02T14:18:27', user: 'James Wilson', action: 'Create' as const, module: 'Patients', resource: 'PT-0009', details: 'Registered new patient David Rodriguez', ipAddress: '192.168.1.52' },
  { id: 'log-008', timestamp: '2025-08-02T11:05:51', user: 'System', action: 'Update' as const, module: 'Authorizations', resource: 'AUTH-2025-77821', details: 'Authorization approved by Blue Cross Blue Shield', ipAddress: '10.0.0.1' },
  { id: 'log-009', timestamp: '2025-08-02T10:42:13', user: 'James Wilson', action: 'Create' as const, module: 'Payments', resource: 'PAY-2025-500043', details: 'Recorded patient copay payment of $25.00', ipAddress: '192.168.1.52' },
  { id: 'log-010', timestamp: '2025-08-01T15:28:36', user: 'System', action: 'Update' as const, module: 'Claims', resource: 'CLM-2025-900021', details: 'Payment posted from Medicare - $980.00', ipAddress: '10.0.0.1' },
  { id: 'log-011', timestamp: '2025-08-01T13:14:22', user: 'System', action: 'Update' as const, module: 'Claims', resource: 'CLM-2025-900015', details: 'Claim rejected by Cigna - timely filing exceeded', ipAddress: '10.0.0.1' },
  { id: 'log-012', timestamp: '2025-08-01T09:30:08', user: 'Nina Patel', action: 'Delete' as const, module: 'Admin', resource: 'Fee Schedule FS-014', details: 'Removed expired fee schedule entry', ipAddress: '192.168.1.60' },
  { id: 'log-013', timestamp: '2025-07-31T16:45:30', user: 'Rachel Kim', action: 'Export' as const, module: 'Reports', resource: 'Aging Report', details: 'Exported aging report to PDF', ipAddress: '192.168.1.48' },
  { id: 'log-014', timestamp: '2025-07-31T14:22:17', user: 'Sarah Chen', action: 'Update' as const, module: 'Admin', resource: 'Role: Billing Manager', details: 'Updated permissions for Billing Manager role', ipAddress: '192.168.1.24' },
  { id: 'log-015', timestamp: '2025-07-31T11:08:44', user: 'Michael Reyes', action: 'View' as const, module: 'Reports', resource: 'Revenue Report', details: 'Viewed monthly revenue report', ipAddress: '192.168.1.31' },
];
