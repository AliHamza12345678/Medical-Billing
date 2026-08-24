import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { updateInvoiceSchema } from '@/lib/validations/invoice';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'payments.view');
    const dbInvoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { items: true, allocations: true },
    });

    if (!dbInvoice || dbInvoice.isDeleted) {
      throw ApiError.notFound(`Invoice '${params.id}' not found`);
    }

    return apiResponse({
      ...dbInvoice,
      issueDate: dbInvoice.issueDate.toISOString().split('T')[0],
      dueDate: dbInvoice.dueDate.toISOString().split('T')[0],
      amount: Number(dbInvoice.amount),
      paidAmount: Number(dbInvoice.paidAmount),
      balance: Number(dbInvoice.balance),
      items: dbInvoice.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'payments.edit');
    const invoice = await prisma.invoice.findUnique({ where: { id: params.id } });
    if (!invoice || invoice.isDeleted) {
      throw ApiError.notFound(`Invoice '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = updateInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid invoice update payload', parsed.error.flatten().fieldErrors);
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
        ...(parsed.data.dueDate ? { dueDate: new Date(parsed.data.dueDate) } : {}),
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Payments',
      resource: `Invoice: ${invoice.invoiceNumber}`,
      details: `Updated invoice ${invoice.invoiceNumber} status to ${updatedInvoice.status}`,
    });

    return apiResponse(updatedInvoice);
  } catch (error) {
    return handleApiError(error);
  }
}
