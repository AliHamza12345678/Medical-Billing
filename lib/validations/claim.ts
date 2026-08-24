import { z } from 'zod';

export const claimLineSchema = z.object({
  cptCode: z.string().min(1, 'CPT code is required'),
  cptDescription: z.string().optional().default(''),
  icd10Code: z.string().min(1, 'ICD-10 code is required'),
  icd10Codes: z.array(z.string()).optional().default([]),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1').default(1),
  unitCharge: z.coerce.number().min(0, 'Unit charge cannot be negative'),
});

export const createClaimSchema = z.object({
  patientId: z.string().min(1, 'Select a patient'),
  patientName: z.string().optional(),
  provider: z.string().optional().default('Dr. Sarah Johnson'),
  insuranceProvider: z.string().min(1, 'Select insurance provider'),
  serviceDate: z.string().min(1, 'Service date is required'),
  priority: z.enum(['Routine', 'Urgent', 'Emergency']).default('Routine'),
  status: z.enum(['Submitted', 'Pending', 'Paid', 'Denied', 'Rejected']).default('Submitted'),
  lines: z.array(claimLineSchema).min(1, 'Add at least one charge line'),
});

export const updateClaimSchema = z.object({
  status: z.enum(['Submitted', 'Pending', 'Paid', 'Denied', 'Rejected']).optional(),
  paidAmount: z.number().nonnegative().optional(),
  patientResponsibility: z.number().nonnegative().optional(),
  deniedReason: z.string().optional(),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
