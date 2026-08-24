import { z } from 'zod';

export const createPaymentSchema = z.object({
  paymentNumber: z.string().optional(),
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(2, 'Patient name is required'),
  date: z.string().or(z.date()),
  type: z.enum(['Insurance', 'Patient']).default('Insurance'),
  method: z.enum(['Credit Card', 'CreditCard', 'EFT', 'ACH', 'Check', 'Cash', 'Insurance', 'HSA']).default('EFT'),
  appliedTo: z.string().min(1, 'Applied claim or invoice reference is required'),
  amount: z.number().positive('Payment amount must be greater than $0.00'),
  status: z.enum(['Paid', 'Pending', 'Refunded', 'Failed', 'Partial']).default('Paid'),
  reference: z.string().optional().default(''),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const updatePaymentSchema = createPaymentSchema.partial();
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
