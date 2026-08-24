import { z } from 'zod';

export const createEligibilitySchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(2, 'Patient name is required'),
  provider: z.string().min(2, 'Insurance provider is required'),
  memberId: z.string().min(2, 'Member ID is required'),
  planName: z.string().min(2, 'Plan name is required'),
  copay: z.number().nonnegative().optional().default(25.0),
  deductibleRemaining: z.number().nonnegative().optional().default(500.0),
  coveragePercent: z.number().min(0).max(100).optional().default(80.0),
  status: z.enum(['Verified', 'Pending', 'Failed', 'Not Found']).optional().default('Verified'),
});

export type CreateEligibilityInput = z.infer<typeof createEligibilitySchema>;
