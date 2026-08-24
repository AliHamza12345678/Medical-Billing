import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().min(5, 'Description is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

export const updateRoleSchema = z.object({
  description: z.string().min(5, 'Description is required').optional(),
  permissions: z.array(z.string()).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
