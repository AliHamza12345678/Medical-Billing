import { z } from 'zod';

export const createFeeScheduleSchema = z.object({
  cptCode: z.string().min(4, 'CPT code is required'),
  description: z.string().min(5, 'Description is required'),
  provider: z.string().min(2, 'Provider is required'),
  standardRate: z.number().positive('Standard rate must be positive'),
  negotiatedRate: z.number().positive('Negotiated rate must be positive'),
  effectiveDate: z.string().or(z.date()),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const updateFeeScheduleSchema = createFeeScheduleSchema.partial();

export type CreateFeeScheduleInput = z.infer<typeof createFeeScheduleSchema>;
export type UpdateFeeScheduleInput = z.infer<typeof updateFeeScheduleSchema>;
