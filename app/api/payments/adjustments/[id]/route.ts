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
    const adj = await prisma.adjustment.findUnique({ where: { id: params.id } });
    if (!adj) {
      throw ApiError.notFound(`Adjustment record '${params.id}' not found`);
    }

    return apiResponse({
      ...adj,
      date: adj.date.toISOString().split('T')[0],
      amount: Number(adj.amount),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
