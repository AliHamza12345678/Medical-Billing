import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface LedgerEntryParams {
  patientId: string;
  transactionType: 'CHARGE' | 'PAYMENT' | 'ADJUSTMENT' | 'REFUND' | 'REVERSAL';
  referenceId: string;
  debit: number | Prisma.Decimal;
  credit: number | Prisma.Decimal;
  description: string;
  tx?: Prisma.TransactionClient;
}

export class FinancialLedgerService {
  /**
   * Posts a financial ledger entry atomically with concurrency-safe PostgreSQL row-level locking.
   * Serializes ledger operations per patient using SELECT ... FOR UPDATE.
   */
  static async postEntry(params: LedgerEntryParams) {
    const executePost = async (tx: Prisma.TransactionClient) => {
      // 1. Idempotency Check: prevent duplicate ledger entries for the same reference & transaction type
      const existingEntry = await tx.financialLedger.findFirst({
        where: {
          patientId: params.patientId,
          referenceId: params.referenceId,
          transactionType: params.transactionType,
        },
      });

      if (existingEntry) {
        return existingEntry;
      }

      // 2. PostgreSQL Row-Level Exclusive Lock (FOR UPDATE)
      // Blocks concurrent transactions on the same patient account until this transaction commits.
      const lockedPatients = await tx.$queryRaw<Array<{ id: string; balance: Prisma.Decimal }>>`
        SELECT id, balance FROM "Patient" WHERE id = ${params.patientId} FOR UPDATE
      `;

      if (!lockedPatients || lockedPatients.length === 0) {
        throw new Error(`Patient '${params.patientId}' not found for financial ledger update`);
      }

      // 3. Exact Decimal arithmetic (Double-Entry Invariant: balanceAfter = currentBalance + debit - credit)
      const currentBalance = new Prisma.Decimal(lockedPatients[0].balance);
      const debit = new Prisma.Decimal(params.debit);
      const credit = new Prisma.Decimal(params.credit);

      const calculatedBalance = currentBalance.add(debit).sub(credit);
      const balanceAfter = calculatedBalance.isNegative() ? new Prisma.Decimal(0) : calculatedBalance;

      // 4. Post Financial Ledger Entry
      const newEntry = await tx.financialLedger.create({
        data: {
          patientId: params.patientId,
          transactionType: params.transactionType,
          referenceId: params.referenceId,
          debit,
          credit,
          balanceAfter,
          description: params.description,
        },
      });

      // 5. Update Patient balance atomically inside the locked transaction
      await tx.patient.update({
        where: { id: params.patientId },
        data: {
          balance: balanceAfter,
        },
      });

      return newEntry;
    };

    // If caller provided an active transaction context, execute inside it directly
    if (params.tx) {
      return await executePost(params.tx);
    }

    // Otherwise execute inside a standalone transaction with transient deadlock retry protection
    return await this.withRetry(async (tx) => {
      return await executePost(tx);
    });
  }

  /**
   * Resilient transaction runner handling transient serialization/deadlock failures (Prisma P2034 / PostgreSQL 40001).
   */
  private static async withRetry<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await prisma.$transaction(fn, {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        });
      } catch (error: any) {
        attempt++;
        const isTransient =
          error?.code === 'P2034' ||
          error?.message?.includes('deadlock') ||
          error?.message?.includes('serialization');

        if (isTransient && attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, 50 * Math.pow(2, attempt)));
          continue;
        }
        throw error;
      }
    }
  }
}
