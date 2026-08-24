import { prisma } from '@/lib/db';
import { ApiError } from '../errors/api-error';
import { FinancialLedgerService } from '../ledger/financial-ledger';
import { AuditLogger } from '../audit/audit-logger';
import { IdGeneratorService } from '../db/id-generator';
import { Logger } from '../logging/logger';
import { ClaimStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface CasAdjustment {
  groupCode: string;
  reasonCode: string;
  amount: number;
}

export interface ParsedClaimRemittance {
  claimNumber: string;
  payerClaimControlNumber?: string;
  statusCode: string;
  billedAmount: number;
  paidAmount: number;
  patientResponsibility: number;
  adjustments: CasAdjustment[];
}

export interface ParsedEra835 {
  traceNumber: string;
  checkDate?: string;
  totalPayerPayment: number;
  payerName: string;
  payeeNpi?: string;
  claims: ParsedClaimRemittance[];
}

export interface EraPostingAllocationResult {
  traceNumber: string;
  totalPayerPayment: number;
  payerName: string;
  processedCount: number;
  matchedCount: number;
  unmatchedCount: number;
  duplicateRejected: boolean;
  allocations: {
    claimId?: string;
    claimNumber: string;
    patientName?: string;
    matchStatus: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'UNMATCHED';
    billedAmount: number;
    paidAmount: number;
    contractualAdjustment: number;
    patientResponsibility: number;
    status: string;
    paymentId?: string;
  }[];
  processedAt: Date;
}

export class Era835Processor {
  /**
   * Parses raw ANSI X12 835 ERA payload into structured remittance model.
   */
  static parse835Payload(ediPayload: string): ParsedEra835 {
    const rawSegments = ediPayload.replace(/\r/g, '').split(/~|\n/).map((s) => s.trim()).filter(Boolean);

    let traceNumber = `TRN-${Date.now()}`;
    let totalPayerPayment = 0;
    let payerName = 'UNKNOWN PAYER';
    let payeeNpi = '';
    const claims: ParsedClaimRemittance[] = [];

    let currentClaim: ParsedClaimRemittance | null = null;

    for (const segment of rawSegments) {
      const parts = segment.split('*');
      const tag = parts[0];

      if (tag === 'TRN') {
        if (parts[2]) traceNumber = parts[2].replace('~', '');
      } else if (tag === 'BPR') {
        if (parts[2]) totalPayerPayment = parseFloat(parts[2] || '0');
      } else if (tag === 'N1') {
        if (parts[1] === 'PR' && parts[2]) payerName = parts[2].replace('~', '');
        if (parts[1] === 'PE' && parts[4]) payeeNpi = parts[4].replace('~', '');
      } else if (tag === 'CLP') {
        if (currentClaim) {
          claims.push(currentClaim);
        }
        currentClaim = {
          claimNumber: parts[1] || '',
          statusCode: parts[2] || '1',
          billedAmount: parseFloat(parts[3] || '0'),
          paidAmount: parseFloat(parts[4] || '0'),
          patientResponsibility: parseFloat(parts[5] || '0'),
          payerClaimControlNumber: parts[7] ? parts[7].replace('~', '') : undefined,
          adjustments: [],
        };
      } else if (tag === 'CAS' && currentClaim) {
        const groupCode = parts[1] || 'OA';
        for (let i = 2; i < parts.length; i += 3) {
          if (parts[i] && parts[i + 1]) {
            const reasonCode = parts[i];
            const amount = parseFloat(parts[i + 1] || '0');
            if (amount > 0) {
              currentClaim.adjustments.push({ groupCode, reasonCode, amount });
            }
          }
        }
      }
    }

    if (currentClaim) {
      claims.push(currentClaim);
    }

    return {
      traceNumber,
      totalPayerPayment,
      payerName,
      payeeNpi,
      claims,
    };
  }

  /**
   * Parses and posts ERA 835 remittance data atomically to claims, payments, and financial ledgers.
   */
  static async processAndPost835ERA(
    ediPayload: string,
    userId = 'system-worker',
    userName = 'ERA Processing Worker'
  ): Promise<EraPostingAllocationResult> {
    const parsed = this.parse835Payload(ediPayload);

    Logger.info(
      `[ERA_835] Processing ERA remittance '${parsed.traceNumber}' from '${parsed.payerName}' (${parsed.claims.length} claims, Total: $${parsed.totalPayerPayment.toFixed(2)})`
    );

    // 1. Idempotency Check: Reject duplicate ERA trace numbers
    const existingPayment = await prisma.payment.findFirst({
      where: {
        reference: parsed.traceNumber,
        type: 'Insurance',
        isDeleted: false,
      },
    });

    if (existingPayment) {
      Logger.warn(`[ERA_835] Duplicate ERA trace number '${parsed.traceNumber}' detected. Skipping re-posting.`);
      return {
        traceNumber: parsed.traceNumber,
        totalPayerPayment: parsed.totalPayerPayment,
        payerName: parsed.payerName,
        processedCount: 0,
        matchedCount: 0,
        unmatchedCount: parsed.claims.length,
        duplicateRejected: true,
        allocations: [],
        processedAt: new Date(),
      };
    }

    const allocations: EraPostingAllocationResult['allocations'] = [];
    let matchedCount = 0;
    let unmatchedCount = 0;

    for (const claimRem of parsed.claims) {
      // 2. Strict Claim Identification (No arbitrary or fuzzy selection)
      const claim = await prisma.claim.findFirst({
        where: {
          OR: [
            { claimNumber: claimRem.claimNumber },
            { id: claimRem.claimNumber },
          ],
          isDeleted: false,
        },
        include: { patient: true },
      });

      if (!claim) {
        Logger.warn(`[ERA_835] Claim '${claimRem.claimNumber}' UNMATCHED in database. Routing to unapplied remittance queue.`);
        unmatchedCount++;
        allocations.push({
          claimNumber: claimRem.claimNumber,
          matchStatus: 'UNMATCHED',
          billedAmount: claimRem.billedAmount,
          paidAmount: claimRem.paidAmount,
          contractualAdjustment: 0,
          patientResponsibility: claimRem.patientResponsibility,
          status: 'Unmatched',
        });
        continue;
      }

      matchedCount++;

      // Calculate Adjustments
      const contractualAdjustment = claimRem.adjustments
        .filter((a) => a.groupCode === 'CO')
        .reduce((sum, a) => sum + a.amount, 0);

      const patientResponsibility = claimRem.adjustments
        .filter((a) => a.groupCode === 'PR')
        .reduce((sum, a) => sum + a.amount, 0) || claimRem.patientResponsibility;

      // 3. Atomic Database Transaction Execution
      const postingResult = await prisma.$transaction(async (tx) => {
        const paymentNumber = await IdGeneratorService.generatePaymentNumber(tx);
        const patientName = claim.patientName;

        const pmtMethod: PaymentMethod = PaymentMethod.ACH;
        const pmtStatus: PaymentStatus = claimRem.paidAmount > 0 ? PaymentStatus.Paid : PaymentStatus.Failed;

        // Create Payment Record
        const payment = await tx.payment.create({
          data: {
            paymentNumber,
            patientId: claim.patientId,
            patientName,
            amount: claimRem.paidAmount,
            method: pmtMethod,
            status: pmtStatus,
            date: new Date(),
            appliedTo: `Claim: ${claim.claimNumber}`,
            reference: parsed.traceNumber,
            type: 'Insurance',
          },
        });

        // Post Financial Ledger Entry (updates patient balance atomically inside tx)
        const creditTotal = claimRem.paidAmount + contractualAdjustment;
        if (creditTotal > 0) {
          await FinancialLedgerService.postEntry({
            patientId: claim.patientId,
            transactionType: 'PAYMENT',
            referenceId: paymentNumber,
            debit: 0,
            credit: creditTotal,
            description: `Insurance ERA Payment ${parsed.traceNumber} (${parsed.payerName})`,
            tx,
          });
        }

        // Determine updated Claim Status
        let newStatus: ClaimStatus = claim.status;
        const totalCredited = Number(claim.paidAmount) + claimRem.paidAmount + contractualAdjustment;
        if (totalCredited >= Number(claim.billedAmount)) {
          newStatus = ClaimStatus.Paid;
        } else if (claimRem.paidAmount === 0 && claimRem.adjustments.length > 0) {
          newStatus = ClaimStatus.Denied;
        } else {
          newStatus = ClaimStatus.Submitted;
        }

        const newPaidAmount = Number(claim.paidAmount) + claimRem.paidAmount;

        // Update Claim Record
        const updatedClaim = await tx.claim.update({
          where: { id: claim.id },
          data: {
            status: newStatus,
            paidAmount: newPaidAmount,
          },
        });

        // Record Claim Timeline Event
        await tx.claimTimelineEvent.create({
          data: {
            claimId: claim.id,
            date: new Date(),
            event: claimRem.paidAmount > 0 ? 'ERA Payment Allocated' : 'ERA Claim Denial Posted',
            description: `Processed 835 ERA remittance from ${parsed.payerName} (Ref: ${parsed.traceNumber}, Paid: $${claimRem.paidAmount.toFixed(2)}, Contractual Adj: $${contractualAdjustment.toFixed(2)})`,
            actor: userName,
            type: claimRem.paidAmount > 0 ? 'payment' : 'denial',
          },
        });

        // Write Immutable Compliance Audit Log inside Transaction
        await AuditLogger.logTx(tx, {
          userId,
          userName,
          action: 'Update',
          module: 'ERAProcessing',
          resource: `Claim: ${claim.claimNumber}`,
          details: `Posted ERA 835 payment of $${claimRem.paidAmount.toFixed(2)} with $${contractualAdjustment.toFixed(2)} contractual adjustment (Ref: ${parsed.traceNumber})`,
        });

        return { payment, updatedClaim };
      });

      const isExactBilled = Math.abs(Number(claim.billedAmount) - claimRem.billedAmount) < 0.01;

      allocations.push({
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        patientName: claim.patientName,
        matchStatus: isExactBilled ? 'EXACT_MATCH' : 'PARTIAL_MATCH',
        billedAmount: Number(claim.billedAmount),
        paidAmount: claimRem.paidAmount,
        contractualAdjustment,
        patientResponsibility,
        status: postingResult.updatedClaim.status,
        paymentId: postingResult.payment.id,
      });
    }

    return {
      traceNumber: parsed.traceNumber,
      totalPayerPayment: parsed.totalPayerPayment,
      payerName: parsed.payerName,
      processedCount: parsed.claims.length,
      matchedCount,
      unmatchedCount,
      duplicateRejected: false,
      allocations,
      processedAt: new Date(),
    };
  }
}
