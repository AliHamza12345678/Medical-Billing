import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createRefundSchema } from '@/lib/validations/refund';
import { ApiError } from '@/lib/server/errors/api-error';
import { FinancialLedgerService } from '@/lib/server/ledger/financial-ledger';
import { AuditLogger } from '@/lib/server/audit/audit-logger';
import { IdGeneratorService } from '@/lib/server/db/id-generator';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'payments.view');
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    let dbRefunds = await prisma.refund.findMany({
      include: { patient: true, payment: true },
      orderBy: { date: 'desc' },
    });

    if (search) {
      dbRefunds = dbRefunds.filter(
        (r) =>
          r.refundNumber.toLowerCase().includes(search) ||
          r.patient.firstName.toLowerCase().includes(search) ||
          r.patient.lastName.toLowerCase().includes(search) ||
          r.reason.toLowerCase().includes(search)
      );
    }

    const formatted = dbRefunds.map((r) => ({
      id: r.id,
      refundNumber: r.refundNumber,
      patientId: r.patientId,
      patientName: `${r.patient.firstName} ${r.patient.lastName}`,
      amount: Number(r.amount),
      reason: r.reason,
      status: r.status,
      method: r.payment?.method || 'EFT',
      date: r.date.toISOString().split('T')[0],
      processedBy: r.processedBy,
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

    const parsed = createRefundSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid refund payload', parsed.error.flatten().fieldErrors);
    }

    const { patientId, paymentId, amount, reason, status } = parsed.data;

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient || patient.isDeleted) {
      throw ApiError.notFound(`Patient '${patientId}' not found`);
    }

    if (paymentId) {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { refunds: true },
      });

      if (!payment || payment.isDeleted) {
        throw ApiError.notFound(`Payment '${paymentId}' not found`);
      }

      const totalRefunded = payment.refunds.reduce((sum, r) => sum + Number(r.amount), 0);
      const refundableBalance = Number(payment.amount) - totalRefunded;

      if (amount > refundableBalance) {
        throw ApiError.badRequest(
          `Refund amount ($${amount.toFixed(2)}) exceeds refundable payment balance ($${refundableBalance.toFixed(2)})`
        );
      }
    }

    const newRefund = await prisma.$transaction(async (tx) => {
      const refundNumber =
        parsed.data.refundNumber || (await IdGeneratorService.generateRefundNumber(tx));

      const rfd = await tx.refund.create({
        data: {
          refundNumber,
          patientId,
          paymentId: paymentId || null,
          amount,
          reason,
          status,
          processedBy: session.name,
        },
      });

      // Post compensating Financial Ledger entry
      await FinancialLedgerService.postEntry({
        patientId,
        transactionType: 'REFUND',
        referenceId: refundNumber,
        debit: amount,
        credit: 0,
        description: `Refund ${refundNumber}: ${reason}`,
        tx,
      });

      // Update payment status to Refunded if paymentId provided
      if (paymentId) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: 'Refunded' },
        });
      }

      return rfd;
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Payments',
      resource: `Refund: ${newRefund.refundNumber}`,
      details: `Processed refund ${newRefund.refundNumber} of $${amount.toFixed(2)} for ${patient.firstName} ${patient.lastName} (${reason})`,
    });

    return apiResponse(newRefund, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
