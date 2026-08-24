import { z } from 'zod';

export const notificationTypeEnum = z.enum([
  'payment_due',
  'claim_approved',
  'claim_rejected',
  'invoice_generated',
  'eligibility_verified',
  'authorization_required',
  'denial_received',
]);

export const createNotificationSchema = z.object({
  type: notificationTypeEnum,
  title: z.string().min(2, 'Title is required'),
  message: z.string().min(2, 'Message is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  actionUrl: z.string().optional(),
  recipientId: z.string().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
