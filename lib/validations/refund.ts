import { z } from 'zod';

export const createRefundSchema = z.object({
  refundNumber: z.string().optional(),
  patientId: z.string().min(1, 'Patient ID is required'),
  paymentId: z.string().optional(),
  amount: z.number().positive('Refund amount must be greater than $0.00'),
  reason: z.string().min(3, 'Refund reason is required'),
  status: z.enum(['Processed', 'Pending', 'Failed', 'Cancelled']).default('Processed'),
  processedBy: z.string().optional(),
});

export type CreateRefundInput = z.infer<typeof createRefundSchema>;
