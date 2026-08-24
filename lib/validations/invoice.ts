import { z } from 'zod';

export const invoiceLineItemSchema = z.object({
  cptCode: z.string().optional().default(''),
  description: z.string().min(2, 'Description is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0').default(1),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
});

export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(2, 'Patient name is required'),
  dueDate: z.string().or(z.date()),
  status: z.enum(['Draft', 'Pending', 'Partial', 'Paid', 'Overdue', 'Void']).default('Pending'),
  notes: z.string().optional().default('Payment is due within 30 days of issue date.'),
  items: z.array(invoiceLineItemSchema).min(1, 'Invoice must contain at least one line item'),
});

export const updateInvoiceSchema = z.object({
  status: z.enum(['Draft', 'Pending', 'Partial', 'Paid', 'Overdue', 'Void']).optional(),
  notes: z.string().optional(),
  dueDate: z.string().or(z.date()).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
