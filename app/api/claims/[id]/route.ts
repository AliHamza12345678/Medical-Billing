import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { updateClaimSchema } from '@/lib/validations/claim';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'claims.view');
    let dbClaim = await prisma.claim.findUnique({
      where: { id: params.id },
      include: { lines: true, timeline: { orderBy: { date: 'desc' } } },
    });

    if (!dbClaim || dbClaim.isDeleted) {
      throw ApiError.notFound(`Claim '${params.id}' not found`);
    }

    return apiResponse({
      ...dbClaim,
      serviceDate: dbClaim.serviceDate.toISOString().split('T')[0],
      submissionDate: dbClaim.submissionDate.toISOString().split('T')[0],
      billedAmount: Number(dbClaim.billedAmount),
      paidAmount: Number(dbClaim.paidAmount),
      patientResponsibility: Number(dbClaim.patientResponsibility),
      lines: dbClaim.lines.map((l) => ({
        ...l,
        unitCharge: Number(l.unitCharge),
        totalCharge: Number(l.totalCharge),
        allowedAmount: Number(l.allowedAmount),
        paidAmount: Number(l.paidAmount),
      })),
      timeline: dbClaim.timeline.map((t) => ({
        ...t,
        date: t.date.toISOString(),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
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
    const parsed = updateClaimSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid claim update payload', parsed.error.flatten().fieldErrors);
    }

    const { status, paidAmount, patientResponsibility, deniedReason } = parsed.data;

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const updated = await tx.claim.update({
        where: { id: params.id },
        data: {
          ...(status ? { status: status as any } : {}),
          ...(paidAmount !== undefined ? { paidAmount } : {}),
          ...(patientResponsibility !== undefined ? { patientResponsibility } : {}),
          ...(deniedReason ? { deniedReason } : {}),
        },
      });

      if (status && status !== claim.status) {
        let eventName = `Claim Status: ${status}`;
        let eventType: 'submission' | 'status' | 'payment' | 'note' | 'denial' = 'status';

        if (status === 'Paid') {
          eventName = 'Claim Paid';
          eventType = 'payment';
          const paymentAmount = paidAmount !== undefined ? paidAmount : (Number(claim.billedAmount) || 0);

          await tx.payment.create({
            data: {
              paymentNumber: `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
              patientId: claim.patientId,
              patientName: claim.patientName,
              amount: paymentAmount,
              method: 'Insurance',
              status: 'Paid',
              date: new Date(),
              appliedTo: claim.claimNumber,
              reference: 'ERA-835-PAYMENT',
              type: 'Insurance Payment',
            },
          });
        } else if (status === 'Denied' || status === 'Rejected') {
          eventName = 'Claim Denied';
          eventType = 'denial';
        }

        await tx.claimTimelineEvent.create({
          data: {
            claimId: claim.id,
            date: new Date(),
            event: eventName,
            description: deniedReason || `Claim status updated to ${status}`,
            actor: session.name,
            type: eventType,
          },
        });
      }

      return updated;
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Claims',
      resource: `Claim: ${claim.claimNumber}`,
      details: `Updated claim ${claim.claimNumber} status to ${updatedClaim.status}`,
    });

    return apiResponse(updatedClaim);
  } catch (error) {
    return handleApiError(error);
  }
}
