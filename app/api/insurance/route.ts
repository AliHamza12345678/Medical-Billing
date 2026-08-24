import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'insurance.view');
    const providers = await prisma.insuranceProvider.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' },
    });

    return apiResponse(providers, {
      total: providers.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
