import { z } from 'zod';

export const createChargeSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(2, 'Patient name is required'),
  cptCode: z.string().min(4, 'CPT code is required'),
  cptDescription: z.string().min(2, 'CPT description is required'),
  icd10Code: z.string().min(3, 'ICD-10 code is required'),
  icd10Description: z.string().min(2, 'ICD-10 description is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0').default(1),
  unitCharge: z.number().nonnegative('Unit charge cannot be negative'),
  provider: z.string().min(2, 'Provider is required'),
  serviceDate: z.string().or(z.date()),
  status: z.enum(['Draft', 'Finalized', 'Voided', 'Billed']).default('Draft'),
});

export const updateChargeSchema = createChargeSchema.partial();

export type CreateChargeInput = z.infer<typeof createChargeSchema>;
export type UpdateChargeInput = z.infer<typeof updateChargeSchema>;
