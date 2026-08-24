import { z } from 'zod';

export const createPatientInsuranceSchema = z.object({
  providerName: z.string().min(2, 'Insurance provider name is required'),
  providerId: z.string().optional(),
  memberId: z.string().min(3, 'Member ID is required'),
  groupNumber: z.string().min(2, 'Group number is required'),
  planName: z.string().min(2, 'Plan name is required'),
  priority: z.enum(['Primary', 'Secondary', 'Tertiary']).default('Primary'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  effectiveDate: z.string().or(z.date()),
  expiryDate: z.string().or(z.date()).optional(),
  copay: z.number().nonnegative().default(0),
  deductible: z.number().nonnegative().default(0),
  deductibleMet: z.number().nonnegative().default(0),
  coveragePercent: z.number().min(0).max(100).default(80),
});

export const updatePatientInsuranceSchema = createPatientInsuranceSchema.partial();

export type CreatePatientInsuranceInput = z.infer<typeof createPatientInsuranceSchema>;
export type UpdatePatientInsuranceInput = z.infer<typeof updatePatientInsuranceSchema>;
