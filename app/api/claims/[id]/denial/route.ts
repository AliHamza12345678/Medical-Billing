import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { recordDenialSchema } from '@/lib/validations/denial';
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
    const parsed = recordDenialSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid denial payload', parsed.error.flatten().fieldErrors);
    }

    const { denialCode, deniedReason, denialType, source } = parsed.data;

    const newStatus = denialType === 'Technical Rejection' ? 'Rejected' : 'Denied';

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const updated = await tx.claim.update({
        where: { id: params.id },
        data: {
          status: newStatus as any,
          deniedReason: `[${denialCode}] ${deniedReason}`,
        },
      });

      await tx.claimTimelineEvent.create({
        data: {
          claimId: claim.id,
          date: new Date(),
          event: `Claim ${newStatus}: Code ${denialCode}`,
          description: `${denialType} from ${source}: ${deniedReason}`,
          actor: session.name,
          type: 'denial',
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
      details: `Recorded ${denialType} for claim ${claim.claimNumber} (Code: ${denialCode})`,
    });

    return apiResponse(updatedClaim);
  } catch (error) {
    return handleApiError(error);
  }
}
