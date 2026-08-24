export type ClaimStatus =
  | 'Submitted'
  | 'Pending'
  | 'Paid'
  | 'Denied'
  | 'Rejected';

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Partial';

export type PatientStatus = 'Active' | 'Inactive' | 'New';

export type Gender = 'Male' | 'Female' | 'Other';

export type ClaimPriority = 'Routine' | 'Urgent' | 'Emergency';

export type NotificationType =
  | 'payment_due'
  | 'claim_approved'
  | 'claim_rejected'
  | 'invoice_generated'
  | 'eligibility_verified'
  | 'authorization_required'
  | 'denial_received';

export type PaymentMethod =
  | 'Insurance'
  | 'Cash'
  | 'Credit Card'
  | 'Check'
  | 'ACH'
  | 'HSA';

export type AdjustmentType =
  | 'Contractual Adjustment'
  | 'Write-off'
  | 'Refund'
  | 'Administrative'
  | 'Coding Correction';

export type UserRole = 'Administrator' | 'Billing Manager' | 'Coder' | 'Front Desk' | 'Provider';

export type AuditAction = 'Create' | 'Update' | 'Delete' | 'Login' | 'Logout' | 'View' | 'Export';

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: PatientStatus;
  balance: number;
  lastVisit: string;
  registeredOn: string;
  insurance: PatientInsurance[];
  avatarColor: string;
  documents: PatientDocument[];
}

export interface PatientInsurance {
  id: string;
  provider: string;
  providerId: string;
  memberId: string;
  groupNumber: string;
  planName: string;
  priority: 'Primary' | 'Secondary' | 'Tertiary';
  status: 'Active' | 'Inactive' | 'Expired';
  effectiveDate: string;
  expiryDate: string;
  copay: number;
  deductible: number;
  deductibleMet: number;
  coveragePercent: number;
}

export interface PatientDocument {
  id: string;
  name: string;
  type: 'Insurance Card' | 'ID' | 'Referral' | 'Medical Record' | 'Consent Form' | 'Other';
  uploadedOn: string;
  size: string;
  fileUrl?: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  payerId: string;
  type: 'PPO' | 'HMO' | 'EPO' | 'POS' | 'Medicare' | 'Medicaid' | 'Workers Comp';
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: 'Active' | 'Inactive';
  claimsSubmitted: number;
  claimsPaid: number;
  avgProcessingDays: number;
  totalRevenue: number;
  logoColor: string;
}

export interface EligibilityVerification {
  id: string;
  patientName: string;
  patientId: string;
  provider: string;
  memberId: string;
  status: 'Verified' | 'Pending' | 'Failed' | 'Not Found';
  verificationDate: string;
  copay: number;
  deductibleRemaining: number;
  coveragePercent: number;
  planName: string;
}

export interface Authorization {
  id: string;
  authorizationNumber: string;
  patientName: string;
  patientId: string;
  provider: string;
  procedure: string;
  status: 'Approved' | 'Pending' | 'Denied' | 'Expired';
  requestedDate: string;
  approvedDate: string | null;
  validFrom: string;
  validTo: string;
  visitsApproved: number;
  visitsUsed: number;
}

export interface ProcedureCode {
  id: string;
  cptCode: string;
  description: string;
  category: 'Evaluation' | 'Surgery' | 'Radiology' | 'Pathology' | 'Medicine' | 'Anesthesia';
  standardCharge: number;
  medicareRate: number;
  rvu: number;
  status: 'Active' | 'Inactive';
}

export interface DiagnosisCode {
  id: string;
  icd10Code: string;
  description: string;
  category: string;
  status: 'Active' | 'Inactive';
}

export interface ChargeEntry {
  id: string;
  patientName: string;
  patientId: string;
  cptCode: string;
  cptDescription: string;
  icd10Code: string;
  icd10Description: string;
  quantity: number;
  unitCharge: number;
  totalCharge: number;
  provider: string;
  serviceDate: string;
  status: 'Draft' | 'Billed' | 'Submitted';
}

export interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  patientId: string;
  provider: string;
  insuranceProvider: string;
  serviceDate: string;
  submissionDate: string;
  billedAmount: number;
  paidAmount: number;
  patientResponsibility: number;
  status: ClaimStatus;
  priority: ClaimPriority;
  cptCodes: string[];
  icd10Codes: string[];
  deniedReason: string | null;
  ageDays: number;
  timeline: ClaimTimelineEvent[];
}

export interface ClaimTimelineEvent {
  id: string;
  date: string;
  event: string;
  description: string;
  actor: string;
  type: 'submission' | 'status' | 'payment' | 'note' | 'denial';
}

export interface Payment {
  id: string;
  paymentNumber: string;
  patientName: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  appliedTo: string;
  reference: string;
  type: 'Patient Payment' | 'Insurance Payment' | 'Adjustment' | 'Refund';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial' | 'Draft';
  items: InvoiceLineItem[];
  notes: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  cptCode: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Adjustment {
  id: string;
  adjustmentNumber: string;
  patientName: string;
  claimNumber: string;
  amount: number;
  type: AdjustmentType;
  reason: string;
  date: string;
  postedBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string;
  createdOn: string;
  avatarColor: string;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  system: boolean;
}

export interface FeeSchedule {
  id: string;
  cptCode: string;
  description: string;
  provider: string;
  standardRate: number;
  negotiatedRate: number;
  effectiveDate: string;
  status: 'Active' | 'Expired';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  module: string;
  resource: string;
  details: string;
  ipAddress: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  amount: number;
  change: number;
  trend: 'up' | 'down' | 'flat';
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
}

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  claims: number;
  paid: number;
}

export interface ClaimStatusBreakdown {
  name: ClaimStatus;
  value: number;
  color: string;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  target: number;
}

export interface OutstandingBucket {
  bucket: string;
  amount: number;
  claims: number;
}

export interface ActivityItem {
  id: string;
  type: 'claim' | 'payment' | 'patient' | 'denial' | 'authorization';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  actor: string;
  status?: ClaimStatus | PaymentStatus;
}

export interface AgingRow {
  bucket: string;
  claims: number;
  amount: number;
  percent: number;
}

export interface ProviderReportRow {
  provider: string;
  patients: number;
  claims: number;
  submitted: number;
  paid: number;
  denied: number;
  revenue: number;
  collectionRate: number;
}

export interface InsuranceReportRow {
  provider: string;
  claims: number;
  paid: number;
  denied: number;
  revenue: number;
  avgDays: number;
  denialRate: number;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
