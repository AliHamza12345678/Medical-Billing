import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ApiError } from '@/lib/server/errors/api-error';
import { ClaimScrubber } from '@/lib/server/scrubbing/claim-scrubber';
import { AuditLogger } from '@/lib/server/audit/audit-logger';
import { QueueManager } from '@/lib/server/queues/queue-manager';
import { WorkerProcessor } from '@/lib/server/workers/worker-processor';

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

    // State machine validation: cannot re-submit paid claims
    if (claim.status === 'Paid') {
      throw ApiError.badRequest(`Claim ${claim.claimNumber} is already paid and cannot be submitted again`);
    }

    // Pre-Submission Claim Scrubbing Engine
    const scrubResult = await ClaimScrubber.scrubClaim(claim.id);
    if (scrubResult.status === 'ERRORS') {
      await AuditLogger.log({
        userId: session.id,
        userName: session.name,
        action: 'Update',
        module: 'Claims',
        resource: `Claim: ${claim.claimNumber}`,
        details: `Claim submission blocked due to scrubbing errors: ${scrubResult.errors.join('; ')}`,
      });

      throw ApiError.badRequest(`Claim scrubbing failed: ${scrubResult.errors.join('; ')}`);
    }

    const idempotencyKey = `submit-claim-837-${claim.id}-${claim.updatedAt.getTime()}`;

    // Enqueue 837 claim submission job to BullMQ durable queue
    const enqueueResult = await QueueManager.enqueue(
      'claims',
      'submit-claim-837',
      {
        claimId: claim.id,
        userId: session.id,
        userName: session.name,
      },
      idempotencyKey
    );

    if (enqueueResult.status === 'duplicate') {
      throw ApiError.conflict(`Claim ${claim.claimNumber} submission is already in progress`);
    }

    // Execute inline processing for immediate response & testing guarantees
    const processResult = await WorkerProcessor.processJob({
      jobId: enqueueResult.jobId,
      queueName: 'claims',
      action: 'submit-claim-837',
      payload: {
        claimId: claim.id,
        userId: session.id,
        userName: session.name,
      },
      attempts: 1,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      idempotencyKey,
    });

    if (!processResult.success) {
      throw ApiError.badRequest(processResult.error || 'Claim EDI transmission failed');
    }

    const updatedClaim = await prisma.claim.findUnique({
      where: { id: claim.id },
    });

    return apiResponse({
      claim: updatedClaim,
      jobId: enqueueResult.jobId,
      transactionResult: processResult.result,
      scrubResult,
      message: `Claim ${claim.claimNumber} submitted successfully via EDI 837`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
