import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createAdjustmentSchema } from '@/lib/validations/adjustment';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';
import { IdGeneratorService } from '@/lib/server/db/id-generator';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'payments.view');
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let dbAdjustments = await prisma.adjustment.findMany({
      orderBy: { date: 'desc' },
    });

    if (type && type !== 'all') {
      dbAdjustments = dbAdjustments.filter((a) => a.type === type);
    }

    if (search) {
      dbAdjustments = dbAdjustments.filter(
        (a) =>
          a.adjustmentNumber.toLowerCase().includes(search) ||
          a.patientName.toLowerCase().includes(search) ||
          a.claimNumber.toLowerCase().includes(search) ||
          a.reason.toLowerCase().includes(search)
      );
    }

    const formatted = dbAdjustments.map((a) => ({
      ...a,
      date: a.date.toISOString().split('T')[0],
      amount: Number(a.amount),
    }));

    return apiResponse(formatted, {
      total: formatted.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'payments.edit');
    const body = await req.json();

    const parsed = createAdjustmentSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid adjustment payload', parsed.error.flatten().fieldErrors);
    }

    const {
      patientName,
      claimId,
      claimNumber,
      type,
      reason,
      amount,
      date,
    } = parsed.data;

    const newAdjustment = await prisma.$transaction(async (tx) => {
      const adjustmentNumber =
        parsed.data.adjustmentNumber || (await IdGeneratorService.generateAdjustmentNumber(tx));

      const adj = await tx.adjustment.create({
        data: {
          adjustmentNumber,
          patientName,
          claimNumber,
          type,
          reason,
          amount,
          date: new Date(date),
          postedBy: session.name,
        },
      });

      // Register timeline event on affected claim
      if (claimId) {
        const claim = await tx.claim.findUnique({ where: { id: claimId } });
        if (claim) {
          await tx.claimTimelineEvent.create({
            data: {
              claimId: claim.id,
              date: new Date(),
              event: `Adjustment Posted: ${type}`,
              description: `[${adjustmentNumber}] $${amount.toFixed(2)} — ${reason}`,
              actor: session.name,
              type: 'note',
            },
          });
        }
      }

      return adj;
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Payments',
      resource: `Adjustment: ${newAdjustment.adjustmentNumber}`,
      details: `Posted ${type} adjustment ${newAdjustment.adjustmentNumber} of $${amount.toFixed(2)} for claim ${claimNumber} (${reason})`,
    });

    return apiResponse(newAdjustment, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
