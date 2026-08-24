import { prisma } from '@/lib/db';
import { FinancialLedgerService } from './financial-ledger';
import { ApiError } from '../errors/api-error';
import { AuditLogger } from '../audit/audit-logger';

export class FinancialIntegrityEngine {
  static async reversePayment(
    paymentId: string,
    reason: string,
    userId: string,
    userName: string
  ) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.isDeleted) {
      throw ApiError.notFound(`Payment '${paymentId}' not found for reversal`);
    }

    if (payment.status === 'Refunded') {
      throw ApiError.businessRuleViolation(`Payment '${payment.paymentNumber}' has already been reversed/refunded`);
    }

    const reversalNumber = `REV-${payment.paymentNumber}`;
    const amount = Number(payment.amount);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Post compensating ledger entry (Debit patient account)
      const ledgerEntry = await FinancialLedgerService.postEntry({
        patientId: payment.patientId,
        transactionType: 'REVERSAL',
        referenceId: reversalNumber,
        debit: amount,
        credit: 0,
        description: `Reversal of Payment ${payment.paymentNumber}: ${reason}`,
        tx,
      });

      // 2. Update payment status to Refunded (preserve historical row)
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'Refunded' },
      });

      // 3. Persist audit log atomically inside the same database transaction
      await AuditLogger.logTx(tx, {
        userId,
        userName,
        action: 'Update',
        module: 'FinancialLedger',
        resource: `PaymentReversal: ${payment.paymentNumber}`,
        details: `Reversed payment ${payment.paymentNumber} of $${amount.toFixed(2)} (${reason})`,
      });

      return { updatedPayment, ledgerEntry };
    });

    return result;
  }
}
