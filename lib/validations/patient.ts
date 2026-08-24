import { z } from 'zod';

export const genderSchema = z.enum(['Male', 'Female', 'Other']);
export const patientStatusSchema = z.enum(['Active', 'Inactive', 'New']);

export const createPatientSchema = z.object({
  mrn: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  gender: genderSchema,
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State code must be 2 letters'),
  zip: z.string().min(5, 'ZIP code required'),
  status: patientStatusSchema.optional().default('Active'),
  insurance: z.array(z.any()).optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
