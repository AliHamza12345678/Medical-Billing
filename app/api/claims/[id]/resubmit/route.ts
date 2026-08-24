import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ApiError } from '@/lib/server/errors/api-error';
import { ClaimScrubber } from '@/lib/server/scrubbing/claim-scrubber';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'claims.edit');
    const claim = await prisma.claim.findUnique({
      where: { id: params.id },
      include: { lines: true },
    });

    if (!claim || claim.isDeleted) {
      throw ApiError.notFound(`Claim '${params.id}' not found`);
    }

    if (claim.status === 'Paid') {
      throw ApiError.badRequest(`Paid claim ${claim.claimNumber} cannot be resubmitted`);
    }

    // Idempotency check: prevent duplicate resubmission within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentResubmission = await prisma.claimTimelineEvent.findFirst({
      where: {
        claimId: claim.id,
        event: { contains: 'Resubmitted' },
        date: { gte: fiveMinutesAgo },
      },
    });

    if (recentResubmission) {
      throw ApiError.conflict(
        `Claim ${claim.claimNumber} was already resubmitted recently. Please wait before attempting another resubmission.`
      );
    }

    // Scrub claim prior to resubmission
    const scrubResult = await ClaimScrubber.scrubClaim(claim.id);
    if (scrubResult.status === 'ERRORS') {
      throw ApiError.badRequest(`Resubmission blocked by scrubbing errors: ${scrubResult.errors.join('; ')}`);
    }

    const resubmissionRef = `RESUB-837-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const updated = await tx.claim.update({
        where: { id: params.id },
        data: {
          status: 'Submitted',
          submissionDate: new Date(),
        },
      });

      await tx.claimTimelineEvent.create({
        data: {
          claimId: claim.id,
          date: new Date(),
          event: 'Claim Resubmitted to Clearinghouse',
          description: `Electronic replacement/corrected 837 claim file submitted to ${claim.insuranceProvider} (Ref: ${resubmissionRef})`,
          actor: session.name,
          type: 'submission',
        },
      });

      return updated;
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Claims',
      resource: `Claim: ${claim.claimNumber}`,
      details: `Resubmitted claim ${claim.claimNumber} to ${claim.insuranceProvider} (Ref: ${resubmissionRef})`,
    });

    return apiResponse({
      claim: updatedClaim,
      resubmissionRef,
      message: `Claim ${claim.claimNumber} resubmitted successfully`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
