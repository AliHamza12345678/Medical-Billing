import { z } from 'zod';

export const createAdjustmentSchema = z.object({
  adjustmentNumber: z.string().optional(),
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(2, 'Patient name is required'),
  claimId: z.string().min(1, 'Claim ID is required'),
  claimNumber: z.string().min(1, 'Claim number is required'),
  type: z.enum([
    'Contractual Adjustment',
    'Write-off',
    'Refund',
    'Administrative',
    'Coding Correction',
  ]),
  reason: z.string().min(3, 'Adjustment reason is required'),
  amount: z.number().positive('Adjustment amount must be greater than $0.00'),
  date: z.string().or(z.date()).optional().default(() => new Date().toISOString().split('T')[0]),
  postedBy: z.string().optional(),
});

export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>;
