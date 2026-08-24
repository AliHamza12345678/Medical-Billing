import { z } from 'zod';

export const updateSettingSchema = z.object({
  key: z.string().min(1, 'Setting key is required'),
  value: z.string().min(1, 'Setting value is required'),
  category: z.enum(['general', 'billing', 'claims', 'notifications']).default('general'),
  description: z.string().optional(),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
