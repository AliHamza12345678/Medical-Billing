import { z } from 'zod';

export const portalPaymentSchema = z.object({
  patientId: z.string().optional(),
  invoiceId: z.string().optional(),
  cardName: z.string().min(2, 'Name on card is required'),
  cardNumber: z.string().min(14, 'Valid card number is required'),
  expiry: z.string().min(4, 'Expiry format MM/YY is required'),
  cvv: z.string().min(3, '3 or 4 digit CVV is required'),
  amount: z.number().positive('Payment amount must be greater than $0.00'),
  idempotencyKey: z.string().optional(),
});

export type PortalPaymentInput = z.infer<typeof portalPaymentSchema>;
