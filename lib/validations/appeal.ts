import { z } from 'zod';

export const createAppealSchema = z.object({
  appealReason: z.string().min(5, 'Appeal reason is required'),
  supportingNotes: z.string().optional().default(''),
  priority: z.enum(['Routine', 'Urgent']).default('Routine'),
});

export type CreateAppealInput = z.infer<typeof createAppealSchema>;
