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
    await requirePermission(req, 'insurance.view');
    const record = await prisma.eligibilityVerification.findUnique({ where: { id: params.id } });
    if (!record) {
      throw ApiError.notFound(`Eligibility verification record '${params.id}' not found`);
    }

    return apiResponse({
      ...record,
      verificationDate: record.verificationDate.toISOString().split('T')[0],
      copay: Number(record.copay),
      deductibleRemaining: Number(record.deductibleRemaining),
      coveragePercent: Number(record.coveragePercent),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
