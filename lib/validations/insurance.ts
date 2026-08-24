import { z } from 'zod';

export const createInsuranceProviderSchema = z.object({
  name: z.string().min(2, 'Provider name is required'),
  payerId: z.string().min(3, 'Payer ID is required'),
  type: z.string().min(2, 'Payer type is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const updateInsuranceProviderSchema = createInsuranceProviderSchema.partial();

export type CreateInsuranceProviderInput = z.infer<typeof createInsuranceProviderSchema>;
export type UpdateInsuranceProviderInput = z.infer<typeof updateInsuranceProviderSchema>;
