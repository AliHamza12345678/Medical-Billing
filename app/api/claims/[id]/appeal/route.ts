import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createAppealSchema } from '@/lib/validations/appeal';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'claims.edit');
    const claim = await prisma.claim.findUnique({ where: { id: params.id } });
    if (!claim || claim.isDeleted) {
      throw ApiError.notFound(`Claim '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = createAppealSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid appeal payload', parsed.error.flatten().fieldErrors);
    }

    const { appealReason, supportingNotes } = parsed.data;

    const appealRef = `APL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const updated = await tx.claim.update({
        where: { id: params.id },
        data: {
          status: 'Pending',
        },
      });

      await tx.claimTimelineEvent.create({
        data: {
          claimId: claim.id,
          date: new Date(),
          event: 'Claim Appeal Initiated',
          description: `Appeal ${appealRef} submitted: ${appealReason}. ${supportingNotes}`,
          actor: session.name,
          type: 'note',
        },
      });

      return updated;
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Claims',
      resource: `Appeal: ${appealRef}`,
      details: `Initiated appeal ${appealRef} for claim ${claim.claimNumber}`,
    });

    return apiResponse({
      claim: updatedClaim,
      appealRef,
      message: `Appeal ${appealRef} initiated successfully`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
