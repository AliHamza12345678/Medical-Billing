import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ApiError } from '@/lib/server/errors/api-error';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'payments.view');
    const rfd = await prisma.refund.findUnique({
      where: { id: params.id },
      include: { patient: true, payment: true },
    });

    if (!rfd) {
      throw ApiError.notFound(`Refund record '${params.id}' not found`);
    }

    return apiResponse({
      id: rfd.id,
      refundNumber: rfd.refundNumber,
      patientId: rfd.patientId,
      patientName: `${rfd.patient.firstName} ${rfd.patient.lastName}`,
      amount: Number(rfd.amount),
      reason: rfd.reason,
      status: rfd.status,
      method: rfd.payment?.method || 'EFT',
      date: rfd.date.toISOString().split('T')[0],
      processedBy: rfd.processedBy,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
