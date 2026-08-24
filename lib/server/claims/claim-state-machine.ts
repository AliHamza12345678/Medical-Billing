import { prisma } from '@/lib/db';
import { ClaimStatus } from '@/types';
import { ApiError } from '../errors/api-error';
import { AuditLogger } from '../audit/audit-logger';

export type ExtendedClaimStatus = ClaimStatus | 'Draft' | 'Ready' | 'Appealed' | 'Resubmitted';

export class ClaimStateMachine {
  private static allowedTransitions: Record<string, string[]> = {
    Draft: ['Ready', 'Submitted'],
    Ready: ['Submitted', 'Draft'],
    Submitted: ['Pending', 'Paid', 'Denied', 'Rejected'],
    Pending: ['Paid', 'Denied', 'Rejected'],
    Denied: ['Appealed', 'Resubmitted'],
    Rejected: ['Resubmitted', 'Draft'],
    Appealed: ['Submitted', 'Pending', 'Paid', 'Denied'],
    Resubmitted: ['Submitted', 'Pending', 'Paid'],
    Paid: [], // Final state
  };

  static async transitionState(
    claimId: string,
    targetStatus: ExtendedClaimStatus,
    reason: string,
    userId: string,
    userName: string
  ) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
    });

    if (!claim || claim.isDeleted) {
      throw ApiError.notFound(`Claim '${claimId}' not found`);
    }

    const currentStatus = claim.status as string;
    const allowed = this.allowedTransitions[currentStatus] || [];

    if (!allowed.includes(targetStatus)) {
      throw ApiError.businessRuleViolation(
        `Invalid claim transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions: ${allowed.join(', ') || 'None'}`
      );
    }

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const updated = await tx.claim.update({
        where: { id: claimId },
        data: {
          status: targetStatus as any,
          ...(targetStatus === 'Paid' ? { paidAmount: claim.billedAmount } : {}),
        },
      });

      await tx.claimTimelineEvent.create({
        data: {
          claimId: claim.id,
          date: new Date(),
          event: `Status Transition: ${currentStatus} -> ${targetStatus}`,
          description: reason,
          actor: userName,
          type: 'status_change',
        },
      });

      return updated;
    });

    await AuditLogger.log({
      userId,
      userName,
      action: 'Update',
      module: 'Claims',
      resource: `Claim: ${claim.claimNumber}`,
      details: `Transitioned claim ${claim.claimNumber} from ${currentStatus} to ${targetStatus} (${reason})`,
    });

    return updatedClaim;
  }
}
