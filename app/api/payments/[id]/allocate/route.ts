import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';
import { z } from 'zod';

const allocateSchema = z.object({
  claimId: z.string().min(1, 'Target claim ID is required'),
  amount: z.number().positive('Allocation amount must be greater than $0.00'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'payments.edit');
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { allocations: true },
    });

    if (!payment || payment.isDeleted) {
      throw ApiError.notFound(`Payment '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = allocateSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid allocation payload', parsed.error.flatten().fieldErrors);
    }

    const { claimId, amount } = parsed.data;

    // Calculate unallocated payment balance
    const totalAllocated = payment.allocations.reduce((sum, a) => sum + Number(a.amount), 0);
    const unallocatedBalance = Number(payment.amount) - totalAllocated;

    if (amount > unallocatedBalance) {
      throw ApiError.badRequest(
        `Allocation amount ($${amount.toFixed(2)}) exceeds unallocated payment balance ($${unallocatedBalance.toFixed(2)})`
      );
    }

    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim || claim.isDeleted) {
      throw ApiError.notFound(`Claim '${claimId}' not found for allocation`);
    }

    // Reject cross-patient payment allocation
    if (claim.patientId !== payment.patientId) {
      throw ApiError.badRequest('Cannot allocate payment to a claim belonging to a different patient');
    }

    const claimBalance = Number(claim.billedAmount) - Number(claim.paidAmount);
    if (amount > claimBalance) {
      throw ApiError.badRequest(
        `Allocation amount ($${amount.toFixed(2)}) exceeds target claim balance ($${claimBalance.toFixed(2)})`
      );
    }

    // Execute atomic transaction for allocation creation & claim update
    const result = await prisma.$transaction(async (tx) => {
      const allocation = await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          claimId: claim.id,
          amount,
        },
      });

      const newClaimPaidAmount = Number(claim.paidAmount) + amount;
      const isFullyPaid = newClaimPaidAmount >= Number(claim.billedAmount);

      await tx.claim.update({
        where: { id: claim.id },
        data: {
          paidAmount: newClaimPaidAmount,
          status: isFullyPaid ? 'Paid' : 'Pending',
        },
      });

      await tx.claimTimelineEvent.create({
        data: {
          claimId: claim.id,
          date: new Date(),
          event: 'Payment Allocated',
          description: `Allocated $${amount.toFixed(2)} from payment ${payment.paymentNumber}`,
          actor: session.name,
          type: 'payment',
        },
      });

      return allocation;
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Payments',
      resource: `Allocation: ${result.id}`,
      details: `Allocated $${amount.toFixed(2)} from payment ${payment.paymentNumber} to claim ${claim.claimNumber}`,
    });

    return apiResponse(result, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
