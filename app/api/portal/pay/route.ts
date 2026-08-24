import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requireAuth } from '@/lib/server/auth/auth-guard';
import { AuthorizationEngine } from '@/lib/server/auth/authorization-engine';
import { portalPaymentSchema } from '@/lib/validations/portal';
import { ApiError } from '@/lib/server/errors/api-error';
import { FinancialLedgerService } from '@/lib/server/ledger/financial-ledger';
import { SocketService } from '@/lib/server/websocket/socket-manager';
import { AuditLogger } from '@/lib/server/audit/audit-logger';
import { IdGeneratorService } from '@/lib/server/db/id-generator';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    const parsed = portalPaymentSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid portal payment payload', parsed.error.flatten().fieldErrors);
    }

    const { patientId: requestedPatientId, amount, cardName, cardNumber, invoiceId, idempotencyKey } = parsed.data;

    // 1. Unambiguously resolve and authorize patient identity (NO FALLBACKS)
    const patient = await AuthorizationEngine.resolveAndAssertPatientAccess(session, requestedPatientId);
    const patientId = patient.id;
    const patientName = `${patient.firstName} ${patient.lastName}`;

    // 2. Validate target invoice ownership if invoiceId is provided
    let targetInvoice: { id: string; invoiceNumber: string; amount: any; paidAmount: any; balance: any; patientId: string } | null = null;
    if (invoiceId) {
      targetInvoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { id: true, invoiceNumber: true, amount: true, paidAmount: true, balance: true, patientId: true, isDeleted: true },
      });

      if (!targetInvoice || (targetInvoice as any).isDeleted) {
        throw ApiError.notFound(`Target invoice '${invoiceId}' not found`);
      }

      // Reject cross-patient invoice payment manipulation
      if (targetInvoice.patientId !== patientId) {
        throw ApiError.forbidden('The requested invoice does not belong to your patient account');
      }
    }

    // Mask card number for security (NEVER store raw credentials/CVV)
    const maskedCard = `****-****-****-${cardNumber.slice(-4)}`;
    const reference = `PORTAL-${maskedCard}`;

    // 3. Replay & Duplicate Payment Prevention
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const duplicatePayment = await prisma.payment.findFirst({
      where: {
        patientId,
        amount,
        reference,
        createdAt: { gte: oneMinuteAgo },
        isDeleted: false,
      },
    });

    if (duplicatePayment) {
      throw ApiError.conflict('Duplicate payment detected. This transaction has already been processed.');
    }

    // 4. Atomic Transaction Execution
    const newPayment = await prisma.$transaction(async (tx) => {
      const paymentNumber = await IdGeneratorService.generatePaymentNumber(tx);

      const pmt = await tx.payment.create({
        data: {
          paymentNumber,
          patientId,
          patientName,
          amount,
          method: 'CreditCard',
          status: 'Paid',
          date: new Date(),
          appliedTo: targetInvoice ? `Invoice: ${targetInvoice.invoiceNumber}` : 'Patient Account',
          reference,
          type: 'Patient',
        },
      });

      // Post Financial Ledger Entry (updates patient balance atomically inside tx)
      await FinancialLedgerService.postEntry({
        patientId,
        transactionType: 'PAYMENT',
        referenceId: paymentNumber,
        debit: 0,
        credit: amount,
        description: `Portal Credit Card Payment (${reference})`,
        tx,
      });

      // Update target invoice balance if invoiceId provided
      if (targetInvoice) {
        const newPaid = Number(targetInvoice.paidAmount) + amount;
        const newBal = Number(targetInvoice.amount) - newPaid;
        const status = newBal <= 0 ? 'Paid' : 'Partial';

        await tx.invoice.update({
          where: { id: targetInvoice.id },
          data: {
            paidAmount: newPaid,
            balance: newBal < 0 ? 0 : newBal,
            status,
          },
        });

        await tx.paymentAllocation.create({
          data: {
            paymentId: pmt.id,
            invoiceId: targetInvoice.id,
            amount,
          },
        });
      }

      // Write immutable audit log record inside the same atomic database transaction
      await AuditLogger.logTx(tx, {
        userId: session.id,
        userName: session.name,
        action: 'Create',
        module: 'PortalPayments',
        resource: `Payment: ${paymentNumber}`,
        details: `Processed portal card payment ${paymentNumber} of $${amount.toFixed(2)} for ${patientName}`,
      });

      return pmt;
    });

    // Emit real-time WebSocket event
    SocketService.emitEvent('payment.received', {
      paymentNumber: newPayment.paymentNumber,
      amount,
      patientName,
    });

    return apiResponse({
      id: newPayment.id,
      paymentNumber: newPayment.paymentNumber,
      amount: Number(newPayment.amount),
      status: newPayment.status,
      reference: newPayment.reference,
    }, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
