import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createInvoiceSchema } from '@/lib/validations/invoice';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';
import { IdGeneratorService } from '@/lib/server/db/id-generator';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'payments.view');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let dbInvoices = await prisma.invoice.findMany({
      where: { isDeleted: false },
      include: { items: true, allocations: true },
      orderBy: { issueDate: 'desc' },
    });

    if (status && status !== 'all') {
      dbInvoices = dbInvoices.filter((i) => i.status === status);
    }

    if (search) {
      dbInvoices = dbInvoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(search) ||
          i.patientName.toLowerCase().includes(search)
      );
    }

    const formatted = dbInvoices.map((inv) => ({
      ...inv,
      issueDate: inv.issueDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0],
      amount: Number(inv.amount),
      paidAmount: Number(inv.paidAmount),
      balance: Number(inv.balance),
      items: inv.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
    }));

    return apiResponse(formatted, {
      total: formatted.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'payments.edit');
    const body = await req.json();

    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid invoice payload', parsed.error.flatten().fieldErrors);
    }

    const { patientId, patientName, dueDate, status, notes, items } = parsed.data;

    // Verify patient exists in database
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient || patient.isDeleted) {
      throw ApiError.notFound(`Patient '${patientId}' not found`);
    }

    // Server-side calculation of invoice subtotal and balance (never trust client)
    const amount = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0
    );

    const newInvoice = await prisma.$transaction(async (tx) => {
      const invoiceNumber =
        parsed.data.invoiceNumber || (await IdGeneratorService.generateInvoiceNumber(tx));

      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          patientId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          issueDate: new Date(),
          dueDate: new Date(dueDate),
          amount,
          paidAmount: 0,
          balance: amount,
          status,
          notes,
        },
      });

      await tx.invoiceLineItem.createMany({
        data: items.map((item) => ({
          invoiceId: inv.id,
          cptCode: item.cptCode || 'MISC',
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      });

      // Increment patient balance in PostgreSQL
      await tx.patient.update({
        where: { id: patient.id },
        data: { balance: { increment: amount } },
      });

      return inv;
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Payments',
      resource: `Invoice: ${newInvoice.invoiceNumber}`,
      details: `Generated invoice ${newInvoice.invoiceNumber} of $${amount.toFixed(2)} for ${patientName}`,
    });

    return apiResponse(newInvoice, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
