import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ApiError } from '@/lib/server/errors/api-error';

import { updatePaymentSchema } from '@/lib/validations/payment';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'payments.view');
    const pmt = await prisma.payment.findUnique({ where: { id: params.id } });
    if (!pmt || pmt.isDeleted) {
      throw ApiError.notFound(`Payment record '${params.id}' not found`);
    }

    return apiResponse({
      ...pmt,
      date: pmt.date.toISOString().split('T')[0],
      amount: Number(pmt.amount),
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
    const payment = await prisma.payment.findUnique({ where: { id: params.id } });
    if (!payment || payment.isDeleted) {
      throw ApiError.notFound(`Payment '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = updatePaymentSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid payment update payload', parsed.error.flatten().fieldErrors);
    }

    const { status, reference, method } = parsed.data;

    const updatedPayment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: params.id },
        data: {
          ...(status ? { status: status as any } : {}),
          ...(reference !== undefined ? { reference } : {}),
          ...(method ? { method: method as any } : {}),
        },
      });

      // If status changed to Refunded or Failed, reverse patient balance decrement
      if (status && (status === 'Refunded' || status === 'Failed') && payment.status === 'Paid') {
        await tx.patient.update({
          where: { id: payment.patientId },
          data: { balance: { increment: Number(payment.amount) } },
        });
      }

      return updated;
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Payments',
      resource: `Payment: ${payment.paymentNumber}`,
      details: `Updated payment ${payment.paymentNumber} status to ${updatedPayment.status}`,
    });

    return apiResponse(updatedPayment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'payments.edit');
    const payment = await prisma.payment.findUnique({ where: { id: params.id } });
    if (!payment || payment.isDeleted) {
      throw ApiError.notFound(`Payment '${params.id}' not found`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: params.id },
        data: { isDeleted: true, status: 'Refunded', deletedAt: new Date() },
      });

      if (payment.status === 'Paid') {
        await tx.patient.update({
          where: { id: payment.patientId },
          data: { balance: { increment: Number(payment.amount) } },
        });
      }
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Delete',
      module: 'Payments',
      resource: `Payment: ${payment.paymentNumber}`,
      details: `Voided/deleted payment ${payment.paymentNumber}`,
    });

    return apiResponse({ message: `Payment '${payment.paymentNumber}' voided successfully` });
  } catch (error) {
    return handleApiError(error);
  }
}
