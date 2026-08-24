import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createPaymentSchema } from '@/lib/validations/payment';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';
import { IdGeneratorService } from '@/lib/server/db/id-generator';
import { PaymentMethod } from '@prisma/client';

function mapPaymentMethod(methodStr: string): PaymentMethod {
  switch (methodStr) {
    case 'Credit Card':
    case 'CreditCard':
      return 'CreditCard';
    case 'EFT':
    case 'ACH':
      return 'ACH';
    case 'Check':
      return 'Check';
    case 'Cash':
      return 'Cash';
    case 'HSA':
      return 'HSA';
    case 'Insurance':
    default:
      return 'Insurance';
  }
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'payments.view');
    const { searchParams } = new URL(req.url);
    const method = searchParams.get('method');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let dbPayments = await prisma.payment.findMany({
      where: { isDeleted: false },
      orderBy: { date: 'desc' },
    });

    if (method && method !== 'all') {
      dbPayments = dbPayments.filter((p) => p.method === method || mapPaymentMethod(p.method) === mapPaymentMethod(method));
    }

    if (search) {
      dbPayments = dbPayments.filter(
        (p) =>
          p.paymentNumber.toLowerCase().includes(search) ||
          p.patientName.toLowerCase().includes(search) ||
          p.appliedTo.toLowerCase().includes(search)
      );
    }

    const formatted = dbPayments.map((p) => ({
      ...p,
      date: p.date.toISOString().split('T')[0],
      amount: Number(p.amount),
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

    const parsed = createPaymentSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid payment payload', parsed.error.flatten().fieldErrors);
    }

    const {
      patientId,
      patientName,
      date,
      type,
      method,
      appliedTo,
      amount,
      status,
      reference,
    } = parsed.data;

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient || patient.isDeleted) {
      throw ApiError.notFound(`Patient with ID '${patientId}' not found`);
    }

    const paymentNumber =
      parsed.data.paymentNumber || (await IdGeneratorService.generatePaymentNumber());

    const prismaMethod = mapPaymentMethod(method);

    const newPayment = await prisma.$transaction(async (tx) => {
      // Create payment record
      const p = await tx.payment.create({
        data: {
          paymentNumber,
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          date: new Date(date),
          type,
          method: prismaMethod,
          appliedTo,
          amount,
          status: status as any,
          reference: reference || '',
        },
      });

      // If status is Paid, update patient balance atomically in PostgreSQL
      if (status === 'Paid') {
        await tx.patient.update({
          where: { id: patient.id },
          data: {
            balance: { decrement: amount },
          },
        });

        // Allocate payment to invoice if appliedTo specifies an invoice number
        if (appliedTo && (appliedTo.startsWith('INV-') || appliedTo.startsWith('INV'))) {
          const inv = await tx.invoice.findFirst({ where: { invoiceNumber: appliedTo } });
          if (inv) {
            const newPaid = Number(inv.paidAmount) + amount;
            const newBal = Number(inv.amount) - newPaid;
            const newStatus = newBal <= 0 ? 'Paid' : 'Partial';

            await tx.invoice.update({
              where: { id: inv.id },
              data: {
                paidAmount: newPaid,
                balance: newBal < 0 ? 0 : newBal,
                status: newStatus as any,
              },
            });
          }
        }

        // Allocate payment to claim if appliedTo specifies a claim number
        if (appliedTo && (appliedTo.startsWith('CLM-') || appliedTo.startsWith('CLM'))) {
          const clm = await tx.claim.findFirst({ where: { claimNumber: appliedTo } });
          if (clm) {
            const newPaid = Number(clm.paidAmount) + amount;
            await tx.claim.update({
              where: { id: clm.id },
              data: {
                paidAmount: newPaid,
                status: 'Paid',
              },
            });
          }
        }
      }

      return p;
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Payments',
      resource: `Payment: ${newPayment.paymentNumber}`,
      details: `Recorded ${type} payment ${newPayment.paymentNumber} of $${amount.toFixed(2)} for ${patient.firstName} ${patient.lastName} (${method})`,
    });

    return apiResponse(newPayment, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
