import { z } from 'zod';

export const recordDenialSchema = z.object({
  denialCode: z.string().min(1, 'Denial code is required'),
  deniedReason: z.string().min(2, 'Denial reason description is required'),
  denialType: z.enum(['Technical Rejection', 'Payer Rejection', 'Clinical Denial']).default('Payer Rejection'),
  source: z.string().optional().default('Clearinghouse 277 / EDI 835'),
});

export type RecordDenialInput = z.infer<typeof recordDenialSchema>;
