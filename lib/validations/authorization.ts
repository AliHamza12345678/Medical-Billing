import { z } from 'zod';

export const createAuthorizationSchema = z
  .object({
    authorizationNumber: z.string().min(3, 'Authorization number is required'),
    patientId: z.string().min(1, 'Patient ID is required'),
    patientName: z.string().min(2, 'Patient name is required'),
    provider: z.string().min(2, 'Insurance provider is required'),
    procedure: z.string().min(2, 'Procedure is required'),
    status: z.enum(['Approved', 'Pending', 'Denied', 'Expired', 'Draft', 'Requested']).default('Approved'),
    requestedDate: z.string().or(z.date()).optional().default(() => new Date().toISOString().split('T')[0]),
    approvedDate: z.string().or(z.date()).optional(),
    validFrom: z.string().or(z.date()),
    validTo: z.string().or(z.date()),
    visitsApproved: z.number().int().positive('Visits approved must be greater than 0'),
    visitsUsed: z.number().int().nonnegative().default(0),
  })
  .refine(
    (data) => {
      const from = new Date(data.validFrom);
      const to = new Date(data.validTo);
      return to >= from;
    },
    {
      message: 'Valid To date must be on or after Valid From date',
      path: ['validTo'],
    }
  );

export const updateAuthorizationSchema = z.object({
  status: z.enum(['Approved', 'Pending', 'Denied', 'Expired', 'Draft', 'Requested']).optional(),
  visitsUsed: z.number().int().nonnegative().optional(),
  validTo: z.string().or(z.date()).optional(),
});

export type CreateAuthorizationInput = z.infer<typeof createAuthorizationSchema>;
export type UpdateAuthorizationInput = z.infer<typeof updateAuthorizationSchema>;
