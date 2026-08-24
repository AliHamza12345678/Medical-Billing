import { z } from 'zod';

export const userRoleSchema = z.enum([
  'Administrator',
  'Billing Manager',
  'Coder',
  'Front Desk',
  'Provider',
]);

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: userRoleSchema,
  status: z.enum(['Active', 'Inactive', 'Suspended']).default('Active'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: userRoleSchema.optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
  password: z.string().min(8).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
