import { z } from 'zod';

export const createProcedureCodeSchema = z.object({
  cptCode: z.string().min(4, 'CPT code is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  standardCharge: z.number().positive('Standard charge must be positive'),
  medicareRate: z.number().positive('Medicare rate must be positive'),
  rvu: z.number().nonnegative('RVU must be non-negative'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const createDiagnosisCodeSchema = z.object({
  icd10Code: z.string().min(3, 'ICD-10 code is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export type CreateProcedureCodeInput = z.infer<typeof createProcedureCodeSchema>;
export type CreateDiagnosisCodeInput = z.infer<typeof createDiagnosisCodeSchema>;
